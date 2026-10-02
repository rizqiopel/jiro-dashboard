<?php

namespace App\Console\Commands;

use App\Models\User;
use Closure;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

#[Signature('jiro:create-admin
    {--name= : Administrator display name}
    {--email= : Administrator email address}
    {--verified : Mark email verified after independently confirming ownership}')]
#[Description('Create a new administrator with a securely prompted password')]
class CreateAdmin extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (! $this->input->isInteractive()) {
            $this->error('An interactive terminal is required to enter a hidden password. Run without --no-interaction.');

            return self::FAILURE;
        }

        if (! Schema::hasTable('users') || ! Schema::hasTable(config('permission.table_names.roles'))) {
            $this->error('Run php artisan migrate and php artisan db:seed before creating an administrator.');

            return self::FAILURE;
        }

        $role = Role::query()->where('name', 'Admin')->where('guard_name', 'web')->first();

        if (! $role) {
            $this->error('The Admin role is missing. Run php artisan db:seed first.');

            return self::FAILURE;
        }

        $name = trim((string) ($this->option('name') ?? $this->ask('Name')));
        $email = Str::lower(trim((string) ($this->option('email') ?? $this->ask('Email'))));
        $identity = Validator::make(compact('name', 'email'), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        if ($identity->fails()) {
            foreach ($identity->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        if (User::query()->whereRaw('LOWER(email) = ?', [$email])->exists()) {
            $this->error('An account with this email already exists. No account was changed.');

            return self::FAILURE;
        }

        $password = $this->secret('Password', false);
        $confirmation = $this->secret('Confirm password', false);
        $validation = Validator::make([
            'password' => $password,
            'password_confirmation' => $confirmation,
        ], [
            'password' => [
                'required', 'string', 'confirmed',
                Password::min(12)->mixedCase()->numbers()->symbols(),
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (is_string($value) && strlen($value) > 72) {
                        $fail('The password must not exceed 72 bytes.');
                    }
                },
            ],
        ]);

        if ($validation->fails()) {
            foreach ($validation->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        DB::transaction(function () use ($name, $email, $password, $role): void {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => $password,
            ]);

            if ($this->option('verified')) {
                $user->markEmailAsVerified();
            }

            $user->assignRole($role);
        });

        $this->info('Administrator created successfully.');

        if (! $this->option('verified')) {
            $this->info('Sign in and request email verification before opening the dashboard.');
        }

        return self::SUCCESS;
    }
}
