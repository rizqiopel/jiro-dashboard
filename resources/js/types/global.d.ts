import type { Auth } from '@/types/auth';
import type { CustomTheme } from '@/hooks/use-custom-theme';
import type { Appearance } from '@/hooks/use-appearance';

declare global {
    interface Window {
        jiroDefaults?: CustomTheme & { appearance: Appearance };
    }
}

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            branding: { name: string; logo: string | null; tagline: string };
            locale: 'id' | 'en';
            environment: string;
            auth: Auth;
            sidebarOpen: boolean;
            unreadNotificationCount: number;
            themeDefaults: CustomTheme & { appearance: Appearance };
            support: {
                email: string | null;
                url: string | null;
                version: string;
            };
            [key: string]: unknown;
        };
    }
}
