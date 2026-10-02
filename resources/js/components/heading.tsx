import { useI18n } from '@/lib/i18n';

export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    const { label } = useI18n();
    return (
        <header className={variant === 'small' ? '' : 'mb-8 space-y-0.5'}>
            <h2
                className={
                    variant === 'small'
                        ? 'mb-0.5 text-base font-medium'
                        : 'text-xl font-semibold tracking-tight'
                }
            >
                {label(title)}
            </h2>
            {description && (
                <p className="text-sm text-muted-foreground">
                    {label(description)}
                </p>
            )}
        </header>
    );
}
