import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { DataTable, type TableColumn } from '@/components/data-table';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useI18n } from '@/lib/i18n';
import { index, create, edit, resetPassword } from '@/routes/users';
import type { ManagedUser } from '@/types/managed-user';
import type { Paginated } from '@/types/project';

function SendPassword({ user }: { user: ManagedUser }) {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);
    const form = useForm({});
    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!form.processing) setOpen(value);
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={!user.is_active}>
                    {t('Send password link')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{t('Send password link')}</DialogTitle>
                <DialogDescription>
                    {t('The link lets this user choose a new password.')}{' '}
                    <span className="block break-all">{user.email}</span>
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
                        disabled={form.processing}
                        onClick={() =>
                            form.post(resetPassword(user.id).url, {
                                onSuccess: () => setOpen(false),
                            })
                        }
                    >
                        {t('Send')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
type Filters = { search: string; role: string; status: string };
export default function Users({
    users,
    filters,
    roles,
    can,
}: {
    users: Paginated<ManagedUser>;
    filters: Filters;
    roles: string[];
    can: { create: boolean; update: boolean; reset: boolean };
}) {
    const { t } = useI18n();
    const { errors } = usePage().props;
    const [search, setSearch] = useState(filters.search);
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
    const columns: TableColumn<ManagedUser>[] = [
        {
            key: 'name',
            header: t('Name'),
            cell: (user) => (
                <div className="max-w-xs break-words">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs break-all text-muted-foreground">
                        {user.email}
                    </p>
                </div>
            ),
        },
        {
            key: 'role',
            header: t('Role'),
            cell: (user) =>
                user.roles?.map((role) => role.name).join(', ') || '—',
        },
        {
            key: 'active',
            header: t('Status'),
            cell: (user) => t(user.is_active ? 'Active' : 'Inactive'),
        },
        {
            key: 'verified',
            header: t('Email verification'),
            cell: (user) =>
                t(user.email_verified_at ? 'Verified' : 'Unverified'),
        },
        {
            key: 'actions',
            header: t('Actions'),
            cell: (user) => (
                <div className="flex gap-2">
                    {can.update && (
                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href={edit(user.id)}
                                aria-label={`${t('Edit user')}: ${user.name}`}
                            >
                                {t('Edit')}
                            </Link>
                        </Button>
                    )}
                    {can.reset && <SendPassword user={user} />}
                </div>
            ),
        },
    ];
    return (
        <>
            <Head title={t('Users')} />
            <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
                <header className="flex flex-wrap justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{t('Users')}</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t('Manage user accounts and access.')}
                        </p>
                    </div>
                    {can.create && (
                        <Button asChild>
                            <Link href={create()}>{t('Create user')}</Link>
                        </Button>
                    )}
                </header>
                <form
                    className="flex flex-wrap gap-3"
                    onSubmit={(event) => {
                        event.preventDefault();
                        filter({ search });
                    }}
                >
                    <Input
                        aria-label={t('Search users')}
                        placeholder={t('Search users')}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="max-w-md"
                        maxLength={200}
                    />
                    <Button variant="outline" disabled={pending}>
                        {t('Search')}
                    </Button>
                    <select
                        aria-label={t('Role')}
                        className="h-9 rounded-md border bg-card px-3 text-sm"
                        disabled={pending}
                        value={filters.role}
                        onChange={(event) =>
                            filter({ role: event.target.value })
                        }
                    >
                        <option value="">{t('All roles')}</option>
                        {roles.map((role) => (
                            <option key={role}>{role}</option>
                        ))}
                    </select>
                    <select
                        aria-label={t('Account status')}
                        className="h-9 rounded-md border bg-card px-3 text-sm"
                        disabled={pending}
                        value={filters.status}
                        onChange={(event) =>
                            filter({ status: event.target.value })
                        }
                    >
                        <option value="">{t('All statuses')}</option>
                        <option value="active">{t('Active')}</option>
                        <option value="inactive">{t('Inactive')}</option>
                    </select>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => visit(index().url)}
                        disabled={pending}
                    >
                        {t('Reset filters')}
                    </Button>
                </form>
                {Object.entries(errors).map(([key, value]) => (
                    <InputError key={key} message={String(value)} />
                ))}
                <DataTable
                    rows={users}
                    columns={columns}
                    pending={pending}
                    caption={t('Users')}
                    onNavigate={visit}
                    empty={
                        <p className="text-sm text-muted-foreground">
                            {t('No users found.')}
                        </p>
                    }
                />
            </main>
        </>
    );
}
Users.layout = { breadcrumbs: [{ title: 'Users', href: index() }] };
