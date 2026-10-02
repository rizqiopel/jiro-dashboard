import { Head } from '@inertiajs/react';
import { ManagedUserForm } from '@/components/managed-user-form';
import { useI18n } from '@/lib/i18n';
import { index, create } from '@/routes/users';

export default function CreateUser({ roles }: { roles: string[] }) {
    const { t } = useI18n();
    return (
        <>
            <Head title={t('Create user')} />
            <main className="space-y-6 p-4 sm:p-6 lg:p-8">
                <h1 className="text-2xl font-semibold">{t('Create user')}</h1>
                <ManagedUserForm roles={roles} />
            </main>
        </>
    );
}
CreateUser.layout = {
    breadcrumbs: [
        { title: 'Users', href: index() },
        { title: 'Create user', href: create() },
    ],
};
