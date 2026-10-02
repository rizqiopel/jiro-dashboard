<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class LocalePreferencesTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_locale_and_branding_are_shared_with_guests(): void
    {
        $this->get(route('login'))->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->where('locale', 'id')
            ->where('branding.name', config('app.name'))
            ->where('branding.logo', null));
    }

    public function test_guest_can_change_locale_and_persist_it_in_session_and_cookie(): void
    {
        $response = $this->from(route('login'))->post(route('locale.update'), ['locale' => 'en']);
        $response->assertStatus(303)->assertRedirect(route('login'))
            ->assertSessionHas('locale', 'en')->assertCookie('jiro_locale', 'en');
        $this->assertTrue($response->getCookie('jiro_locale')->isHttpOnly());

        $this->get(route('login'))->assertInertia(fn (AssertableInertia $page) => $page->where('locale', 'en'));
    }

    public function test_cookie_restores_locale_in_a_new_session(): void
    {
        $this->withCookie('jiro_locale', 'en')->get(route('login'))
            ->assertInertia(fn (AssertableInertia $page) => $page->where('locale', 'en'));
    }

    public function test_invalid_locale_is_rejected_without_changing_preference(): void
    {
        $this->withSession(['locale' => 'en'])->post(route('locale.update'), ['locale' => 'fr'])
            ->assertSessionHasErrors('locale')->assertSessionHas('locale', 'en')->assertCookieMissing('jiro_locale');
    }

    public function test_invalid_stored_locale_falls_back_to_default(): void
    {
        $this->withCookie('jiro_locale', 'invalid')->get(route('login'))
            ->assertInertia(fn (AssertableInertia $page) => $page->where('locale', 'id'));
    }

    public function test_login_errors_follow_the_active_backend_locale(): void
    {
        $this->withSession(['locale' => 'id'])->post(route('login.store'), ['email' => 'nobody@example.test', 'password' => 'invalid'])
            ->assertSessionHasErrors(['email' => 'Email atau password tidak sesuai.']);
        $this->withSession(['locale' => 'en'])->post(route('login.store'), ['email' => 'nobody@example.test', 'password' => 'invalid'])
            ->assertSessionHasErrors(['email' => 'These credentials do not match our records.']);
    }

    public function test_invalid_appearance_cookie_is_not_rendered_into_the_html(): void
    {
        $this->withUnencryptedCookie('appearance', 'invalid-appearance')->get(route('login'))
            ->assertOk()->assertDontSee('invalid-appearance');
    }
}
