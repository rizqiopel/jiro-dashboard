<?php

namespace Database\Factories;

use App\Models\WorkspaceSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkspaceSetting>
 */
class WorkspaceSettingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'values' => [],
            'revision' => 0,
        ];
    }
}
