<?php

namespace App\Http\Middleware;

use App\Actions\ResolveWorkspaceSettings;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class HandleAppearance
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $settings = app(ResolveWorkspaceSettings::class)->current();
        $appearance = $request->cookie('appearance', $settings['appearance']);
        View::share('appearance', in_array($appearance, ['light', 'dark', 'system'], true) ? $appearance : $settings['appearance']);
        View::share('workspaceSettings', $settings);

        return $next($request);
    }
}
