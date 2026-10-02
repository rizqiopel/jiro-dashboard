import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PreferencesControls } from '@/components/preferences-controls';
import { useI18n } from '@/lib/i18n';
import { dashboard, login } from '@/routes';

export default function ErrorPage({ status }: { status: number }) {
    const { auth, branding } = usePage().props;
    const { t } = useI18n();
    const canOpenDashboard =
        Boolean(auth.user?.email_verified_at) &&
        auth.permissions.includes('dashboard.view');
    const title =
        status === 403
            ? t('Access denied')
            : status === 404
              ? t('Page not found')
              : status === 503
                ? t('Temporarily unavailable')
                : t('Something went wrong');
    const description =
        status === 403
            ? t('Your account does not have permission to open this page.')
            : status === 404
              ? t('The page you are looking for does not exist or has moved.')
              : t('Please try again later.');
    return (
        <>
            <Head title={title} />
            <div className="flex min-h-svh flex-col bg-background p-6">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <span className="font-semibold">{branding.name}</span>
                    <PreferencesControls />
                </header>
                <main className="m-auto max-w-lg space-y-5 py-16 text-center">
                    <p className="text-6xl font-semibold text-primary">
                        {status}
                    </p>
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    <p className="text-muted-foreground">{description}</p>
                    <Button asChild>
                        <Link href={canOpenDashboard ? dashboard() : login()}>
                            {t(
                                canOpenDashboard
                                    ? 'Go to dashboard'
                                    : 'Go to login',
                            )}
                        </Link>
                    </Button>
                </main>
            </div>
        </>
    );
}
