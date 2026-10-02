<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Mockery;
use Psr\Log\LoggerInterface;
use Tests\TestCase;

class LogMailTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_reset_mail_is_rendered_through_the_log_transport(): void
    {
        $user = User::factory()->create();
        $this->expectLoggedMail($user->email, '/reset-password/');

        $this->post(route('password.email'), ['email' => $user->email])->assertSessionHasNoErrors();
    }

    public function test_verification_mail_is_rendered_through_the_log_transport(): void
    {
        $user = User::factory()->unverified()->create();
        $this->expectLoggedMail($user->email, '/email/verify/');

        $this->actingAs($user)->post(route('verification.send'))->assertRedirect();
    }

    private function expectLoggedMail(string $email, string $path): void
    {
        config(['mail.default' => 'log', 'mail.mailers.log.channel' => 'test-mail']);

        $logger = Mockery::mock(LoggerInterface::class);
        $logger->shouldReceive('debug')->once()->withArgs(
            fn (string $message): bool => str_contains($message, $email) && str_contains($message, $path)
        );
        Log::shouldReceive('channel')->with('test-mail')->andReturn($logger);
    }
}
