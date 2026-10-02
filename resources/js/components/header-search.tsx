import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';
import { useI18n } from '@/lib/i18n';
import { guides } from '@/lib/documentation';
import { documentation } from '@/routes';
import {
    accountNavigation,
    workspaceNavigation,
    systemNavigation,
    documentationNavigation,
    visibleNavigation,
} from '@/lib/navigation';

export function HeaderSearch() {
    const { auth } = usePage().props;
    const { t, label, locale } = useI18n();
    const { setOpenMobile } = useSidebar();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === 'k'
            ) {
                event.preventDefault();
                setOpen((value) => !value);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);
    const entries = visibleNavigation(
        [
            ...workspaceNavigation,
            ...systemNavigation,
            ...accountNavigation,
            ...documentationNavigation,
        ],
        auth.permissions,
        Boolean(auth.user?.email_verified_at),
    ).filter((item) =>
        `${item.title} ${label(item.title)}`
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase()),
    );
    const guideEntries = auth.user?.email_verified_at
        ? guides
              .filter(
                  (guide) => !guide.adminOnly || auth.roles.includes('Admin'),
              )
              .filter((guide) =>
                  [guide.title[locale], ...guide.content[locale]]
                      .join(' ')
                      .toLocaleLowerCase()
                      .includes(query.trim().toLocaleLowerCase()),
              )
        : [];
    return (
        <>
            <Button
                variant="outline"
                className="size-9 shrink-0 px-0 md:h-9 md:w-72 md:justify-start md:px-3"
                aria-label={t('Search pages')}
                onClick={() => {
                    setQuery('');
                    setOpen(true);
                }}
            >
                <Search className="size-4 text-muted-foreground" />
                <span className="hidden text-muted-foreground md:inline">
                    {t('Search pages…')}
                </span>
                <kbd className="ms-auto hidden rounded border px-1 text-[10px] text-muted-foreground md:inline">
                    ⌘ / Ctrl K
                </kbd>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[80svh] overflow-y-auto">
                    <DialogTitle>{t('Search pages')}</DialogTitle>
                    <DialogDescription>
                        {t('Find pages available to your account.')}
                    </DialogDescription>
                    <Input
                        aria-label={t('Search pages')}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={t('Search pages…')}
                    />
                    <div className="space-y-1">
                        {entries.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-accent focus:bg-accent"
                                onClick={() => {
                                    setOpen(false);
                                    setOpenMobile(false);
                                }}
                            >
                                {item.icon && <item.icon className="size-4" />}
                                {label(item.title)}
                            </Link>
                        ))}
                        {guideEntries.map((guide) => (
                            <Link
                                key={guide.id}
                                href={`${documentation().url}#${guide.id}`}
                                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-accent focus:bg-accent"
                                onClick={() => {
                                    setOpen(false);
                                    setOpenMobile(false);
                                }}
                            >
                                <BookOpen className="size-4" />
                                {guide.title[locale]}
                            </Link>
                        ))}
                        {!entries.length && !guideEntries.length && (
                            <p
                                role="status"
                                className="p-4 text-sm text-muted-foreground"
                            >
                                {t('No pages found.')}
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
