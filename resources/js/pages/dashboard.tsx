import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    Blocks,
    Check,
    Fingerprint,
    Palette,
    ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import { accountNavigation, visibleNavigation } from '@/lib/navigation';
import { dashboard } from '@/routes';
import { edit as profile } from '@/routes/profile';
import { edit as appearance } from '@/routes/appearance';
import { index as projects } from '@/routes/projects';

export default function Dashboard() {
    const { auth, branding, environment } = usePage().props;
    const { t, label } = useI18n();
    const shortcuts = visibleNavigation(
        accountNavigation,
        auth.permissions,
        Boolean(auth.user?.email_verified_at),
    );
    const foundations = [
        {
            icon: Fingerprint,
            title: 'Authentication',
            description:
                'Email and password access, recovery, and verification.',
        },
        {
            icon: ShieldCheck,
            title: 'Access control',
            description: 'Server-enforced roles and named permissions.',
        },
        {
            icon: Palette,
            title: 'Personal preferences',
            description: 'Persistent theme and language preferences.',
        },
    ];

    return (
        <>
            <Head title={t('Overview')} />
            <main className="space-y-8 p-4 sm:p-6 lg:p-8">
                <header className="space-y-2">
                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                        {t(
                            environment === 'local'
                                ? 'Development workspace'
                                : 'Application workspace',
                        )}
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        {t('Welcome back')},{' '}
                        <span className="break-words">{auth.user.name}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {label(branding.tagline)}
                    </p>
                </header>
                <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 sm:p-8">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-primary/8"
                    />
                    <div className="relative max-w-xl space-y-4">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Blocks className="size-6" />
                        </div>
                        <h2 className="text-xl font-semibold sm:text-2xl">
                            {t('Your workspace, ready to grow.')}
                        </h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                            {t(
                                'Start with a solid foundation. Add the modules your application needs, at your own pace.',
                            )}
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Button asChild>
                                <Link href={profile()}>
                                    {t('Account settings')}
                                    <ArrowUpRight className="size-4" />
                                </Link>
                            </Button>
                            {auth.user.email_verified_at && (
                                <Button variant="outline" asChild>
                                    <Link href={appearance()}>
                                        {t('Personalize your workspace')}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>
                <section aria-labelledby="quick-access" className="space-y-4">
                    <div>
                        <h2 id="quick-access" className="font-semibold">
                            {t('Quick access')}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('Everything starts with the essentials.')}
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {shortcuts.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="group flex min-w-0 items-start gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-primary/50"
                            >
                                {item.icon && (
                                    <item.icon className="mt-1 size-5 shrink-0 text-primary" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-medium">
                                        {label(item.title)}
                                    </h3>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        {t(
                                            item.title === 'Profile'
                                                ? 'Manage your identity and contact details.'
                                                : item.title === 'Security'
                                                  ? 'Keep your account and password secure.'
                                                  : 'Make this workspace feel like yours.',
                                        )}
                                    </p>
                                </div>
                                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                            </Link>
                        ))}
                    </div>
                </section>
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardContent className="space-y-5">
                            <h2 className="font-semibold">
                                {t('Included in your foundation')}
                            </h2>
                            {foundations.map(
                                ({ icon: Icon, title, description }) => (
                                    <div key={title} className="flex gap-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            <Icon className="size-4 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium">
                                                {label(title)}
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {label(description)}
                                            </p>
                                        </div>
                                    </div>
                                ),
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="space-y-5">
                            <h2 className="font-semibold">
                                {t('Your access')}
                            </h2>
                            <div>
                                <p className="mb-2 text-xs text-muted-foreground">
                                    {t('Assigned roles')}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {auth.roles.length ? (
                                        auth.roles.map((role) => (
                                            <span
                                                key={role}
                                                className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                            >
                                                {role}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-sm">
                                            {t('No role assigned')}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {t('Available permissions')}
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                    {auth.permissions.length}
                                </p>
                            </div>
                            {auth.user.email_verified_at && (
                                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Check className="size-4 text-primary" />
                                    {t('Your email is verified.')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <section className="rounded-xl border border-dashed p-6 text-center">
                    <h2 className="text-sm font-medium">
                        {t('Build on your foundation')}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('Your database-backed reference module is ready.')}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {t(
                            'Create, organize, and maintain projects with server-enforced permissions.',
                        )}
                    </p>
                    {auth.permissions.includes('projects.view') && (
                        <Button variant="outline" asChild className="mt-4">
                            <Link href={projects()}>
                                {t('Explore projects')}
                            </Link>
                        </Button>
                    )}
                </section>
            </main>
        </>
    );
}

Dashboard.layout = { breadcrumbs: [{ title: 'Overview', href: dashboard() }] };
