import { Head, Link } from '@inertiajs/react';
import { DeleteProject } from '@/components/delete-project';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { edit, index } from '@/routes/projects';
import type { Project } from '@/types/project';

export default function ShowProject({
    project,
    can,
}: {
    project: Project;
    can: { update: boolean; delete: boolean };
}) {
    const { t, locale } = useI18n();
    return (
        <>
            <Head title={project.name} />
            <main className="space-y-6 p-4 sm:p-6 lg:p-8">
                <header className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <p className="mb-2 text-sm text-muted-foreground">
                            {t('Project details')}
                        </p>
                        <h1 className="text-2xl font-semibold break-words">
                            {project.name}
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        {can.update && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={edit(project.id)}>{t('Edit')}</Link>
                            </Button>
                        )}
                        {can.delete && <DeleteProject project={project} />}
                    </div>
                </header>
                <dl className="max-w-3xl space-y-6 rounded-xl border bg-card p-6">
                    <div>
                        <dt className="text-sm text-muted-foreground">
                            {t('Status')}
                        </dt>
                        <dd className="mt-2 font-medium">
                            {t(
                                project.status === 'active'
                                    ? 'Active'
                                    : 'Archived',
                            )}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm text-muted-foreground">
                            {t('Description')}
                        </dt>
                        <dd className="mt-2 break-words whitespace-pre-wrap">
                            {project.description ||
                                t('No description provided.')}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm text-muted-foreground">
                            {t('Created')}
                        </dt>
                        <dd className="mt-2">
                            {new Date(project.created_at).toLocaleDateString(
                                locale,
                            )}
                        </dd>
                    </div>
                </dl>
                <Button variant="outline" asChild>
                    <Link href={index()}>{t('Back to projects')}</Link>
                </Button>
            </main>
        </>
    );
}

ShowProject.layout = {
    breadcrumbs: [
        { title: 'Projects', href: index() },
        { title: 'Project details', href: '#' },
    ],
};
