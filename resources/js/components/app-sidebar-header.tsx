import { HeaderSearch } from '@/components/header-search';
import { ThemeCustomizer } from '@/components/theme-customizer';
import { NotificationIndicator } from '@/components/notification-indicator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { PreferencesControls } from '@/components/preferences-controls';
import { useI18n } from '@/lib/i18n';

export function AppSidebarHeader() {
    const { t } = useI18n();
    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                <SidebarTrigger
                    className="shrink-0 md:hidden"
                    aria-label={t('Toggle sidebar')}
                />
                <HeaderSearch />
            </div>
            <div className="flex shrink-0 items-center gap-1">
                <NotificationIndicator />
                <PreferencesControls compact />
                <ThemeCustomizer />
            </div>
        </header>
    );
}
