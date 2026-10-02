<?php

namespace App\Actions;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use App\Models\WorkspaceSetting;
use Illuminate\Support\Facades\DB;

class RecordActivity
{
    public const EVENTS = ['project.created', 'project.updated', 'project.deleted', 'user.created', 'user.updated', 'user.password-link-sent', 'profile.updated', 'profile.deleted', 'settings.updated'];

    /** @param list<string> $fields */
    public function record(?User $actor, Project|User|WorkspaceSetting $subject, string $event, array $fields = []): void
    {
        if (! in_array($event, self::EVENTS, true)) {
            throw new \InvalidArgumentException('Unsupported activity event.');
        }
        $allowed = $subject instanceof WorkspaceSetting ? array_keys(app(ResolveWorkspaceSettings::class)->defaults())
            : ($subject instanceof Project ? ['name', 'description', 'status'] : ['name', 'email', 'role', 'is_active']);
        $safeFields = array_values(array_intersect($allowed, $fields));
        DB::transaction(function () use ($actor, $subject, $event, $safeFields): void {
            ActivityLog::create([
                'actor_id' => $actor?->id,
                'event' => $event,
                'subject_type' => $subject instanceof WorkspaceSetting ? 'settings' : ($subject instanceof Project ? 'project' : 'user'),
                'subject_id' => $subject->id,
                'changed_fields' => $safeFields,
            ]);
            if (! $subject instanceof WorkspaceSetting) {
                app(NotifyWorkspaceActivity::class)->send($actor, $subject, $event, $safeFields);
            }
        });
    }
}
