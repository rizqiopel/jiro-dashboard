<?php

namespace App\Http\Controllers;

use App\Actions\RecordActivity;
use App\Actions\ResolveWorkspaceSettings;
use App\Http\Requests\UpdateApplicationSettingsRequest;
use App\Models\WorkspaceSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationSettingsController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('application-settings', ['settings' => app(ResolveWorkspaceSettings::class)->current(), 'revision' => WorkspaceSetting::findOrFail(1)->getAttribute('revision'), 'canUpdate' => Gate::allows('settings.update')]);
    }

    public function update(UpdateApplicationSettingsRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $row = WorkspaceSetting::query()->lockForUpdate()->findOrFail(1);
            if ($row->getAttribute('revision') !== (int) $request->validated('revision')) {
                throw ValidationException::withMessages(['revision' => __('Settings changed in another session. Reload before saving.')]);
            }
            $old = app(ResolveWorkspaceSettings::class)->current();
            $values = array_intersect_key($request->validated(), $old);
            $fields = array_keys(array_filter($values, fn ($value, $key): bool => $old[$key] !== $value, ARRAY_FILTER_USE_BOTH));
            if ($fields !== []) {
                $row->update(['values' => $values, 'revision' => $row->getAttribute('revision') + 1]);
                app(RecordActivity::class)->record($request->user(), $row, 'settings.updated', $fields);
            }
        }, 3);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Application settings saved.')]);

        return to_route('application-settings.edit');
    }
}
