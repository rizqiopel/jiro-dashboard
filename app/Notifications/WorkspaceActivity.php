<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class WorkspaceActivity extends Notification
{
    /** @param list<string> $fields */
    public function __construct(public string $event, public string $subjectType, public int $subjectId, public array $fields) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /** @return array{event: string, subject_type: string, subject_id: int, changed_fields: list<string>} */
    public function toDatabase(object $notifiable): array
    {
        return ['event' => $this->event, 'subject_type' => $this->subjectType, 'subject_id' => $this->subjectId, 'changed_fields' => $this->fields];
    }
}
