import { Head } from '@inertiajs/react';
import { ProjectForm } from '@/components/project-form';
import { useI18n } from '@/lib/i18n';
import { create, index } from '@/routes/projects';

export default function CreateProject() {
    const { t } = useI18n();
    return (
        <>
            <Head title={t('Create project')} />
            <main className="space-y-6 p-4 sm:p-6 lg:p-8">
                <header>
                    <h1 className="text-2xl font-semibold">
                        {t('Create project')}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('Add a project to your shared workspace.')}
                    </p>
                </header>
                <ProjectForm />
            </main>
        </>
    );
}

CreateProject.layout = {
    breadcrumbs: [
        { title: 'Projects', href: index() },
        { title: 'Create project', href: create() },
    ],
};
