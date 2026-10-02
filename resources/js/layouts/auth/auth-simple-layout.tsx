import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { PreferencesControls } from '@/components/preferences-controls';
import { useI18n } from '@/lib/i18n';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title = '',
    description = '',
}: AuthLayoutProps) {
    const { branding } = usePage().props;
    const { label } = useI18n();
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="mb-4 flex w-full max-w-sm justify-end">
                <PreferencesControls />
            </div>
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                {branding.logo ? (
                                    <img
                                        src={branding.logo}
                                        alt=""
                                        className="size-9 object-contain"
                                    />
                                ) : (
                                    <AppLogoIcon className="size-9 text-primary" />
                                )}
                            </div>
                            <span>{branding.name}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">
                                {label(title)}
                            </h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {label(description)}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
