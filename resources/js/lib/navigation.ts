import {
    Folder,
    LayoutDashboard,
    Palette,
    ShieldCheck,
    UserRound,
    BookOpen,
    CircleHelp,
    History,
    Bell,
    Settings,
} from 'lucide-react';
import { index as projects } from '@/routes/projects';
import { index as users } from '@/routes/users';
import { index as activity } from '@/routes/activity';
import { index as notifications } from '@/routes/notifications';
import { edit as applicationSettings } from '@/routes/application-settings';
import { dashboard, documentation, help } from '@/routes';
import { edit as appearance } from '@/routes/appearance';
import { edit as profile } from '@/routes/profile';
import { edit as security } from '@/routes/security';
import type { NavItem } from '@/types';

type NavigationEntry = NavItem & { permission?: string; verified?: boolean };

export const workspaceNavigation: NavigationEntry[] = [
    {
        title: 'Overview',
        href: dashboard(),
        icon: LayoutDashboard,
        permission: 'dashboard.view',
        verified: true,
    },
    {
        title: 'Projects',
        href: projects(),
        icon: Folder,
        permission: 'projects.view',
        verified: true,
    },
];

export const accountNavigation: NavigationEntry[] = [
    { title: 'Profile', href: profile(), icon: UserRound },
    { title: 'Security', href: security(), icon: ShieldCheck, verified: true },
    { title: 'Appearance', href: appearance(), icon: Palette, verified: true },
];

export const systemNavigation: NavigationEntry[] = [
    {
        title: 'Application Settings',
        href: applicationSettings(),
        icon: Settings,
        permission: 'settings.view',
        verified: true,
    },
    {
        title: 'Notifications',
        href: notifications(),
        icon: Bell,
        verified: true,
    },
    {
        title: 'Activity Log',
        href: activity(),
        icon: History,
        permission: 'activity.view',
        verified: true,
    },
    {
        title: 'Users',
        href: users(),
        icon: UserRound,
        permission: 'users.view',
        verified: true,
    },
    { title: 'Help & Support', href: help(), icon: CircleHelp, verified: true },
];

export const documentationNavigation: NavigationEntry[] = [
    {
        title: 'Documentation',
        href: documentation(),
        icon: BookOpen,
        verified: true,
    },
];

export function visibleNavigation(
    items: NavigationEntry[],
    permissions: string[],
    verified: boolean,
) {
    return items.filter(
        (item) =>
            (!item.permission || permissions.includes(item.permission)) &&
            (!item.verified || verified),
    );
}
