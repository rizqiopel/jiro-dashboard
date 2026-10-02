<?php

return [
    'version' => '1.0.0',
    'branding' => [
        'logo' => env('JIRO_LOGO_PATH') ?: null,
        'tagline' => env('JIRO_TAGLINE', 'A foundation for what comes next.'),
    ],
    'locales' => ['id', 'en'],
    'roles' => [
        'Admin' => [
            'dashboard.view',
            'projects.view',
            'projects.create',
            'projects.update',
            'projects.delete',
            'users.view',
            'users.create',
            'users.update',
            'users.reset-password',
            'activity.view',
            'settings.view',
            'settings.update',
        ],
        'Editor' => [
            'dashboard.view',
            'projects.view',
            'projects.create',
            'projects.update',
        ],
        'Viewer' => [
            'dashboard.view',
            'projects.view',
        ],
    ],
];
