<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClosedRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_page_is_unavailable(): void
    {
        $this->get('/register')->assertNotFound();
    }

    public function test_public_registration_cannot_create_an_account(): void
    {
        $this->post('/register', [
            'name' => 'Uninvited User',
            'email' => 'uninvited@example.com',
            'password' => 'NotAnActualSecret123!',
            'password_confirmation' => 'NotAnActualSecret123!',
        ])->assertNotFound();

        $this->assertDatabaseCount('users', 0);
        $this->assertGuest();
    }
}
