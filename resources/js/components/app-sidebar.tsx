import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import {
    accountNavigation,
    visibleNavigation,
    workspaceNavigation,
    systemNavigation,
    documentationNavigation,
} from '@/lib/navigation';
import { edit } from '@/routes/profile';

export function AppSidebar() {
    const { auth } = usePage().props;
    const { t } = useI18n();
    const { setOpenMobile, state, toggleSidebar } = useSidebar();
    const verified = Boolean(auth.user?.email_verified_at);
    const mainItems = visibleNavigation(
        workspaceNavigation,
        auth.permissions,
        verified,
    );
    const accountItems = visibleNavigation(
        accountNavigation,
        auth.permissions,
        verified,
    );

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="h-16 shrink-0 justify-center border-b border-sidebar-border px-2 py-0">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={mainItems[0]?.href ?? edit()}
                                prefetch
                                onClick={() => setOpenMobile(false)}
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <Button
                    className="absolute end-2 top-2 md:hidden"
                    variant="ghost"
                    size="icon"
                    aria-label={t('Close navigation')}
                    onClick={() => setOpenMobile(false)}
                >
                    <X />
                </Button>
            </SidebarHeader>

            <Button
                variant="outline"
                size="icon"
                className="absolute top-20 -right-3 z-30 hidden size-6 rounded-full border-border bg-background text-foreground shadow-sm md:flex"
                aria-label={t(
                    state === 'expanded'
                        ? 'Collapse sidebar'
                        : 'Expand sidebar',
                )}
                aria-expanded={state === 'expanded'}
                onClick={toggleSidebar}
            >
                {state === 'expanded' ? (
                    <ChevronLeft className="size-3" />
                ) : (
                    <ChevronRight className="size-3" />
                )}
            </Button>

            <SidebarContent className="gap-6 py-6">
                <NavMain items={mainItems} label={t('Workspace')} />
                <NavMain
                    items={visibleNavigation(
                        systemNavigation,
                        auth.permissions,
                        verified,
                    )}
                    label={t('System')}
                    groupId="system"
                />
                <NavMain
                    items={accountItems}
                    label={t('Account')}
                    groupId="account"
                />
                <div className="mx-2 border-t border-sidebar-border pt-4">
                    <NavMain
                        items={visibleNavigation(
                            documentationNavigation,
                            auth.permissions,
                            verified,
                        )}
                        label={t('Resources')}
                        groupId="resources"
                    />
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
