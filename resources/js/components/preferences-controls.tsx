import { router } from '@inertiajs/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';
import { useI18n } from '@/lib/i18n';
import { update } from '@/routes/locale';

export function LanguageSwitcher() {
    const { locale, t } = useI18n();
    const [pending, setPending] = useState(false);

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    return (
        <select
            aria-label={t('Language')}
            value={locale}
            disabled={pending}
            className="h-9 max-w-36 rounded-lg border border-input bg-background px-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
            onChange={(event) => {
                setPending(true);
                router.post(
                    update().url,
                    { locale: event.target.value },
                    {
                        preserveScroll: true,
                        onError: () =>
                            toast.error(
                                t(
                                    'Could not update language. Please try again.',
                                ),
                            ),
                        onFinish: () => setPending(false),
                    },
                );
            }}
        >
            <option value="id">Indonesia</option>
            <option value="en">English</option>
        </select>
    );
}

export function PreferencesControls({
    compact = false,
}: {
    compact?: boolean;
}) {
    const { t } = useI18n();
    const { appearance, updateAppearance } = useAppearance();
    const Icon =
        appearance === 'system' ? Monitor : appearance === 'dark' ? Moon : Sun;

    return (
        <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label={t('Theme')}
                        className={
                            compact
                                ? 'hidden min-[380px]:inline-flex'
                                : undefined
                        }
                    >
                        <Icon className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup
                        value={appearance}
                        onValueChange={(value) =>
                            updateAppearance(value as Appearance)
                        }
                    >
                        <DropdownMenuRadioItem value="light">
                            <Sun className="me-2 size-4" />
                            {t('Light')}
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="dark">
                            <Moon className="me-2 size-4" />
                            {t('Dark')}
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="system">
                            <Monitor className="me-2 size-4" />
                            {t('System')}
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
