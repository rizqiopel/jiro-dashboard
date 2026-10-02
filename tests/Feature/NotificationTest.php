<?php

namespace Tests\Feature;

use App\Actions\NotifyWorkspaceActivity;
use App\Models\User;
use App\Notifications\WorkspaceActivity;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function user(string $role = 'Viewer'): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function notify(User $user): string
    {
        $user->notify(new WorkspaceActivity('project.updated', 'project', 8, ['status']));

        return $user->notifications()->firstOrFail()->id;
    }

    public function test_project_events_reach_only_other_active_verified_permitted_users_and_are_secret_minimal(): void
    {
        $admin = $this->user('Admin');
        $viewer = $this->user();
        $editor = $this->user('Editor');
        $unverified = $this->user();
        $unverified->email_verified_at = null;
        $unverified->save();
        $inactive = $this->user();
        $inactive->is_active = false;
        $inactive->save();
        $noPermission = User::factory()->create();
        $this->actingAs($admin)->post(route('projects.store'), ['name' => 'Secret name', 'description' => 'Sensitive description', 'status' => 'active'])->assertRedirect();
        foreach ([$viewer, $editor] as $recipient) {
            $this->assertSame(1, $recipient->notifications()->count());
        }
        foreach ([$admin, $inactive, $unverified, $noPermission] as $excluded) {
            $this->assertSame(0, $excluded->notifications()->count());
        }
        $json = DB::table('notifications')->pluck('data')->implode('');
        $this->assertStringNotContainsString('Secret name', $json);
        $this->assertStringNotContainsString('Sensitive description', $json);
        $this->assertStringNotContainsString($admin->email, $json);
        $this->assertStringContainsString('project.created', $json);
    }

    public function test_managed_account_changes_notify_only_the_target_and_failed_or_noop_writes_do_not_notify(): void
    {
        $admin = $this->user('Admin');
        $other = $this->user();
        $this->actingAs($admin)->post(route('users.store'), ['name' => 'New user', 'email' => 'new@example.test', 'role' => 'Viewer', 'is_active' => true])->assertRedirect();
        $target = User::where('email', 'new@example.test')->firstOrFail();
        $this->assertSame(1, $target->notifications()->count());
        $data = ['name' => $target->name, 'email' => $target->email, 'role' => 'Viewer', 'is_active' => true];
        $this->put(route('users.update', $target), $data)->assertRedirect();
        $this->assertSame(1, $target->notifications()->count());
        $this->put(route('users.update', $target), [...$data, 'role' => 'Editor'])->assertRedirect();
        $this->put(route('users.update', $target), [...$data, 'role' => 'invalid'])->assertSessionHasErrors('role');
        $this->assertSame(2, $target->notifications()->count());
        $this->assertSame(0, $other->notifications()->count());
        $this->assertSame(0, $admin->notifications()->count());
    }

    public function test_list_count_read_idempotence_read_all_and_delete_are_scoped_to_the_current_account(): void
    {
        $user = $this->user();
        $other = $this->user();
        $id = $this->notify($user);
        $foreignId = $this->notify($other);
        $this->actingAs($user)->get(route('notifications.index'))->assertInertia(fn (AssertableInertia $page) => $page->component('notifications/index')->where('notifications.total', 1)->where('unreadNotificationCount', 1)->missing('notifications.data.0.notifiable_id')->missing('notifications.data.0.type'));
        $this->get(route('notifications.index', ['status' => 'unread']))->assertInertia(fn (AssertableInertia $page) => $page->where('notifications.total', 1));
        $this->patch(route('notifications.read', $foreignId))->assertNotFound();
        $this->delete(route('notifications.destroy', $foreignId))->assertNotFound();
        $this->patch(route('notifications.read', $id))->assertRedirect();
        $readAt = $user->notifications()->findOrFail($id)->read_at;
        $this->travel(2)->minutes();
        $this->patch(route('notifications.read', $id))->assertRedirect();
        $this->assertEquals($readAt, $user->notifications()->findOrFail($id)->read_at);
        $this->get(route('notifications.index', ['status' => 'read']))->assertInertia(fn (AssertableInertia $page) => $page->where('notifications.total', 1)->where('unreadNotificationCount', 0));
        $this->notify($user);
        $this->post(route('notifications.read-all'))->assertRedirect(route('notifications.index'));
        $this->assertSame(0, $user->unreadNotifications()->count());
        $this->assertSame(1, $other->unreadNotifications()->count());
        $this->delete(route('notifications.destroy', $id))->assertRedirect();
        $this->assertDatabaseMissing('notifications', ['id' => $id]);
        $this->assertDatabaseHas('notifications', ['id' => $foreignId]);
    }

    public function test_guest_unverified_and_inactive_accounts_cannot_access_notification_endpoints(): void
    {
        $user = $this->user();
        $id = $this->notify($user);
        $endpoints = [['get', route('notifications.index')], ['patch', route('notifications.read', $id)], ['post', route('notifications.read-all')], ['delete', route('notifications.destroy', $id)]];
        foreach ($endpoints as [$method, $url]) {
            $this->$method($url)->assertRedirect(route('login'));
        }
        $user->email_verified_at = null;
        $user->save();
        foreach ($endpoints as [$method, $url]) {
            $this->actingAs($user)->$method($url)->assertRedirect(route('verification.notice'));
        }
        $user->is_active = false;
        $user->save();
        foreach ($endpoints as [$method, $url]) {
            $this->actingAs($user)->$method($url)->assertRedirect(route('login'));
        }
        $this->assertDatabaseHas('notifications', ['id' => $id, 'read_at' => null]);
    }

    public function test_notification_failure_rolls_back_project_and_audit_rows(): void
    {
        $admin = $this->user('Admin');
        $this->mock(NotifyWorkspaceActivity::class)->shouldReceive('send')->once()->andThrow(new \RuntimeException('Notifications unavailable'));
        $this->withoutExceptionHandling();
        try {
            $this->actingAs($admin)->post(route('projects.store'), ['name' => 'Rollback', 'status' => 'active']);
            $this->fail('Expected notification failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Notifications unavailable', $exception->getMessage());
        }
        $this->assertDatabaseCount('projects', 0);
        $this->assertDatabaseCount('activity_logs', 0);
        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_pagination_empty_invalid_filters_and_missing_ids_are_safe(): void
    {
        $user = $this->user();
        for ($index = 0; $index < 12; $index++) {
            $this->notify($user);
        }
        $this->actingAs($user)->get(route('notifications.index', ['page' => 2]))->assertInertia(fn (AssertableInertia $page) => $page->has('notifications.data', 2)->where('notifications.total', 12));
        $this->get(route('notifications.index', ['page' => 999]))->assertRedirect();
        $this->get(route('notifications.index', ['status' => 'read']))->assertInertia(fn (AssertableInertia $page) => $page->where('notifications.total', 0));
        $this->get(route('notifications.index', ['status' => ['bad']]))->assertRedirect(route('notifications.index'))->assertSessionHasErrors('status');
        $this->patch(route('notifications.read', 'not-a-uuid'))->assertNotFound();
        $this->delete(route('notifications.destroy', '00000000-0000-4000-8000-000000000000'))->assertNotFound();
    }

    public function test_password_link_success_notifies_target_once_without_token_and_profile_deletion_cleans_inbox(): void
    {
        Mail::fake();
        $admin = $this->user('Admin');
        $target = $this->user();
        $this->actingAs($admin)->post(route('users.reset-password', $target))->assertRedirect();
        $this->post(route('users.reset-password', $target))->assertRedirect();
        $this->assertSame(1, $target->notifications()->count());
        $data = $target->notifications()->firstOrFail()->data;
        $this->assertSame(['event' => 'user.password-link-sent', 'subject_type' => 'user', 'subject_id' => $target->id, 'changed_fields' => []], $data);
        $this->actingAs($target)->delete(route('profile.destroy'), ['password' => 'password'])->assertRedirect();
        $this->assertDatabaseCount('notifications', 0);
    }
}
