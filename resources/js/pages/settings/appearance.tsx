import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';
import { LanguageSwitcher } from '@/components/preferences-controls';
import { useI18n } from '@/lib/i18n';

export default function Appearance() {
    const { t } = useI18n();
    return (
        <>
            <Head title={t('Appearance settings')} />

            <h1 className="sr-only">{t('Appearance settings')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Update the appearance settings for your account"
                />
                <AppearanceTabs />
                <p className="text-sm text-muted-foreground">
                    {t('Your preference is remembered on this browser.')}
                </p>
                <Heading variant="small" title="Language" />
                <LanguageSwitcher />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
