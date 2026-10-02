<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ErrorPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_missing_page_renders_a_translated_inertia_error_with_http_status(): void
    {
        $this->withSession(['locale' => 'en'])->get('/does-not-exist')->assertNotFound()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('error')->where('status', 404)->where('locale', 'en'));
    }

    public function test_permission_denial_renders_error_without_exposing_dashboard(): void
    {
        $this->actingAs(User::factory()->create())->get(route('dashboard'))->assertForbidden()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('error')->where('status', 403));
    }

    #[DataProvider('serverErrors')]
    public function test_server_errors_render_safe_pages_outside_local_environment(int $status): void
    {
        $this->app->instance('env', 'production');
        Route::get('/_test/server-error', fn () => abort($status))->middleware('web');
        $this->get('/_test/server-error')->assertStatus($status)
            ->assertInertia(fn (AssertableInertia $page) => $page->component('error')->where('status', $status));
    }

    /** @return array<string, array{int}> */
    public static function serverErrors(): array
    {
        return ['internal error' => [500], 'unavailable' => [503]];
    }

    public function test_json_errors_are_not_replaced_with_html(): void
    {
        $this->getJson('/does-not-exist')->assertNotFound()->assertJsonStructure(['message']);
    }

    public function test_expired_html_request_redirects_with_localized_feedback(): void
    {
        Route::post('/_test/expired', fn () => abort(419))->middleware('web');
        $this->withSession(['locale' => 'en'])->from(route('login'))->post('/_test/expired')
            ->assertStatus(303)->assertRedirect(route('login'));
        $this->get(route('login'))->assertInertia(fn (AssertableInertia $page) => $page
            ->component('auth/login')->hasFlash('toast.message', 'The page expired. Please try again.'));
    }

    public function test_expired_json_request_preserves_its_status(): void
    {
        Route::post('/_test/expired', fn () => abort(419))->middleware('web');
        $this->postJson('/_test/expired')->assertStatus(419)->assertJsonStructure(['message']);
    }
}
