import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { DataTable, type TableColumn } from '@/components/data-table';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import { index, read, readAll, destroy } from '@/routes/notifications';
import type { Paginated } from '@/types/project';

type WorkspaceNotification = {
    id: string;
    read_at: string | null;
    created_at: string;
    data: {
        event: string;
        subject_type: string;
        subject_id: number;
        changed_fields: string[];
    };
};
const eventTitles: Record<string, TranslationKey> = {
    'project.created': 'A project was created.',
    'project.updated': 'A project was updated.',
    'project.deleted': 'A project was deleted.',
    'user.created': 'Your account was created.',
    'user.updated': 'Your account was updated.',
    'user.password-link-sent': 'A password link was sent for your account.',
};
function NotificationActions({
    notification,
}: {
    notification: WorkspaceNotification;
}) {
    const { t } = useI18n();
    const form = useForm({});
    const [open, setOpen] = useState(false);
    return (
        <div className="flex gap-2">
            {!notification.read_at && (
                <Button
                    size="sm"
                    variant="outline"
                    disabled={form.processing}
                    onClick={() =>
                        form.patch(read(notification.id).url, {
                            preserveScroll: true,
                        })
                    }
                >
                    {t('Mark as read')}
                </Button>
            )}
            <Dialog
                open={open}
                onOpenChange={(value) => {
                    if (!form.processing) setOpen(value);
                }}
            >
                <DialogTrigger asChild>
                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={form.processing}
                    >
                        {t('Delete')}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>{t('Delete notification?')}</DialogTitle>
                    <DialogDescription>
                        {t(
                            'This removes this notification from your inbox only.',
                        )}
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            disabled={form.processing}
                            onClick={() => setOpen(false)}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={form.processing}
                            onClick={() =>
                                form.delete(destroy(notification.id).url, {
                                    preserveScroll: true,
                                    onSuccess: () => setOpen(false),
                                })
                            }
                        >
                            {t('Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
export default function Notifications({
    notifications,
    filters,
}: {
    notifications: Paginated<WorkspaceNotification>;
    filters: { status: string };
}) {
    const { t, locale } = useI18n();
    const { unreadNotificationCount, errors } = usePage().props;
    const allForm = useForm({});
    const [pending, setPending] = useState(false);
    const visit = (url: string) =>
        router.get(
            url,
            {},
            {
                preserveState: false,
                preserveScroll: true,
                onStart: () => setPending(true),
                onFinish: () => setPending(false),
            },
        );
    const columns: TableColumn<WorkspaceNotification>[] = [
        {
            key: 'event',
            header: t('Event'),
            cell: (notification) => (
                <div className="space-y-1">
                    <p className={!notification.read_at ? 'font-semibold' : ''}>
                        {t(
                            eventTitles[notification.data.event] ??
                                'Workspace update',
                        )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {notification.data.subject_type} #
                        {notification.data.subject_id}
                        {notification.data.changed_fields.length > 0 &&
                            ` · ${notification.data.changed_fields.join(', ')}`}
                    </p>
                </div>
            ),
        },
        {
            key: 'status',
            header: t('Status'),
            cell: (notification) => t(notification.read_at ? 'Read' : 'Unread'),
        },
        {
            key: 'time',
            header: t('Time'),
            cell: (notification) => (
                <time dateTime={notification.created_at}>
                    {new Date(notification.created_at).toLocaleString(
                        locale === 'id' ? 'id-ID' : 'en-US',
                    )}
                </time>
            ),
        },
        {
            key: 'actions',
            header: t('Actions'),
            cell: (notification) => (
                <NotificationActions notification={notification} />
            ),
        },
    ];
    return (
        <>
            <Head title={t('Notifications')} />
            <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
                <header className="flex flex-wrap justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t('Notifications')}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t(
                                'Updates for your account. Opening the inbox does not mark them as read.',
                            )}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        disabled={
                            allForm.processing || unreadNotificationCount === 0
                        }
                        onClick={() =>
                            allForm.post(readAll().url, {
                                preserveScroll: true,
                            })
                        }
                    >
                        {t('Mark all as read')}
                    </Button>
                </header>
                <div className="flex flex-wrap gap-3">
                    <select
                        aria-label={t('Notification status')}
                        className="h-9 rounded-md border bg-card px-3 text-sm"
                        disabled={pending}
                        value={filters.status}
                        onChange={(event) =>
                            visit(
                                index({
                                    query: {
                                        status: event.target.value,
                                        page: 1,
                                    },
                                }).url,
                            )
                        }
                    >
                        <option value="">{t('All statuses')}</option>
                        <option value="unread">{t('Unread')}</option>
                        <option value="read">{t('Read')}</option>
                    </select>
                    <Button
                        variant="ghost"
                        disabled={pending}
                        onClick={() =>
                            visit(
                                index({ query: { status: filters.status } })
                                    .url,
                            )
                        }
                    >
                        {t('Refresh')}
                    </Button>
                </div>
                {Object.entries(errors).map(([key, value]) => (
                    <InputError key={key} message={String(value)} />
                ))}
                <DataTable
                    rows={notifications}
                    columns={columns}
                    pending={pending}
                    caption={t('Notifications')}
                    onNavigate={visit}
                    empty={
                        <p className="text-sm text-muted-foreground">
                            {t('No notifications found.')}
                        </p>
                    }
                />
            </main>
        </>
    );
}
Notifications.layout = {
    breadcrumbs: [{ title: 'Notifications', href: index() }],
};
