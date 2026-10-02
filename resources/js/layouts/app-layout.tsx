import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { ApplicationDefaults } from '@/components/application-defaults';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            <ApplicationDefaults />
            {children}
        </AppLayoutTemplate>
    );
}
