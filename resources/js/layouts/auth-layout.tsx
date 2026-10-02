import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import { ApplicationDefaults } from '@/components/application-defaults';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description}>
            <ApplicationDefaults />
            {children}
        </AuthLayoutTemplate>
    );
}
