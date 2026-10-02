<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class WorkspaceGuidesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guides_require_login_and_email_verification(): void
    {
        foreach (['help', 'documentation'] as $route) {
            $this->get(route($route))->assertRedirect(route('login'));
        }

        $this->actingAs(User::factory()->unverified()->create());
        foreach (['help', 'documentation'] as $route) {
            $this->get(route($route))->assertRedirect(route('verification.notice'));
        }
    }

    public function test_all_baseline_roles_can_open_guides_in_the_selected_locale(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        foreach (['Admin', 'Editor', 'Viewer'] as $role) {
            $user = User::factory()->create();
            $user->assignRole($role);
            $this->actingAs($user)->withSession(['locale' => 'en']);
            foreach (['help', 'documentation'] as $route) {
                $this->get(route($route))->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
                    ->component($route)->where('locale', 'en')->where('auth.roles.0', $role));
            }
        }
    }
}
