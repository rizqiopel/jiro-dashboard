<?php

namespace Tests\Feature;

use App\Actions\RecordActivity;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('Admin');
        $this->actingAs($user);

        return $user;
    }

    public function test_activity_is_permission_and_verification_protected_and_read_only(): void
    {
        $this->get(route('activity.index'))->assertRedirect(route('login'));
        foreach (['Viewer', 'Editor'] as $role) {
            $user = User::factory()->create();
            $user->assignRole($role);
            $this->actingAs($user)->get(route('activity.index'))->assertForbidden();
        }
        $user = User::factory()->unverified()->create();
        $user->assignRole('Admin');
        $this->actingAs($user)->get(route('activity.index'))->assertRedirect(route('verification.notice'));
        $this->admin();
        $this->get(route('activity.index'))->assertOk();
        $this->delete('/activity-log/1')->assertNotFound();
    }

    public function test_project_mutations_record_actor_fields_and_deleted_resource_without_values(): void
    {
        $actor = $this->admin();
        $this->post(route('projects.store'), ['name' => 'Private name', 'description' => 'secret content', 'status' => 'active'])->assertRedirect();
        $project = Project::firstOrFail();
        $this->put(route('projects.update', $project), ['name' => 'Updated', 'description' => 'secret content', 'status' => 'active'])->assertRedirect();
        $this->put(route('projects.update', $project), ['name' => 'Updated', 'description' => 'secret content', 'status' => 'active'])->assertRedirect();
        $this->delete(route('projects.destroy', $project))->assertRedirect();
        $this->assertDatabaseCount('activity_logs', 3);
        $this->assertDatabaseHas('activity_logs', ['event' => 'project.deleted', 'actor_id' => $actor->id, 'subject_id' => $project->id]);
        $this->assertSame(['name'], ActivityLog::where('event', 'project.updated')->firstOrFail()->getAttribute('changed_fields'));
        $this->assertStringNotContainsString('secret content', ActivityLog::all()->toJson());
        $this->assertStringNotContainsString('Private name', ActivityLog::all()->toJson());
    }

    public function test_managed_users_profile_and_password_links_record_only_safe_metadata(): void
    {
        $this->admin();
        Notification::fake();
        $this->post(route('users.store'), ['name' => 'Person', 'email' => 'person@example.test', 'role' => 'Viewer', 'is_active' => true])->assertRedirect();
        $user = User::where('email', 'person@example.test')->firstOrFail();
        $this->put(route('users.update', $user), ['name' => $user->name, 'email' => $user->email, 'role' => 'Editor', 'is_active' => true])->assertRedirect();
        $this->post(route('users.reset-password', $user))->assertRedirect();
        $this->post(route('users.reset-password', $user))->assertRedirect();
        $this->assertDatabaseCount('activity_logs', 3);
        $this->assertSame(['role'], ActivityLog::where('event', 'user.updated')->firstOrFail()->getAttribute('changed_fields'));
        $this->assertSame([], ActivityLog::where('event', 'user.password-link-sent')->firstOrFail()->getAttribute('changed_fields'));
        $user->markEmailAsVerified();
        $this->actingAs($user)->patch(route('profile.update'), ['name' => 'New name', 'email' => $user->email])->assertRedirect();
        $this->delete(route('profile.destroy'), ['password' => 'password'])->assertSessionHasErrors('password');
        $user->password = 'password';
        $user->save();
        $this->delete(route('profile.destroy'), ['password' => 'password'])->assertRedirect();
        $this->assertDatabaseHas('activity_logs', ['event' => 'profile.deleted', 'actor_id' => null, 'subject_id' => $user->id]);
        $json = ActivityLog::all()->toJson();
        $this->assertStringNotContainsString($user->email, $json);
        $this->assertStringNotContainsString($user->password, $json);
    }

    public function test_denied_invalid_and_self_lockout_writes_do_not_emit_activity(): void
    {
        $actor = $this->admin();
        $this->put(route('users.update', $actor), ['name' => $actor->name, 'email' => $actor->email, 'role' => 'Viewer', 'is_active' => true])->assertSessionHasErrors();
        $this->post(route('projects.store'), ['name' => '', 'status' => 'invalid'])->assertSessionHasErrors();
        $viewer = User::factory()->create();
        $viewer->assignRole('Viewer');
        $this->actingAs($viewer)->post(route('projects.store'), ['name' => 'Denied', 'status' => 'active'])->assertForbidden();
        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_audit_failure_rolls_back_project_mutation(): void
    {
        $this->admin();
        $this->mock(RecordActivity::class)->shouldReceive('record')->once()->andThrow(new \RuntimeException('Audit unavailable'));
        $this->withoutExceptionHandling();
        try {
            $this->post(route('projects.store'), ['name' => 'Rolled back', 'status' => 'active']);
            $this->fail('Expected audit failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Audit unavailable', $exception->getMessage());
        }
        $this->assertDatabaseCount('projects', 0);
        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_filters_pagination_invalid_inputs_and_safe_actor_props(): void
    {
        $actor = $this->admin();
        ActivityLog::factory()->count(12)->create(['actor_id' => $actor->id]);
        ActivityLog::factory()->create(['actor_id' => $actor->id, 'event' => 'user.created', 'subject_type' => 'user', 'subject_id' => 8]);
        $this->get(route('activity.index'))->assertInertia(fn (AssertableInertia $page) => $page->component('activity/index')->where('activities.total', 13)->has('activities.data', 10)->missing('activities.data.0.actor.email')->missing('activities.data.0.actor.password'));
        $this->get(route('activity.index', ['event' => 'user.created', 'subject_type' => 'user', 'subject_id' => 8]))->assertInertia(fn (AssertableInertia $page) => $page->where('activities.total', 1));
        $this->get(route('activity.index', ['page' => 2]))->assertInertia(fn (AssertableInertia $page) => $page->has('activities.data', 3));
        $this->get(route('activity.index', ['page' => 999]))->assertRedirect();
        $this->get(route('activity.index', ['event' => ['invalid']]))->assertRedirect(route('activity.index'))->assertSessionHasErrors('event');
        $this->get(route('activity.index', ['subject_id' => -1]))->assertSessionHasErrors('subject_id');
    }

    public function test_audit_failure_rolls_back_managed_user_creation_and_role_assignment(): void
    {
        $this->admin();
        $this->mock(RecordActivity::class)->shouldReceive('record')->once()->andThrow(new \RuntimeException('Audit unavailable'));
        $this->withoutExceptionHandling();
        try {
            $this->post(route('users.store'), ['name' => 'Rollback', 'email' => 'rollback@example.test', 'role' => 'Editor', 'is_active' => true]);
            $this->fail('Expected audit failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Audit unavailable', $exception->getMessage());
        }
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('model_has_roles', 1);
        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_field_allowlist_and_noop_managed_edits_do_not_leak_secrets_or_emit_false_changes(): void
    {
        $actor = $this->admin();
        $user = User::factory()->create();
        $user->assignRole('Viewer');
        $this->put(route('users.update', $user), ['name' => $user->name, 'email' => $user->email, 'role' => 'Viewer', 'is_active' => true])->assertRedirect();
        $this->assertDatabaseCount('activity_logs', 0);
        app(RecordActivity::class)->record($actor, $user, 'user.updated', ['password', 'remember_token', 'two_factor_secret', 'email']);
        $this->assertSame(['email'], ActivityLog::firstOrFail()->getAttribute('changed_fields'));
        $this->expectException(\InvalidArgumentException::class);
        app(RecordActivity::class)->record($actor, $user, 'unsupported');
    }
}
