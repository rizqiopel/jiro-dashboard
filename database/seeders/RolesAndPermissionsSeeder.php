<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $registrar = app(PermissionRegistrar::class);
        $registrar->forgetCachedPermissions();

        /** @var array<string, list<string>> $roles */
        $roles = config('jiro.roles');

        DB::transaction(function () use ($roles, $registrar): void {
            foreach (array_unique(array_merge(...array_values($roles))) as $permission) {
                Permission::findOrCreate($permission, 'web');
            }

            $registrar->forgetCachedPermissions();

            foreach ($roles as $name => $permissions) {
                Role::findOrCreate($name, 'web')->syncPermissions($permissions);
            }
        });

        $registrar->forgetCachedPermissions();
    }
}
