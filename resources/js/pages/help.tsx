import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { documentation, help } from '@/routes';

export default function Help() {
    const { t, locale } = useI18n();
    const { support } = usePage().props;
    const questions =
        locale === 'id'
            ? [
                  [
                      'Mengapa akses ditolak?',
                      'Menu dan tindakan mengikuti izin akun. Pastikan email sudah terverifikasi. Hubungi administrator untuk meninjau role; jangan mencoba melewati kontrol akses.',
                  ],
                  [
                      'Bagaimana mereset password?',
                      'Keluar lalu gunakan Lupa password pada halaman masuk. Gunakan alamat email akun Anda. Pada pengembangan lokal, email masuk ke log server; di lingkungan nyata, hubungi administrator bila email tidak diterima.',
                  ],
                  [
                      'Mengapa tampilan atau bahasa berubah?',
                      'Preferensi disimpan di browser. Menghapus data situs atau menggunakan browser/perangkat lain akan mengembalikan default. Mode Sistem mengikuti tema perangkat.',
                  ],
                  [
                      'Bagaimana melaporkan masalah?',
                      'Hubungi administrator atau operator aplikasi. Sertakan halaman, waktu, langkah reproduksi, dan screenshot tanpa data rahasia. Jangan sertakan password, token, atau tautan verifikasi/reset.',
                  ],
              ]
            : [
                  [
                      'Why is access denied?',
                      'Menus and actions follow account permissions. Ensure your email is verified. Contact your administrator to review your role; do not bypass access controls.',
                  ],
                  [
                      'How do I reset my password?',
                      'Sign out and use Forgot password on the login page with your account email. Local development writes mail to server logs; in a live environment contact your administrator if delivery fails.',
                  ],
                  [
                      'Why did my appearance or language change?',
                      'Preferences are saved in your browser. Clearing site data or using another browser/device resets defaults. System mode follows your device theme.',
                  ],
                  [
                      'How do I report a problem?',
                      'Contact your application administrator or operator. Include the page, time, reproduction steps, and screenshots without secrets. Never include passwords, tokens, or verification/reset links.',
                  ],
              ];
    return (
        <>
            <Head title={t('Help & Support')} />
            <main className="space-y-6 p-4 sm:p-6 lg:p-8">
                <header>
                    <h1 className="text-2xl font-semibold">
                        {t('Help & Support')}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t(
                            'Answers to common questions and safe troubleshooting steps.',
                        )}
                    </p>
                </header>
                <div className="max-w-3xl space-y-3">
                    {questions.map(([question, answer]) => (
                        <details
                            key={question}
                            className="rounded-xl border bg-card p-5"
                        >
                            <summary className="cursor-pointer font-medium">
                                {question}
                            </summary>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                {answer}
                            </p>
                        </details>
                    ))}
                </div>
                <Button variant="outline" asChild>
                    <Link href={documentation()}>
                        {t('Read documentation')}
                    </Link>
                </Button>
                <section className="max-w-3xl space-y-3 rounded-xl border bg-card p-5">
                    <h2 className="font-semibold">{t('Contact support')}</h2>
                    {!support.email && !support.url && (
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'No support contact configured. Contact your administrator.',
                            )}
                        </p>
                    )}
                    {support.email && (
                        <a
                            className="block text-sm break-all underline underline-offset-4"
                            href={`mailto:${support.email}`}
                        >
                            {support.email}
                        </a>
                    )}
                    {support.url && (
                        <a
                            className="block text-sm break-all underline underline-offset-4"
                            href={support.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t('Open support website')}
                        </a>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {t('Starter version')}: {support.version}
                    </p>
                </section>
            </main>
        </>
    );
}

Help.layout = { breadcrumbs: [{ title: 'Help & Support', href: help() }] };
