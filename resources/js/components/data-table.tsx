import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/lib/i18n';
import type { Paginated } from '@/types/project';

export type TableColumn<T> = {
    key: string;
    header: ReactNode;
    cell: (row: T) => ReactNode;
    sortDirection?: 'ascending' | 'descending' | 'none';
};

export function DataTable<T extends { id: number | string }>({
    rows,
    columns,
    pending,
    caption,
    empty,
    onNavigate,
}: {
    rows: Paginated<T>;
    columns: TableColumn<T>[];
    pending: boolean;
    caption: string;
    empty: ReactNode;
    onNavigate: (url: string) => void;
}) {
    const { t } = useI18n();
    return (
        <div className="min-w-0 space-y-4" aria-busy={pending}>
            <div
                role="status"
                aria-live="polite"
                className="flex h-5 items-center gap-2 text-xs text-muted-foreground"
            >
                {pending && (
                    <>
                        <Spinner />
                        {t('Loading results…')}
                    </>
                )}
            </div>
            <div className="overflow-x-auto rounded-xl border bg-card">
                <table className="w-full min-w-[640px] text-sm">
                    <caption className="sr-only">{caption}</caption>
                    <thead className="border-b bg-muted/50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    aria-sort={column.sortDirection}
                                    className="px-4 py-3 text-left font-medium"
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.data.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b last:border-0 hover:bg-muted/30"
                                data-project-id={row.id}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="px-4 py-4 align-top"
                                    >
                                        {column.cell(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!rows.data.length && (
                    <div className="p-10 text-center">{empty}</div>
                )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <p className="text-muted-foreground">
                    {t('Results')}: {rows.from ?? 0}–{rows.to ?? 0} /{' '}
                    {rows.total} · {t('Page')} {rows.current_page} /{' '}
                    {rows.last_page}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        disabled={pending || !rows.prev_page_url}
                        onClick={() =>
                            rows.prev_page_url && onNavigate(rows.prev_page_url)
                        }
                    >
                        {t('Previous')}
                    </Button>
                    <Button
                        variant="outline"
                        disabled={pending || !rows.next_page_url}
                        onClick={() =>
                            rows.next_page_url && onNavigate(rows.next_page_url)
                        }
                    >
                        {t('Next')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
