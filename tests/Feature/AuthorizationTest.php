<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        foreach (['get' => 'view', 'post' => 'create', 'put' => 'update', 'delete' => 'delete'] as $method => $action) {
            Route::$method('/_test/permission-boundary', fn () => response()->noContent())
                ->middleware(['web', 'auth', 'verified', 'can:projects.'.$action]);
        }
    }

    #[DataProvider('roleMatrix')]
    /** @param list<string> $allowed */
    public function test_roles_enforce_permissions_for_direct_http_requests(string $role, array $allowed): void
    {
        $user = User::factory()->create();
        $user->assignRole($role);
        $this->actingAs($user)->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('auth.roles', [$role])
                ->missing('auth.user.password')
                ->missing('auth.user.roles')
                ->where('auth.permissions', function (Collection $permissions) use ($allowed): bool {
                    $expected = ['dashboard.view', ...array_map(fn (string $action): string => 'projects.'.$action, $allowed)];
                    if (count($allowed) === 4) {
                        $expected = [...$expected, 'users.view', 'users.create', 'users.update', 'users.reset-password', 'activity.view', 'settings.view', 'settings.update'];
                    }
                    sort($expected);

                    return $permissions->all() === $expected;
                }));

        foreach (['get' => 'view', 'post' => 'create', 'put' => 'update', 'delete' => 'delete'] as $method => $action) {
            $response = $this->$method('/_test/permission-boundary');

            if (in_array($action, $allowed, true)) {
                $response->assertNoContent();
            } else {
                $response->assertForbidden();
            }

            $this->assertSame(in_array($action, $allowed, true), $user->can('projects.'.$action));
        }
    }

    /** @return array<string, array{string, list<string>}> */
    public static function roleMatrix(): array
    {
        return [
            'admin' => ['Admin', ['view', 'create', 'update', 'delete']],
            'editor' => ['Editor', ['view', 'create', 'update']],
            'viewer' => ['Viewer', ['view']],
        ];
    }

    public function test_user_without_permissions_cannot_open_dashboard_or_protected_actions(): void
    {
        $this->actingAs(User::factory()->create())->get(route('dashboard'))->assertForbidden();

        foreach (['get', 'post', 'put', 'delete'] as $method) {
            $this->$method('/_test/permission-boundary')->assertForbidden();
        }
    }

    public function test_unverified_admin_must_verify_email_before_dashboard_access(): void
    {
        $user = User::factory()->unverified()->create();
        $user->assignRole('Admin');

        $this->actingAs($user)->get(route('dashboard'))->assertRedirect(route('verification.notice'));
    }

    public function test_role_seeding_is_idempotent_and_does_not_create_accounts(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->assertSame(3, Role::query()->count());
        $this->assertSame(12, Permission::query()->count());
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('role_has_permissions', 18);
    }
}
