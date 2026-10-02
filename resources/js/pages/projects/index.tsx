import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { DataTable, type TableColumn } from '@/components/data-table';
import { DeleteProject } from '@/components/delete-project';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';
import { create, edit, index, show } from '@/routes/projects';
import type { Paginated, Project, ProjectFilters } from '@/types/project';

type Props = {
    projects: Paginated<Project>;
    filters: ProjectFilters;
    can: { create: boolean; update: boolean; delete: boolean };
};

export default function Projects({ projects, filters, can }: Props) {
    const { t, locale } = useI18n();
    const { errors } = usePage().props;
    const [search, setSearch] = useState(filters.search);
    const [pending, setPending] = useState(false);
    const visit = (url: string) =>
        router.get(
            url,
            {},
            {
                preserveScroll: true,
                preserveState: false,
                onStart: () => setPending(true),
                onFinish: () => setPending(false),
            },
        );
    const filter = (values: Partial<ProjectFilters>) =>
        visit(index({ query: { ...filters, ...values, page: 1 } }).url);
    const heading = (key: ProjectFilters['sort'], title: string) => (
        <button
            type="button"
            disabled={pending}
            onClick={() =>
                filter({
                    sort: key,
                    direction:
                        filters.sort === key && filters.direction === 'asc'
                            ? 'desc'
                            : 'asc',
                })
            }
            className="flex items-center gap-2"
        >
            {title}
            {filters.sort === key &&
                (filters.direction === 'asc' ? (
                    <ArrowUp className="size-3" />
                ) : (
                    <ArrowDown className="size-3" />
                ))}
        </button>
    );
    const columns: TableColumn<Project>[] = [
        {
            key: 'name',
            header: heading('name', t('Name')),
            sortDirection:
                filters.sort === 'name'
                    ? filters.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                    : 'none',
            cell: (project) => (
                <Link
                    href={show(project.id)}
                    className="block max-w-xs font-medium break-words text-primary hover:underline"
                >
                    {project.name}
                </Link>
            ),
        },
        {
            key: 'status',
            header: heading('status', t('Status')),
            sortDirection:
                filters.sort === 'status'
                    ? filters.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                    : 'none',
            cell: (project) => (
                <span className="rounded-md bg-muted px-2 py-1 text-xs">
                    {t(project.status === 'active' ? 'Active' : 'Archived')}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: heading('created_at', t('Created')),
            sortDirection:
                filters.sort === 'created_at'
                    ? filters.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                    : 'none',
            cell: (project) =>
                new Date(project.created_at).toLocaleDateString(locale),
        },
        {
            key: 'actions',
            header: t('Actions'),
            cell: (project) => (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={show(project.id)}>{t('View')}</Link>
                    </Button>
                    {can.update && (
                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href={edit(project.id)}
                                aria-label={`${t('Edit project')}: ${project.name}`}
                            >
                                {t('Edit')}
                            </Link>
                        </Button>
                    )}
                    {can.delete && <DeleteProject project={project} />}
                </div>
            ),
        },
    ];
    return (
        <>
            <Head title={t('Projects')} />
            <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
                <header className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t('Projects')}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t('Manage projects in your shared workspace.')}
                        </p>
                    </div>
                    {can.create && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus className="size-4" />
                                {t('Create project')}
                            </Link>
                        </Button>
                    )}
                </header>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        filter({ search });
                    }}
                    className="flex flex-wrap items-center gap-3"
                >
                    <div className="flex min-w-0 flex-1 basis-64 gap-2">
                        <Input
                            aria-label={t('Search projects')}
                            placeholder={t('Search projects')}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            maxLength={200}
                            disabled={pending}
                        />
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={pending}
                        >
                            <Search className="size-4" />
                            {t('Search')}
                        </Button>
                    </div>
                    <select
                        aria-label={t('Filter status')}
                        value={filters.status}
                        disabled={pending}
                        onChange={(event) =>
                            filter({
                                status: event.target
                                    .value as ProjectFilters['status'],
                            })
                        }
                        className="h-9 rounded-md border bg-card px-3 text-sm"
                    >
                        <option value="">{t('All statuses')}</option>
                        <option value="active">{t('Active')}</option>
                        <option value="archived">{t('Archived')}</option>
                    </select>
                    <select
                        aria-label={t('Rows per page')}
                        value={filters.per_page}
                        disabled={pending}
                        onChange={(event) =>
                            filter({ per_page: Number(event.target.value) })
                        }
                        className="h-9 rounded-md border bg-card px-3 text-sm"
                    >
                        {[10, 25, 50].map((value) => (
                            <option key={value} value={value}>
                                {value} / {t('Page')}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={pending}
                        onClick={() => visit(index().url)}
                    >
                        {t('Reset filters')}
                    </Button>
                </form>
                {Object.entries(errors).map(([key, message]) => (
                    <InputError key={key} message={String(message)} />
                ))}
                <DataTable
                    rows={projects}
                    columns={columns}
                    pending={pending}
                    caption={t('Projects')}
                    onNavigate={visit}
                    empty={
                        <div className="space-y-2">
                            <h2 className="font-medium">
                                {t('No projects found')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    projects.total === 0 &&
                                        !filters.search &&
                                        !filters.status
                                        ? 'Create your first project to get started.'
                                        : 'Try changing your filters or going to the previous page.',
                                )}
                            </p>
                        </div>
                    }
                />
            </main>
        </>
    );
}

Projects.layout = { breadcrumbs: [{ title: 'Projects', href: index() }] };
