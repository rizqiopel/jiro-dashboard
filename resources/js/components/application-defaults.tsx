import { usePage } from '@inertiajs/react';
import { useLayoutEffect } from 'react';
import { setAppearanceDefault } from '@/hooks/use-appearance';
import { setCustomThemeDefaults } from '@/hooks/use-custom-theme';

export function ApplicationDefaults() {
    const { themeDefaults, branding } = usePage().props;
    useLayoutEffect(() => {
        const previousName = document.documentElement.dataset.appName;
        document.documentElement.dataset.appName = branding.name;
        if (previousName && document.title.endsWith(` - ${previousName}`)) {
            document.title =
                document.title.slice(0, -previousName.length) + branding.name;
        }
        if (themeDefaults) {
            setAppearanceDefault(themeDefaults.appearance);
            setCustomThemeDefaults(themeDefaults);
        }
    }, [branding.name, themeDefaults]);
    return null;
}
