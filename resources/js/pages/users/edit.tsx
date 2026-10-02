import { Head } from '@inertiajs/react';
import { ManagedUserForm } from '@/components/managed-user-form';
import { useI18n } from '@/lib/i18n';
import { index } from '@/routes/users';
import type { ManagedUser } from '@/types/managed-user';

export default function EditUser({
    managedUser,
    roles,
    assignedRoles,
}: {
    managedUser: ManagedUser;
    roles: string[];
    assignedRoles: string[];
}) {
    const { t } = useI18n();
    return (
        <>
            <Head title={t('Edit user')} />
            <main className="space-y-6 p-4 sm:p-6 lg:p-8">
                <h1 className="text-2xl font-semibold">{t('Edit user')}</h1>
                <ManagedUserForm
                    user={managedUser}
                    roles={roles}
                    assignedRoles={assignedRoles}
                />
            </main>
        </>
    );
}
EditUser.layout = {
    breadcrumbs: [
        { title: 'Users', href: index() },
        { title: 'Edit user', href: '#' },
    ],
};
