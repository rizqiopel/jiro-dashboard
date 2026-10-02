<?php

namespace App\Actions;

use App\Models\WorkspaceSetting;

class ResolveWorkspaceSettings
{
    /** @return array<string, string|null> */
    public function defaults(): array
    {
        return [
            'name' => config('app.name', 'Jiro Dashboard'),
            'tagline' => config('jiro.branding.tagline'),
            'logo' => config('jiro.branding.logo'),
            'support_email' => null,
            'support_url' => null,
            'default_locale' => config('app.locale', 'id'),
            'appearance' => 'system',
            'accent' => 'teal',
            'sidebar' => 'dark',
            'radius' => 'rounded',
        ];
    }

    /** @return array<string, string|null> */
    public function current(): array
    {
        /** @var array<string, string|null> $stored */
        $stored = WorkspaceSetting::find(1)?->getAttribute('values') ?? [];

        return array_replace($this->defaults(), array_intersect_key($stored, $this->defaults()));
    }
}
