import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { DataTable, type TableColumn } from '@/components/data-table';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';
import { index } from '@/routes/activity';
import type { Paginated } from '@/types/project';

type Activity = {
    id: number;
    event: string;
    subject_type: string;
    subject_id: number;
    actor: { id: number; name: string } | null;
    changed_fields: string[];
    created_at: string;
};
type Filters = {
    event: string;
    subject_type: string;
    subject_id: number | string;
};
export default function ActivityLog({
    activities,
    filters,
    events,
}: {
    activities: Paginated<Activity>;
    filters: Filters;
    events: string[];
}) {
    const { t, locale } = useI18n();
    const { errors } = usePage().props;
    const [subjectId, setSubjectId] = useState(String(filters.subject_id));
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
    const filter = (values: Partial<Filters>) =>
        visit(index({ query: { ...filters, ...values, page: 1 } }).url);
    const columns: TableColumn<Activity>[] = [
        {
            key: 'time',
            header: t('Time'),
            cell: (activity) => (
                <time dateTime={activity.created_at}>
                    {new Date(activity.created_at).toLocaleString(
                        locale === 'id' ? 'id-ID' : 'en-US',
                    )}
                </time>
            ),
        },
        {
            key: 'actor',
            header: t('Actor'),
            cell: (activity) => (
                <span className="block max-w-48 break-words">
                    {activity.actor?.name ?? t('Deleted account')}
                </span>
            ),
        },
        {
            key: 'event',
            header: t('Event'),
            cell: (activity) => (
                <code className="text-xs">{activity.event}</code>
            ),
        },
        {
            key: 'subject',
            header: t('Resource'),
            cell: (activity) =>
                `${activity.subject_type} #${activity.subject_id}`,
        },
        {
            key: 'fields',
            header: t('Changed fields'),
            cell: (activity) => activity.changed_fields.join(', ') || '—',
        },
    ];
    return (
        <>
            <Head title={t('Activity Log')} />
            <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
                <header>
                    <h1 className="text-2xl font-semibold">
                        {t('Activity Log')}
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                        {t(
                            'Recorded changes, not sensitive values. Older actions are not backfilled.',
                        )}
                    </p>
                </header>
                <form
                    className="flex flex-wrap gap-3"
                    onSubmit={(event) => {
                        event.preventDefault();
                        filter({ subject_id: subjectId });
                    }}
                >
                    <select
                        aria-label={t('Event')}
                        className="h-9 max-w-full rounded-md border bg-card px-3 text-sm"
                        value={filters.event}
                        disabled={pending}
                        onChange={(event) =>
                            filter({ event: event.target.value })
                        }
                    >
                        <option value="">{t('All events')}</option>
                        {events.map((event) => (
                            <option key={event}>{event}</option>
                        ))}
                    </select>
                    <select
                        aria-label={t('Resource')}
                        className="h-9 rounded-md border bg-card px-3 text-sm"
                        value={filters.subject_type}
                        disabled={pending}
                        onChange={(event) =>
                            filter({ subject_type: event.target.value })
                        }
                    >
                        <option value="">{t('All resources')}</option>
                        <option value="project">{t('Projects')}</option>
                        <option value="user">{t('Users')}</option>
                        <option value="settings">
                            {t('Application Settings')}
                        </option>
                    </select>
                    <Input
                        aria-label={t('Resource ID')}
                        placeholder={t('Resource ID')}
                        type="number"
                        min={1}
                        step={1}
                        className="w-40"
                        value={subjectId}
                        onChange={(event) => setSubjectId(event.target.value)}
                    />
                    <Button variant="outline" disabled={pending}>
                        {t('Search')}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={pending}
                        onClick={() => visit(index().url)}
                    >
                        {t('Reset filters')}
                    </Button>
                </form>
                {Object.entries(errors).map(([key, value]) => (
                    <InputError key={key} message={String(value)} />
                ))}
                <DataTable
                    rows={activities}
                    columns={columns}
                    pending={pending}
                    caption={t('Activity Log')}
                    onNavigate={visit}
                    empty={
                        <p className="text-sm text-muted-foreground">
                            {t('No activity recorded.')}
                        </p>
                    }
                />
            </main>
        </>
    );
}
ActivityLog.layout = {
    breadcrumbs: [{ title: 'Activity Log', href: index() }],
};
