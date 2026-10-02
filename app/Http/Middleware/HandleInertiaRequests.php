<?php

namespace App\Http\Middleware;

use App\Actions\ResolveWorkspaceSettings;
use App\Notifications\WorkspaceActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = app(ResolveWorkspaceSettings::class)->current();

        return [
            ...parent::share($request),
            'name' => $settings['name'],
            'branding' => [
                'name' => $settings['name'],
                'logo' => $settings['logo'],
                'tagline' => $settings['tagline'] ?? '',
            ],
            'themeDefaults' => Arr::only($settings, ['appearance', 'accent', 'sidebar', 'radius']),
            'support' => ['email' => $settings['support_email'], 'url' => $settings['support_url'], 'version' => config('jiro.version')],
            'locale' => app()->getLocale(),
            'environment' => app()->environment(),
            'unreadNotificationCount' => fn (): int => $request->user()?->hasVerifiedEmail()
                ? $request->user()->unreadNotifications()->where('type', WorkspaceActivity::class)->count() : 0,
            'auth' => [
                'user' => $request->user()?->withoutRelations(),
                'roles' => $request->user()?->getRoleNames()->values()->all() ?? [],
                'permissions' => $request->user()?->getAllPermissions()->pluck('name')->sort()->values()->all() ?? [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
