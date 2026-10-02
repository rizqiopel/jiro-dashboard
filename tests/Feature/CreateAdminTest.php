<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class CreateAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_operator_can_create_an_admin_with_hidden_password_and_login(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $password = 'TestOnlySecret123!';

        $this->artisan('jiro:create-admin')
            ->expectsQuestion('Name', 'Jiro Administrator')
            ->expectsQuestion('Email', ' ADMIN@example.com ')
            ->expectsQuestion('Password', $password)
            ->expectsQuestion('Confirm password', $password)
            ->expectsOutput('Administrator created successfully.')
            ->expectsOutput('Sign in and request email verification before opening the dashboard.')
            ->assertSuccessful();

        $user = User::query()->sole();
        $this->assertSame('admin@example.com', $user->email);
        $this->assertTrue(Hash::check($password, $user->password));
        $this->assertNotSame($password, $user->password);
        $this->assertTrue($user->hasRole('Admin'));
        $this->assertNull($user->email_verified_at);

        $this->post(route('login.store'), ['email' => $user->email, 'password' => $password])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
        $this->get(route('dashboard'))->assertRedirect(route('verification.notice'));
        $this->post(route('logout'))->assertRedirect(route('home'));
        $this->assertGuest();
    }

    public function test_explicitly_verified_admin_can_access_the_dashboard(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->artisan('jiro:create-admin', [
            '--name' => 'Verified Operator', '--email' => 'operator@example.com', '--verified' => true,
        ])
            ->expectsQuestion('Password', 'TestOnlySecret123!')
            ->expectsQuestion('Confirm password', 'TestOnlySecret123!')
            ->expectsOutput('Administrator created successfully.')
            ->assertSuccessful();

        $user = User::query()->sole();
        $this->assertTrue($user->hasVerifiedEmail());
        $this->actingAs($user)->get(route('dashboard'))->assertOk();
    }

    public function test_existing_account_is_not_overwritten_or_promoted(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $user = User::factory()->create(['email' => 'Existing@example.com']);
        $original = $user->getAttributes();

        $this->artisan('jiro:create-admin', ['--name' => 'Replacement', '--email' => 'existing@example.com'])
            ->expectsOutput('An account with this email already exists. No account was changed.')
            ->assertFailed();

        $this->assertDatabaseCount('users', 1);
        $current = $user->fresh()->getAttributes();
        ksort($original);
        ksort($current);
        $this->assertSame($original, $current);
        $this->assertFalse($user->fresh()->hasRole('Admin'));
    }

    #[DataProvider('invalidPasswords')]
    public function test_invalid_passwords_leave_no_account(string $password, string $confirmation): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->artisan('jiro:create-admin', ['--name' => 'Operator', '--email' => 'operator@example.com'])
            ->expectsQuestion('Password', $password)
            ->expectsQuestion('Confirm password', $confirmation)
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('model_has_roles', 0);
    }

    /** @return array<string, array{string, string}> */
    public static function invalidPasswords(): array
    {
        return [
            'weak' => ['password', 'password'],
            'mismatch' => ['TestOnlySecret123!', 'DifferentSecret123!'],
            'missing' => ['', ''],
            'bcrypt byte limit' => [str_repeat('é', 36).'Aa1!', str_repeat('é', 36).'Aa1!'],
        ];
    }

    public function test_invalid_identity_is_rejected_before_password_prompt(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->artisan('jiro:create-admin', ['--name' => '', '--email' => 'not-an-email'])->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_missing_roles_require_seeding_before_password_prompt(): void
    {
        $this->artisan('jiro:create-admin', ['--name' => 'Operator', '--email' => 'operator@example.com'])
            ->expectsOutput('The Admin role is missing. Run php artisan db:seed first.')
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_noninteractive_invocation_does_not_create_an_account(): void
    {
        $this->artisan('jiro:create-admin', ['--no-interaction' => true])
            ->expectsOutput('An interactive terminal is required to enter a hidden password. Run without --no-interaction.')
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }
}
