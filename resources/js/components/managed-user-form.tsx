import { Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';
import { index, store, update } from '@/routes/users';
import type { ManagedUser } from '@/types/managed-user';

export function ManagedUserForm({
    user,
    roles,
    assignedRoles = [],
}: {
    user?: ManagedUser;
    roles: string[];
    assignedRoles?: string[];
}) {
    const { t } = useI18n();
    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        role: assignedRoles[0] ?? 'Viewer',
        is_active: user?.is_active ?? true,
    });
    return (
        <form
            className="max-w-2xl space-y-5 rounded-xl border bg-card p-6"
            onSubmit={(event) => {
                event.preventDefault();
                if (user) form.put(update(user.id).url);
                else form.post(store().url);
            }}
        >
            <p className="text-sm leading-6 text-muted-foreground">
                {t(
                    'New users set their own password using a password link. Email verification is still required.',
                )}
            </p>
            {assignedRoles.length > 1 && (
                <p role="status" className="text-sm text-destructive">
                    {t(
                        'Saving replaces all assigned roles with the selected role.',
                    )}
                </p>
            )}
            <div className="grid gap-2">
                <Label htmlFor="user-name">{t('Name')}</Label>
                <Input
                    id="user-name"
                    required
                    maxLength={255}
                    autoFocus
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                    aria-invalid={Boolean(form.errors.name)}
                />
                <InputError message={form.errors.name} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="user-email">{t('Email address')}</Label>
                <Input
                    id="user-email"
                    required
                    type="email"
                    maxLength={255}
                    value={form.data.email}
                    onChange={(event) =>
                        form.setData('email', event.target.value)
                    }
                    aria-invalid={Boolean(form.errors.email)}
                />
                <InputError message={form.errors.email} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="user-role">{t('Role')}</Label>
                <select
                    id="user-role"
                    className="h-10 rounded-md border bg-card px-3 text-sm"
                    value={form.data.role}
                    onChange={(event) =>
                        form.setData('role', event.target.value)
                    }
                >
                    {roles.map((role) => (
                        <option key={role}>{role}</option>
                    ))}
                </select>
                <InputError message={form.errors.role} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="user-active">{t('Account status')}</Label>
                <select
                    id="user-active"
                    className="h-10 rounded-md border bg-card px-3 text-sm"
                    value={form.data.is_active ? 'active' : 'inactive'}
                    onChange={(event) =>
                        form.setData(
                            'is_active',
                            event.target.value === 'active',
                        )
                    }
                >
                    <option value="active">{t('Active')}</option>
                    <option value="inactive">{t('Inactive')}</option>
                </select>
                <InputError message={form.errors.is_active} />
            </div>
            <div className="flex gap-3">
                <Button disabled={form.processing}>
                    {t(user ? 'Save changes' : 'Create user')}
                </Button>
                <Button variant="outline" asChild>
                    <Link
                        href={index()}
                        onClick={(event) => {
                            if (form.processing) event.preventDefault();
                        }}
                    >
                        {t('Cancel')}
                    </Link>
                </Button>
            </div>
        </form>
    );
}
