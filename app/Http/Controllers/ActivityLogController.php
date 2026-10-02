<?php

namespace App\Http\Controllers;

use App\Actions\RecordActivity;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $validator = validator($request->query(), [
            'event' => ['nullable', 'string', Rule::in(RecordActivity::EVENTS)],
            'subject_type' => ['nullable', 'string', Rule::in(['project', 'user', 'settings'])],
            'subject_id' => ['nullable', 'integer', 'min:1'],
            'page' => ['sometimes', 'integer', 'min:1', 'max:1000000'],
        ]);
        if ($validator->fails()) {
            return to_route('activity.index')->withErrors($validator);
        }
        $values = $validator->validated();
        $filters = ['event' => $values['event'] ?? '', 'subject_type' => $values['subject_type'] ?? '', 'subject_id' => $values['subject_id'] ?? ''];
        $query = ActivityLog::query()->with('actor:id,name');
        foreach ($filters as $field => $value) {
            if ($value !== '') {
                $query->where($field, $value);
            }
        }
        $activities = $query->orderByDesc('id')->paginate(10)->appends($filters);
        if ($activities->currentPage() > $activities->lastPage()) {
            return to_route('activity.index', [...$filters, 'page' => $activities->lastPage()]);
        }

        return Inertia::render('activity/index', ['activities' => $activities, 'filters' => $filters, 'events' => RecordActivity::EVENTS]);
    }
}
