import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { guides } from '@/lib/documentation';
import { useI18n } from '@/lib/i18n';
import { documentation } from '@/routes';

export default function Documentation() {
    const { auth } = usePage().props;
    const { t, locale } = useI18n();
    const [query, setQuery] = useState('');
    const articles = guides
        .filter((guide) => !guide.adminOnly || auth.roles.includes('Admin'))
        .filter((guide) =>
            [guide.title[locale], ...guide.content[locale]]
                .join(' ')
                .toLocaleLowerCase()
                .includes(query.trim().toLocaleLowerCase()),
        );
    return (
        <>
            <Head title={t('Documentation')} />
            <main className="space-y-6 p-4 sm:p-6 lg:p-8">
                <header>
                    <h1 className="text-2xl font-semibold">
                        {t('Documentation')}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('Your guide to the Jiro workspace.')}
                    </p>
                </header>
                <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label={t('Search documentation')}
                    placeholder={t('Search documentation')}
                    className="max-w-xl"
                />
                <div className="grid items-start gap-6 lg:grid-cols-[220px_1fr]">
                    <nav
                        aria-label={t('Table of contents')}
                        className="space-y-2 rounded-xl border bg-card p-4 lg:sticky lg:top-20"
                    >
                        <h2 className="mb-3 font-medium">
                            {t('Table of contents')}
                        </h2>
                        {articles.map((article) => (
                            <a
                                key={article.id}
                                href={`#${article.id}`}
                                className="block rounded-md p-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                                {article.title[locale]}
                            </a>
                        ))}
                    </nav>
                    <div className="min-w-0 space-y-6">
                        {articles.map((article) => (
                            <article
                                key={article.id}
                                id={article.id}
                                className="scroll-mt-24 space-y-3 rounded-xl border bg-card p-5 sm:p-6"
                            >
                                <h2 className="text-lg font-semibold">
                                    {article.title[locale]}
                                </h2>
                                {article.content[locale].map(
                                    (paragraph, index) => (
                                        <p
                                            key={index}
                                            className="text-sm leading-7 text-muted-foreground"
                                        >
                                            {paragraph}
                                        </p>
                                    ),
                                )}
                            </article>
                        ))}
                        {!articles.length && (
                            <p
                                role="status"
                                className="text-sm text-muted-foreground"
                            >
                                {t('No guides found.')}
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

Documentation.layout = {
    breadcrumbs: [{ title: 'Documentation', href: documentation() }],
};
