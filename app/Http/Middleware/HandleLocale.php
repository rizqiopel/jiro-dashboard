<?php

namespace App\Http\Middleware;

use App\Actions\ResolveWorkspaceSettings;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class HandleLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $default = app(ResolveWorkspaceSettings::class)->current()['default_locale'];
        $default = is_string($default) && in_array($default, config('jiro.locales'), true) ? $default : 'id';
        $locale = $request->cookie('jiro_locale', $request->session()->get('locale', $default));

        App::setLocale(is_string($locale) && in_array($locale, config('jiro.locales'), true) ? $locale : $default);

        return $next($request);
    }
}
