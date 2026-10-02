<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateLocaleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cookie;

class LocaleController extends Controller
{
    public function update(UpdateLocaleRequest $request): RedirectResponse
    {
        $locale = $request->validated('locale');
        $request->session()->put('locale', $locale);
        App::setLocale($locale);

        Cookie::queue(cookie('jiro_locale', $locale, 60 * 24 * 365, '/', null, $request->isSecure(), true, false, 'lax'));

        return back(303);
    }
}
