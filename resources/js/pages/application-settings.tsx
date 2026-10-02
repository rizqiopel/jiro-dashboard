import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import { edit, update } from '@/routes/application-settings';

type Settings = {
    name: string;
    tagline: string | null;
    logo: string | null;
    support_email: string | null;
    support_url: string | null;
    default_locale: string;
    appearance: string;
    accent: string;
    sidebar: string;
    radius: string;
};
export default function ApplicationSettings({
    settings,
    revision,
    canUpdate,
}: {
    settings: Settings;
    revision: number;
    canUpdate: boolean;
}) {
    const { t, label } = useI18n();
    const form = useForm({
        ...settings,
        tagline: settings.tagline ?? '',
        logo: settings.logo ?? '',
        support_email: settings.support_email ?? '',
        support_url: settings.support_url ?? '',
        revision,
    });
    const textFields: {
        key: 'name' | 'tagline' | 'logo' | 'support_email' | 'support_url';
        title: TranslationKey;
        max: number;
        type?: string;
    }[] = [
        { key: 'name', title: 'Application name', max: 80 },
        { key: 'tagline', title: 'Tagline', max: 200 },
        { key: 'logo', title: 'Logo path', max: 255 },
        {
            key: 'support_email',
            title: 'Support email',
            max: 255,
            type: 'email',
        },
        { key: 'support_url', title: 'Support URL', max: 500, type: 'url' },
    ];
    const selects: {
        key: 'default_locale' | 'appearance' | 'accent' | 'sidebar' | 'radius';
        title: TranslationKey;
        options: string[];
    }[] = [
        {
            key: 'default_locale',
            title: 'Default language',
            options: ['id', 'en'],
        },
        {
            key: 'appearance',
            title: 'Default theme',
            options: ['system', 'light', 'dark'],
        },
        {
            key: 'accent',
            title: 'Accent color',
            options: ['teal', 'blue', 'violet', 'orange', 'slate'],
        },
        { key: 'sidebar', title: 'Sidebar color', options: ['dark', 'light'] },
        {
            key: 'radius',
            title: 'Corner radius',
            options: ['square', 'rounded', 'soft'],
        },
    ];
    return (
        <>
            <Head title={t('Application Settings')} />
            <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
                <header>
                    <h1 className="text-2xl font-semibold">
                        {t('Application Settings')}
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                        {t(
                            'Workspace defaults apply only when a browser has no saved preference.',
                        )}
                    </p>
                </header>
                <form
                    className="max-w-3xl space-y-6 rounded-xl border bg-card p-5 sm:p-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put(update().url);
                    }}
                >
                    <fieldset
                        disabled={!canUpdate || form.processing}
                        className="space-y-5"
                    >
                        {textFields.map((field) => (
                            <div key={field.key} className="grid gap-2">
                                <Label htmlFor={`setting-${field.key}`}>
                                    {t(field.title)}
                                </Label>
                                <Input
                                    id={`setting-${field.key}`}
                                    type={field.type ?? 'text'}
                                    maxLength={field.max}
                                    required={field.key === 'name'}
                                    value={form.data[field.key]}
                                    onChange={(event) =>
                                        form.setData(
                                            field.key,
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(
                                        form.errors[field.key],
                                    )}
                                />
                                <InputError message={form.errors[field.key]} />
                            </div>
                        ))}
                        <p className="text-xs leading-6 text-muted-foreground">
                            {t(
                                'Logo must be an existing image under public, for example /jiro-icon.svg. Support links use HTTPS. Leave optional fields blank to clear them.',
                            )}
                        </p>
                        <div className="grid gap-5 sm:grid-cols-2">
                            {selects.map((field) => (
                                <div key={field.key} className="grid gap-2">
                                    <Label htmlFor={`setting-${field.key}`}>
                                        {t(field.title)}
                                    </Label>
                                    <select
                                        id={`setting-${field.key}`}
                                        className="h-10 w-full rounded-md border bg-card px-3 text-sm"
                                        value={form.data[field.key]}
                                        onChange={(event) =>
                                            form.setData(
                                                field.key,
                                                event.target.value,
                                            )
                                        }
                                    >
                                        {field.options.map((value) => (
                                            <option key={value} value={value}>
                                                {value === 'id'
                                                    ? 'Indonesia'
                                                    : value === 'en'
                                                      ? 'English'
                                                      : label(
                                                            value[0].toUpperCase() +
                                                                value.slice(1),
                                                        )}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={form.errors[field.key]}
                                    />
                                </div>
                            ))}
                        </div>
                    </fieldset>
                    <InputError message={form.errors.revision} />
                    {canUpdate && (
                        <Button disabled={form.processing}>
                            {t('Save changes')}
                        </Button>
                    )}
                </form>
            </main>
        </>
    );
}
ApplicationSettings.layout = {
    breadcrumbs: [{ title: 'Application Settings', href: edit() }],
};
