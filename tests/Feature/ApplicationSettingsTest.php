<?php

namespace Tests\Feature;

use App\Actions\RecordActivity;
use App\Actions\ResolveWorkspaceSettings;
use App\Models\ActivityLog;
use App\Models\User;
use App\Models\WorkspaceSetting;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ApplicationSettingsTest extends TestCase
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

    /** @return array<string, mixed> */
    private function data(): array
    {
        return [...app(ResolveWorkspaceSettings::class)->defaults(), 'revision' => 0];
    }

    public function test_defaults_preserve_branding_and_only_admin_can_read_and_write(): void
    {
        $this->get(route('application-settings.edit'))->assertRedirect(route('login'));
        $this->put(route('application-settings.update'), $this->data())->assertRedirect(route('login'));
        foreach (['Editor', 'Viewer'] as $role) {
            $user = User::factory()->create();
            $user->assignRole($role);
            $this->actingAs($user)->get(route('application-settings.edit'))->assertForbidden();
            $this->put(route('application-settings.update'), $this->data())->assertForbidden();
        }
        $user = User::factory()->unverified()->create();
        $user->assignRole('Admin');
        $this->actingAs($user)->get(route('application-settings.edit'))->assertRedirect(route('verification.notice'));
        $this->put(route('application-settings.update'), $this->data())->assertRedirect(route('verification.notice'));
        $this->admin();
        $this->get(route('application-settings.edit'))->assertInertia(fn (AssertableInertia $page) => $page->component('application-settings')->where('settings.name', config('app.name'))->where('revision', 0)->where('canUpdate', true));
    }

    public function test_settings_save_and_share_public_defaults_and_support_without_env_mutation_or_value_auditing(): void
    {
        $this->admin();
        $originalName = config('app.name');
        $data = [...$this->data(), 'name' => 'New workspace', 'tagline' => 'New tagline', 'logo' => '/jiro-icon.svg', 'support_email' => 'help@example.test', 'support_url' => 'https://example.test/help', 'default_locale' => 'en', 'appearance' => 'dark', 'accent' => 'violet', 'sidebar' => 'light', 'radius' => 'soft', 'secret' => 'never store'];
        $this->put(route('application-settings.update'), $data)->assertRedirect(route('application-settings.edit'));
        $this->assertSame(1, WorkspaceSetting::findOrFail(1)->getAttribute('revision'));
        $this->assertSame($originalName, config('app.name'));
        $this->assertStringNotContainsString('never store', WorkspaceSetting::firstOrFail()->toJson());
        $this->assertDatabaseHas('activity_logs', ['event' => 'settings.updated', 'subject_type' => 'settings', 'subject_id' => 1]);
        $this->assertStringNotContainsString('help@example.test', ActivityLog::all()->toJson());
        $this->assertDatabaseCount('notifications', 0);
        $this->get(route('help'))->assertInertia(fn (AssertableInertia $page) => $page->where('branding.name', 'New workspace')->where('branding.logo', '/jiro-icon.svg')->where('locale', 'en')->where('themeDefaults.accent', 'violet')->where('support.email', 'help@example.test')->where('support.version', '1.0.0'));
        Auth::logout();
        $this->get(route('login'))->assertInertia(fn (AssertableInertia $page) => $page->where('branding.name', 'New workspace'));
        $this->get('/missing-settings-resource')->assertNotFound()->assertInertia(fn (AssertableInertia $page) => $page->where('branding.name', 'New workspace')->where('themeDefaults.appearance', 'dark')->where('locale', 'en'));
    }

    public function test_invalid_fields_links_paths_and_preferences_do_not_change_settings(): void
    {
        $this->admin();
        foreach (['javascript:alert(1)', 'http://example.test'] as $url) {
            $this->put(route('application-settings.update'), [...$this->data(), 'support_url' => $url])->assertSessionHasErrors('support_url');
        }
        foreach (['//jiro-icon.svg', '/../.env', 'https://example.test/logo.png', '/missing-logo.svg', 'data:image/svg+xml,x'] as $logo) {
            $this->put(route('application-settings.update'), [...$this->data(), 'logo' => $logo])->assertSessionHasErrors('logo');
        }
        $this->put(route('application-settings.update'), [...$this->data(), 'name' => '', 'support_email' => 'bad', 'appearance' => 'bad', 'default_locale' => 'de', 'accent' => 'red', 'radius' => 'giant', 'sidebar' => 'bad'])->assertSessionHasErrors(['name', 'support_email', 'appearance', 'default_locale', 'accent', 'radius', 'sidebar']);
        $this->assertSame(0, WorkspaceSetting::findOrFail(1)->getAttribute('revision'));
        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_stale_revision_is_rejected_noop_is_not_logged_and_blank_optional_fields_clear(): void
    {
        $this->admin();
        $this->put(route('application-settings.update'), $this->data())->assertRedirect();
        $this->assertDatabaseCount('activity_logs', 0);
        $this->put(route('application-settings.update'), [...$this->data(), 'name' => 'Updated', 'support_email' => 'contact@example.test'])->assertRedirect();
        $this->put(route('application-settings.update'), [...$this->data(), 'name' => 'Stale'])->assertSessionHasErrors('revision');
        $this->assertSame('Updated', app(ResolveWorkspaceSettings::class)->current()['name']);
        $this->put(route('application-settings.update'), [...$this->data(), 'revision' => 1, 'name' => 'Updated', 'logo' => '', 'support_email' => '', 'support_url' => '', 'tagline' => ''])->assertRedirect();
        $this->assertNull(app(ResolveWorkspaceSettings::class)->current()['support_email']);
        $this->assertDatabaseCount('activity_logs', 2);
    }

    public function test_locale_cookie_or_session_overrides_default_and_invalid_cookie_falls_back(): void
    {
        WorkspaceSetting::findOrFail(1)->update(['values' => ['default_locale' => 'en', 'appearance' => 'dark']]);
        $this->get(route('login'))->assertInertia(fn (AssertableInertia $page) => $page->where('locale', 'en'));
        $this->withSession(['locale' => 'id'])->get(route('login'))->assertInertia(fn (AssertableInertia $page) => $page->where('locale', 'id'));
        $this->withCookie('jiro_locale', 'en')->get(route('login'))->assertInertia(fn (AssertableInertia $page) => $page->where('locale', 'en'));
        $this->withCookie('jiro_locale', 'invalid')->get(route('login'))->assertInertia(fn (AssertableInertia $page) => $page->where('locale', 'en'));
    }

    public function test_view_and_write_permissions_are_independent_but_writes_also_need_view(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('settings.view');
        $this->actingAs($user)->get(route('application-settings.edit'))->assertInertia(fn (AssertableInertia $page) => $page->where('canUpdate', false));
        $this->put(route('application-settings.update'), $this->data())->assertForbidden();
        $user->revokePermissionTo('settings.view');
        $user->givePermissionTo('settings.update');
        $this->put(route('application-settings.update'), $this->data())->assertForbidden();
    }

    public function test_audit_failure_rolls_back_settings_and_revision(): void
    {
        $this->admin();
        $this->mock(RecordActivity::class)->shouldReceive('record')->once()->andThrow(new \RuntimeException('Audit unavailable'));
        $this->withoutExceptionHandling();
        try {
            $this->put(route('application-settings.update'), [...$this->data(), 'name' => 'Rollback']);
            $this->fail('Expected audit failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Audit unavailable', $exception->getMessage());
        }
        $this->assertSame(0, WorkspaceSetting::firstOrFail()->getAttribute('revision'));
        $this->assertSame(config('app.name'), app(ResolveWorkspaceSettings::class)->current()['name']);
    }
}
