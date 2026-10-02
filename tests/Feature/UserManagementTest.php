<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class UserManagementTest extends TestCase
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

    /** @return array{name:string,email:string,role:string,is_active:bool} */
    private function data(User $user, string $role = 'Viewer', bool $active = true): array
    {
        return ['name' => $user->name, 'email' => $user->email, 'role' => $role, 'is_active' => $active];
    }

    public function test_admin_can_create_update_filter_and_send_a_password_link(): void
    {
        $this->admin();
        Notification::fake();
        $this->get(route('users.create'))->assertOk();
        $this->post(route('users.store'), ['name' => 'New person', 'email' => 'new@example.test', 'role' => 'Editor', 'is_active' => true, 'email_verified_at' => now(), 'password' => 'injected'])
            ->assertRedirect(route('users.index'));
        $user = User::where('email', 'new@example.test')->firstOrFail();
        $this->assertNull($user->email_verified_at);
        $this->assertFalse(Hash::check('injected', $user->password));
        $this->assertTrue($user->hasRole('Editor'));
        $this->get(route('users.index', ['search' => 'NEW@', 'role' => 'Editor', 'status' => 'active']))
            ->assertInertia(fn (AssertableInertia $page) => $page->component('users/index')->where('users.total', 1)->missing('users.data.0.password')->missing('users.data.0.remember_token'));
        $this->get(route('users.edit', $user))->assertOk();
        $this->put(route('users.update', $user), $this->data($user, 'Viewer', false))->assertRedirect(route('users.index'));
        $this->assertFalse($user->fresh()->is_active);
        $this->assertTrue($user->fresh()->hasRole('Viewer'));
        $this->post(route('users.reset-password', $user))->assertForbidden();
        $this->put(route('users.update', $user), $this->data($user))->assertRedirect();
        $this->post(route('users.reset-password', $user))->assertRedirect();
        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_non_admin_and_unverified_and_guest_cannot_manage_users(): void
    {
        $target = User::factory()->create();
        $endpoints = [['get', route('users.index')], ['get', route('users.create')], ['get', route('users.edit', $target)], ['post', route('users.store')], ['put', route('users.update', $target)], ['post', route('users.reset-password', $target)]];
        foreach ($endpoints as [$method, $url]) {
            $this->$method($url)->assertRedirect(route('login'));
        }
        foreach (['Editor', 'Viewer'] as $role) {
            $user = User::factory()->create();
            $user->assignRole($role);
            $this->actingAs($user);
            foreach ($endpoints as [$method, $url]) {
                $this->$method($url)->assertForbidden();
            }
        }
        $user = User::factory()->unverified()->create();
        $user->assignRole('Admin');
        $this->actingAs($user);
        foreach ($endpoints as [$method, $url]) {
            $this->$method($url)->assertRedirect(route('verification.notice'));
        }
    }

    public function test_invalid_fields_and_roles_do_not_change_accounts(): void
    {
        $admin = $this->admin();
        $user = User::factory()->create();
        $data = ['name' => '', 'email' => $admin->email, 'role' => 'SuperAdmin', 'is_active' => 'bad'];
        $this->post(route('users.store'), $data)->assertSessionHasErrors(['name', 'email', 'role', 'is_active']);
        $this->put(route('users.update', $user), $data)->assertSessionHasErrors(['name', 'email', 'role', 'is_active']);
        $this->assertSame($user->email, $user->fresh()->email);
        $this->assertDatabaseCount('users', 2);
        $this->get(route('users.index', ['role' => ['bad']]))->assertRedirect(route('users.index'))->assertSessionHasErrors('role');
    }

    public function test_self_lockout_and_last_verified_admin_are_protected_including_profile_routes(): void
    {
        $admin = $this->admin();
        $this->put(route('users.update', $admin), $this->data($admin, 'Viewer'))->assertSessionHasErrors('role');
        $this->put(route('users.update', $admin), $this->data($admin, 'Admin', false))->assertSessionHasErrors('role');
        $this->delete(route('profile.destroy'), ['password' => 'password'])->assertSessionHasErrors('password');
        $this->patch(route('profile.update'), ['name' => $admin->name, 'email' => 'changed@example.test'])->assertSessionHasErrors('email');
        $this->assertDatabaseHas('users', ['id' => $admin->id, 'is_active' => true, 'email' => $admin->email]);
        $operator = User::factory()->create();
        $operator->givePermissionTo(['users.view', 'users.update']);
        $this->actingAs($operator)->put(route('users.update', $admin), $this->data($admin, 'Viewer'))->assertSessionHasErrors('role');
        $unverified = User::factory()->unverified()->create();
        $unverified->assignRole('Admin');
        $this->put(route('users.update', $admin), $this->data($admin, 'Admin', false))->assertSessionHasErrors('role');
    }

    public function test_second_verified_admin_allows_demoting_another_admin_and_email_changes_reset_verification(): void
    {
        $this->admin();
        $other = User::factory()->create();
        $other->assignRole('Admin');
        $this->put(route('users.update', $other), [...$this->data($other), 'email' => 'changed@example.test'])->assertRedirect();
        $this->assertTrue($other->fresh()->hasRole('Viewer'));
        $this->assertNull($other->fresh()->email_verified_at);
    }

    public function test_inactive_user_cannot_login_or_keep_using_an_existing_session(): void
    {
        $user = User::factory()->create(['is_active' => false]);
        $user->assignRole('Viewer');
        $this->post(route('login'), ['email' => $user->email, 'password' => 'password'])->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->actingAs($user)->get(route('dashboard'))->assertRedirect(route('login'));
        $this->assertGuest();
        $this->actingAs($user)->getJson(route('projects.index'))->assertForbidden();
        $this->assertGuest();
    }

    public function test_missing_and_out_of_range_requests_are_safe(): void
    {
        $this->admin();
        $this->get(route('users.edit', 9999))->assertNotFound();
        $this->get(route('users.index', ['page' => 999]))->assertRedirect();
        $this->get(route('users.index', ['search' => 'missing']))->assertInertia(fn (AssertableInertia $page) => $page->where('users.total', 0));
    }

    public function test_write_permissions_without_view_are_denied_and_inactive_admins_do_not_count_as_replacements(): void
    {
        $admin = $this->admin();
        $inactive = User::factory()->create(['is_active' => false]);
        $inactive->assignRole('Admin');
        $operator = User::factory()->create();
        $operator->givePermissionTo(['users.create', 'users.update', 'users.reset-password']);
        $this->actingAs($operator)->post(route('users.store'), $this->data($operator))->assertForbidden();
        $this->put(route('users.update', $admin), $this->data($admin))->assertForbidden();
        $this->post(route('users.reset-password', $admin))->assertForbidden();
        $operator->givePermissionTo('users.view');
        $this->put(route('users.update', $admin), $this->data($admin, 'Admin', false))->assertSessionHasErrors('role');
    }

    public function test_deactivation_revokes_remember_token_and_database_sessions(): void
    {
        $this->admin();
        $user = User::factory()->create();
        config(['session.driver' => 'database']);
        DB::table('sessions')->insert(['id' => 'revoked-session', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);
        $this->put(route('users.update', $user), $this->data($user, 'Viewer', false))->assertRedirect();
        $this->assertNull($user->fresh()->remember_token);
        $this->assertDatabaseMissing('sessions', ['id' => 'revoked-session']);
    }
}
