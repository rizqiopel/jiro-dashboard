<?php

namespace App\Actions;

use App\Models\Project;
use App\Models\User;
use App\Notifications\WorkspaceActivity;
use Illuminate\Database\Eloquent\Collection;

class NotifyWorkspaceActivity
{
    /** @param list<string> $fields */
    public function send(?User $actor, Project|User $subject, string $event, array $fields): void
    {
        $notification = new WorkspaceActivity($event, $subject instanceof Project ? 'project' : 'user', $subject->id, $fields);
        if ($subject instanceof Project) {
            User::permission('projects.view')->where('is_active', true)->whereNotNull('email_verified_at')
                ->when($actor, fn ($query) => $query->whereKeyNot($actor->id))
                ->chunkById(100, function (Collection $users) use ($notification): void {
                    foreach ($users as $user) {
                        $user->notify(clone $notification);
                    }
                });
        } elseif (in_array($event, ['user.created', 'user.updated', 'user.password-link-sent'], true) && ! $actor?->is($subject)) {
            $subject->notify($notification);
        }
    }
}
