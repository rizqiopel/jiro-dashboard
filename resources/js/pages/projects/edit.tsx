import { Head } from '@inertiajs/react';
import { ProjectForm } from '@/components/project-form';
import { useI18n } from '@/lib/i18n';
import { index } from '@/routes/projects';
import type { Project } from '@/types/project';

export default function EditProject({ project }: { project: Project }) {
    const { t } = useI18n();
    return (
        <>
            <Head title={t('Edit project')} />
            <main className="space-y-6 p-4 sm:p-6 lg:p-8">
                <header>
                    <h1 className="text-2xl font-semibold">
                        {t('Edit project')}
                    </h1>
                    <p className="mt-2 text-sm break-words text-muted-foreground">
                        {project.name}
                    </p>
                </header>
                <ProjectForm project={project} />
            </main>
        </>
    );
}

EditProject.layout = {
    breadcrumbs: [
        { title: 'Projects', href: index() },
        { title: 'Edit project', href: '#' },
    ],
};
