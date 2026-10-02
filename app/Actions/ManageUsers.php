<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class ManageUsers
{
    public function update(User $actor, User $target, string $name, string $email, string $role, bool $active): void
    {
        $data = ['name' => $name, 'email' => $email, 'role' => $role, 'is_active' => $active];
        DB::transaction(function () use ($actor, $target, $data): void {
            $this->lockAdministrators();
            $target = User::query()->lockForUpdate()->findOrFail($target->id);
            $oldRoles = $target->getRoleNames()->all();
            if ($actor->is($target) && (! $data['is_active'] || ($target->hasRole('Admin') && $data['role'] !== 'Admin') || $target->email !== $data['email'])) {
                throw ValidationException::withMessages(['role' => __('You cannot lock yourself out. Use Profile to change your email.')]);
            }
            $losesAccess = ! $data['is_active'] || $data['role'] !== 'Admin' || $target->email !== $data['email'];
            if ($losesAccess) {
                $this->assertAdministratorRemains($target, 'role');
            }
            $target->fill(['name' => $data['name'], 'email' => $data['email']]);
            if ($target->isDirty('email')) {
                $target->email_verified_at = null;
            }
            $target->is_active = (bool) $data['is_active'];
            if (! $target->is_active) {
                $target->remember_token = null;
                if (config('session.driver') === 'database') {
                    DB::connection(config('session.connection'))->table(config('session.table', 'sessions'))->where('user_id', $target->id)->delete();
                }
            }
            $fields = array_keys($target->getDirty());
            if ($oldRoles !== [$data['role']]) {
                $fields[] = 'role';
            }
            $target->save();
            $target->syncRoles([$data['role']]);
            if (array_intersect($fields, ['name', 'email', 'role', 'is_active']) !== []) {
                app(RecordActivity::class)->record($actor, $target, 'user.updated', $fields);
            }
        }, 3);
    }

    public function deleteProfile(User $user): void
    {
        DB::transaction(function () use ($user): void {
            $this->lockAdministrators();
            $user = User::query()->lockForUpdate()->findOrFail($user->id);
            $this->assertAdministratorRemains($user, 'password');
            app(RecordActivity::class)->record($user, $user, 'profile.deleted');
            $user->notifications()->delete();
            $user->delete();
        }, 3);
    }

    public function updateProfile(User $user, string $name, string $email): void
    {
        $data = ['name' => $name, 'email' => $email];
        DB::transaction(function () use ($user, $data): void {
            $this->lockAdministrators();
            $user = User::query()->lockForUpdate()->findOrFail($user->id);
            if ($user->email !== $data['email']) {
                $this->assertAdministratorRemains($user, 'email');
                $user->email_verified_at = null;
            }
            $user->fill($data);
            $fields = array_keys($user->getDirty());
            $user->save();
            if (array_intersect($fields, ['name', 'email']) !== []) {
                app(RecordActivity::class)->record($user, $user, 'profile.updated', $fields);
            }
        }, 3);
    }

    private function lockAdministrators(): void
    {
        Role::query()->where('name', 'Admin')->where('guard_name', 'web')->lockForUpdate()->first();
    }

    private function assertAdministratorRemains(User $user, string $field): void
    {
        if ($user->is_active && $user->hasVerifiedEmail() && $user->hasRole('Admin')
            && ! User::role('Admin')->where('is_active', true)->whereNotNull('email_verified_at')->whereKeyNot($user->id)->exists()) {
            throw ValidationException::withMessages([$field => __('At least one active verified administrator must remain.')]);
        }
    }
}
