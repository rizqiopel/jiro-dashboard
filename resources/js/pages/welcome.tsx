import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { PreferencesControls } from '@/components/preferences-controls';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { dashboard, login } from '@/routes';
import { edit } from '@/routes/profile';

export default function Welcome() {
    const { auth, branding } = usePage().props;
    const { t, label } = useI18n();
    const canOpenDashboard =
        Boolean(auth.user?.email_verified_at) &&
        auth.permissions.includes('dashboard.view');
    return (
        <>
            <Head title={branding.name} />
            <div className="flex min-h-svh flex-col p-6 sm:p-10">
                <header className="flex justify-end">
                    <PreferencesControls />
                </header>
                <main className="m-auto max-w-xl space-y-6 py-16 text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                        {branding.logo ? (
                            <img
                                src={branding.logo}
                                alt=""
                                className="size-10 object-contain"
                            />
                        ) : (
                            <AppLogoIcon className="size-10 text-primary" />
                        )}
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {branding.name}
                    </h1>
                    <p className="text-muted-foreground">
                        {label(branding.tagline)}
                    </p>
                    <Button asChild>
                        <Link
                            href={
                                canOpenDashboard
                                    ? dashboard()
                                    : auth.user
                                      ? edit()
                                      : login()
                            }
                        >
                            {t(
                                canOpenDashboard
                                    ? 'Go to dashboard'
                                    : auth.user
                                      ? 'Account settings'
                                      : 'Log in',
                            )}
                        </Link>
                    </Button>
                </main>
            </div>
        </>
    );
}
