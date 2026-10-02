import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import { useI18n } from '@/lib/i18n';

export function NavMain({
    items,
    label = 'Workspace',
    groupId = 'workspace',
}: {
    items: NavItem[];
    label?: string;
    groupId?: string;
}) {
    const { isCurrentUrl } = useCurrentUrl();
    const { label: translate } = useI18n();
    const { setOpenMobile, state, isMobile } = useSidebar();
    const id = useId();
    const [expanded, setExpanded] = useState(() => {
        try {
            return localStorage.getItem(`jiro.nav.${groupId}`) !== 'closed';
        } catch {
            return true;
        }
    });
    const iconOnly = state === 'collapsed' && !isMobile;

    if (!items.length) return null;

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel
                asChild
                className="mb-2 text-[11px] font-semibold tracking-widest text-sidebar-foreground/55 uppercase"
            >
                <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={id}
                    onClick={() => {
                        setExpanded(!expanded);
                        try {
                            localStorage.setItem(
                                `jiro.nav.${groupId}`,
                                expanded ? 'closed' : 'open',
                            );
                        } catch {
                            /* In-memory fallback. */
                        }
                    }}
                    className="w-full justify-between hover:text-sidebar-foreground"
                >
                    {label}
                    <ChevronDown
                        className={`size-3 transition-transform ${expanded ? '' : '-rotate-90'}`}
                    />
                </button>
            </SidebarGroupLabel>
            <SidebarMenu
                id={id}
                style={{ display: !expanded && !iconOnly ? 'none' : undefined }}
            >
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: translate(item.title) }}
                            className="h-10 rounded-lg text-sidebar-foreground/75 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                        >
                            <Link
                                href={item.href}
                                prefetch
                                onClick={() => setOpenMobile(false)}
                                aria-current={
                                    isCurrentUrl(item.href) ? 'page' : undefined
                                }
                            >
                                {item.icon && <item.icon />}
                                <span>{translate(item.title)}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
