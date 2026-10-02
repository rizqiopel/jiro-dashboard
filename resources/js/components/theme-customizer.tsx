import { Palette, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useCustomTheme, type CustomTheme } from '@/hooks/use-custom-theme';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';
import { useI18n } from '@/lib/i18n';

export function ThemeCustomizer() {
    const { t, label } = useI18n();
    const { theme, update, reset } = useCustomTheme();
    const { appearance, updateAppearance, resetAppearance } = useAppearance();
    const selectClass =
        'h-10 w-full rounded-md border border-input bg-background px-3 text-sm';
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('Customize theme')}
                >
                    <Palette className="size-4" />
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{t('Customize theme')}</SheetTitle>
                    <SheetDescription>
                        {t(
                            'Preview changes instantly. Preferences are saved in this browser.',
                        )}
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 p-4">
                    <div className="grid gap-2">
                        <Label htmlFor="custom-appearance">{t('Theme')}</Label>
                        <select
                            id="custom-appearance"
                            className={selectClass}
                            value={appearance}
                            onChange={(event) =>
                                updateAppearance(
                                    event.target.value as Appearance,
                                )
                            }
                        >
                            {['light', 'dark', 'system'].map((value) => (
                                <option key={value} value={value}>
                                    {label(
                                        value[0].toUpperCase() + value.slice(1),
                                    )}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="custom-accent">
                            {t('Accent color')}
                        </Label>
                        <select
                            id="custom-accent"
                            className={selectClass}
                            value={theme.accent}
                            onChange={(event) =>
                                update({
                                    ...theme,
                                    accent: event.target
                                        .value as CustomTheme['accent'],
                                })
                            }
                        >
                            {['teal', 'blue', 'violet', 'orange', 'slate'].map(
                                (value) => (
                                    <option key={value} value={value}>
                                        {label(
                                            value[0].toUpperCase() +
                                                value.slice(1),
                                        )}
                                    </option>
                                ),
                            )}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="custom-sidebar">
                            {t('Sidebar color')}
                        </Label>
                        <select
                            id="custom-sidebar"
                            className={selectClass}
                            value={theme.sidebar}
                            onChange={(event) =>
                                update({
                                    ...theme,
                                    sidebar: event.target
                                        .value as CustomTheme['sidebar'],
                                })
                            }
                        >
                            <option value="dark">{t('Dark')}</option>
                            <option value="light">{t('Light')}</option>
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="custom-radius">
                            {t('Corner radius')}
                        </Label>
                        <select
                            id="custom-radius"
                            className={selectClass}
                            value={theme.radius}
                            onChange={(event) =>
                                update({
                                    ...theme,
                                    radius: event.target
                                        .value as CustomTheme['radius'],
                                })
                            }
                        >
                            {['square', 'rounded', 'soft'].map((value) => (
                                <option key={value} value={value}>
                                    {label(
                                        value[0].toUpperCase() + value.slice(1),
                                    )}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            reset();
                            resetAppearance();
                        }}
                    >
                        <RotateCcw className="size-4" />
                        {t('Reset to default')}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
