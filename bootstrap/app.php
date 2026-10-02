<?php

use App\Actions\ResolveWorkspaceSettings;
use App\Http\Middleware\EnsureActiveUser;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\HandleLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            EnsureActiveUser::class,
            HandleAppearance::class,
            HandleLocale::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->respond(function (Response $response, Throwable $exception, Request $request): Response {
            $status = $response->getStatusCode();

            if ($status === 419 && ! $request->expectsJson() && $request->hasSession()) {
                return app(HandleLocale::class)->handle($request, function (Request $request): Response {
                    Inertia::flash('toast', ['type' => 'error', 'message' => __('The page expired. Please try again.')]);

                    return back(303);
                });
            }

            if (! $request->expectsJson()
                && in_array($status, [403, 404, 500, 503], true)
                && (! app()->environment('local') || in_array($status, [403, 404], true))) {
                if ($request->hasSession() && in_array($status, [403, 404], true)) {
                    app(HandleLocale::class)->handle($request, fn (Request $request): Response => $response);
                }
                $settings = app(ResolveWorkspaceSettings::class)->defaults();
                if (in_array($status, [403, 404], true)) {
                    $settings = app(ResolveWorkspaceSettings::class)->current();
                    app(HandleAppearance::class)->handle($request, fn (Request $request): Response => $response);
                }

                return Inertia::render('error', [
                    'status' => $status,
                    'branding' => Inertia::getShared('branding') ?? [
                        'name' => $settings['name'],
                        'logo' => $settings['logo'],
                        'tagline' => $settings['tagline'] ?? '',
                    ],
                    'themeDefaults' => Inertia::getShared('themeDefaults') ?? Arr::only($settings, ['appearance', 'accent', 'sidebar', 'radius']),
                    'locale' => app()->getLocale(),
                    'auth' => Inertia::getShared('auth') ?? ['user' => null, 'roles' => [], 'permissions' => []],
                ])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

            return $response;
        });
    })->create();
