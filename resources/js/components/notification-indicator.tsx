import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { index } from '@/routes/notifications';

export function NotificationIndicator() {
    const { auth, unreadNotificationCount } = usePage().props;
    const { t } = useI18n();
    if (!auth.user?.email_verified_at) return null;
    return (
        <Button variant="ghost" size="icon" className="relative" asChild>
            <Link
                href={index()}
                aria-label={`${t('Notifications')}: ${unreadNotificationCount} ${t('Unread')}`}
            >
                <Bell className="size-4" />
                {unreadNotificationCount > 0 && (
                    <span
                        aria-hidden="true"
                        className="absolute -top-1 -right-1 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 text-primary-foreground"
                    >
                        {unreadNotificationCount > 99
                            ? '99+'
                            : unreadNotificationCount}
                    </span>
                )}
            </Link>
        </Button>
    );
}
