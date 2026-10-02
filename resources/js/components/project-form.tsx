import { Link, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/lib/i18n';
import { index, show, store, update } from '@/routes/projects';
import type { Project } from '@/types/project';

export function ProjectForm({ project }: { project?: Project }) {
    const { t } = useI18n();
    const form = useForm({
        name: project?.name ?? '',
        description: project?.description ?? '',
        status: project?.status ?? 'active',
    });
    const container = useRef<HTMLFormElement>(null);
    const submit = () => {
        const options = {
            preserveScroll: true,
            onError: (errors: typeof form.errors) => {
                const name = ['name', 'description', 'status'].find((key) =>
                    Object.hasOwn(errors, key),
                );
                container.current
                    ?.querySelector<HTMLElement>(`[name="${name}"]`)
                    ?.focus();
            },
        };
        if (project) form.put(update(project.id).url, options);
        else form.post(store().url, options);
    };
    return (
        <form
            ref={container}
            className="max-w-2xl space-y-6 rounded-xl border bg-card p-5 sm:p-6"
            onSubmit={(event) => {
                event.preventDefault();
                submit();
            }}
        >
            <div className="grid gap-2">
                <Label htmlFor="name">{t('Name')}</Label>
                <Input
                    id="name"
                    name="name"
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                    required
                    maxLength={255}
                    autoFocus
                    aria-invalid={Boolean(form.errors.name)}
                    aria-describedby={
                        form.errors.name ? 'name-error' : undefined
                    }
                />
                <InputError id="name-error" message={form.errors.name} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">
                    {t('Description')}{' '}
                    <span className="text-muted-foreground">
                        ({t('Optional')})
                    </span>
                </Label>
                <textarea
                    id="description"
                    name="description"
                    value={form.data.description}
                    onChange={(event) =>
                        form.setData('description', event.target.value)
                    }
                    maxLength={5000}
                    rows={5}
                    className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    aria-invalid={Boolean(form.errors.description)}
                    aria-describedby={
                        form.errors.description
                            ? 'description-error'
                            : undefined
                    }
                />
                <InputError
                    id="description-error"
                    message={form.errors.description}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="status">{t('Status')}</Label>
                <select
                    id="status"
                    name="status"
                    value={form.data.status}
                    onChange={(event) =>
                        form.setData(
                            'status',
                            event.target.value as Project['status'],
                        )
                    }
                    className="h-10 rounded-md border border-input bg-card px-3 text-sm"
                    aria-invalid={Boolean(form.errors.status)}
                    aria-describedby={
                        form.errors.status ? 'status-error' : undefined
                    }
                >
                    <option value="active">{t('Active')}</option>
                    <option value="archived">{t('Archived')}</option>
                </select>
                <InputError id="status-error" message={form.errors.status} />
            </div>
            <div className="flex flex-wrap gap-3">
                <Button disabled={form.processing} type="submit">
                    {form.processing && <Spinner />}
                    {t(project ? 'Save changes' : 'Create project')}
                </Button>
                <Button variant="outline" asChild disabled={form.processing}>
                    <Link
                        href={project ? show(project.id) : index()}
                        aria-disabled={form.processing}
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
