<?php

namespace App\Http\Controllers;

use App\Notifications\WorkspaceActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $validator = validator($request->query(), [
            'status' => ['nullable', 'string', Rule::in(['unread', 'read'])],
            'page' => ['sometimes', 'integer', 'min:1', 'max:1000000'],
        ]);
        if ($validator->fails()) {
            return to_route('notifications.index')->withErrors($validator);
        }
        $status = $validator->validated()['status'] ?? '';
        $query = $request->user()->notifications()->where('type', WorkspaceActivity::class);
        if ($status === 'unread') {
            $query->whereNull('read_at');
        } elseif ($status === 'read') {
            $query->whereNotNull('read_at');
        }
        $notifications = $query->reorder()->orderByDesc('created_at')->orderByDesc('id')->paginate(10)->appends(['status' => $status]);
        if ($notifications->currentPage() > $notifications->lastPage()) {
            return to_route('notifications.index', ['status' => $status, 'page' => $notifications->lastPage()]);
        }
        $notifications->through(fn (DatabaseNotification $notification): array => [
            'id' => $notification->id,
            'read_at' => $notification->read_at,
            'created_at' => $notification->created_at,
            'data' => Arr::only($notification->data, ['event', 'subject_type', 'subject_id', 'changed_fields']),
        ]);

        return Inertia::render('notifications/index', ['notifications' => $notifications, 'filters' => ['status' => $status]]);
    }

    public function read(Request $request, string $notification): RedirectResponse
    {
        $record = $request->user()->notifications()->where('type', WorkspaceActivity::class)->findOrFail($notification);
        $record->markAsRead();

        return back();
    }

    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications()->where('type', WorkspaceActivity::class)->update(['read_at' => now()]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('All notifications marked as read.')]);

        return to_route('notifications.index');
    }

    public function destroy(Request $request, string $notification): RedirectResponse
    {
        $request->user()->notifications()->where('type', WorkspaceActivity::class)->findOrFail($notification)->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Notification deleted.')]);

        return back();
    }
}
