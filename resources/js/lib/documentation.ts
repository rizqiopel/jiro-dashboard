import type { Locale } from '@/lib/i18n';

export type Guide = {
    id: string;
    adminOnly?: boolean;
    title: Record<Locale, string>;
    content: Record<Locale, string[]>;
};

export const guides: Guide[] = [
    {
        id: 'application-settings',
        adminOnly: true,
        title: {
            id: 'Default aplikasi dan bantuan',
            en: 'Application defaults and support',
        },
        content: {
            id: [
                'Sistem → Pengaturan Aplikasi mengubah nama, tagline, path logo, kontak bantuan, bahasa default, serta tema/aksen/sidebar/radius default. Pengaturan tersimpan di database, bukan mengedit .env. Logo harus berupa gambar yang telah tersedia di public; unggah file tidak disediakan. URL bantuan harus HTTPS. Kontak dan branding adalah informasi publik, bukan tempat menyimpan rahasia.',
                'Default berlaku untuk browser yang belum memiliki pilihan tersimpan. Cookie/session bahasa dan pilihan tema browser tetap diprioritaskan. Reset ke default di Customize menghapus override tema dan memakai default aplikasi saat ini; bahasa masih dipilih terpisah. Browser/perangkat baru akan memakai default terbaru.',
                'Perubahan dicatat sebagai settings.updated dengan nama kolom saja, tanpa nilai kontak. Tidak ada broadcast notifikasi massal untuk perubahan default. Konflik sesi ditolak melalui revision; muat ulang sebelum menyimpan agar tidak menimpa perubahan Admin lain. Kontak bantuan dan versi starter tampil di Bantuan & Dukungan; ini bukan sistem tiket atau bukti dukungan aktif. Versi adalah label rilis starter di config/jiro.php, bukan versi PHP/Laravel.',
            ],
            en: [
                'System → Application Settings changes name, tagline, logo path, support contacts, default language and theme/accent/sidebar/radius. Settings persist in the database, not .env. Logos must be existing public images; file uploads are not provided. Support URLs require HTTPS. Branding and contacts are public information, not secret storage.',
                'Defaults apply only to browsers without saved choices. Language cookies/session and explicit browser theme choices win. Customize Reset to default clears theme overrides and adopts current application defaults; language remains separately selected. New browsers/devices use the latest defaults.',
                'Changes audit as settings.updated with field names only, not contact values. No mass notification broadcast for defaults. Revision conflicts are rejected; reload before saving to avoid overwriting another Admin. Help & Support displays contacts and starter version, not a ticket system or guarantee of active support. Version is a starter release label in config/jiro.php, not PHP/Laravel version.',
            ],
        },
    },
    {
        id: 'notifications',
        title: { id: 'Inbox notifikasi', en: 'Notification inbox' },
        content: {
            id: [
                'Buka ikon lonceng di header atau Sistem → Notifikasi. Badge menghitung notifikasi belum dibaca milik akun Anda. Membuka inbox tidak otomatis menandai dibaca; gunakan Tandai dibaca atau Tandai semua dibaca. Filter Dibaca/Belum dibaca tersimpan di URL. Hapus memerlukan konfirmasi dan hanya menghapus dari inbox Anda.',
                'Perubahan Project memberi tahu akun aktif terverifikasi yang memiliki izin projects.view, kecuali pelaku perubahan. Pembuatan/perubahan akun dan pengiriman tautan password oleh Admin memberi tahu akun terkait, bukan seluruh pengguna. Notifikasi akun baru dapat dibaca setelah login/verifikasi; notifikasi akun nonaktif tersedia setelah diaktifkan kembali.',
                'Isi berupa jenis perubahan, ID sumber daya, waktu, dan nama kolom—tanpa password, token, email, atau nilai Project. Badge diperbarui saat navigasi/muat ulang, bukan realtime; gunakan Muat ulang untuk pembaruan dari sesi lain. Tidak ada push, preferensi langganan, atau data historis. Menghapus profil juga menghapus inboxnya.',
            ],
            en: [
                'Open the header bell or System → Notifications. The badge counts your unread notifications. Opening the inbox does not mark them read; use Mark as read or Mark all as read. Read/unread filters stay in the URL. Deletion requires confirmation and affects only your inbox.',
                'Project changes notify other active verified accounts with projects.view. Administrator account creation/updates and password-link sends notify only the affected account. New-account notifications become accessible after login/verification; inactive accounts can access them after reactivation.',
                'Content contains event, resource ID, time and changed field names—no passwords, tokens, emails or Project values. Counts refresh on navigation/reload, not in realtime; use Refresh for other-session updates. No push, subscriptions or historical backfill. Profile deletion removes its inbox.',
            ],
        },
    },
    {
        id: 'activity',
        adminOnly: true,
        title: { id: 'Membaca log aktivitas', en: 'Reading the activity log' },
        content: {
            id: [
                'Sistem → Log Aktivitas mencatat pembuatan, perubahan, dan penghapusan Project; pembuatan/perubahan pengguna; perubahan/penghapusan profil; serta pengiriman tautan password oleh Admin yang berhasil. Pilih peristiwa, jenis sumber daya, atau ID untuk memfilter. Data lama tidak ditambahkan ulang.',
                'Log menyimpan waktu, ID pelaku/sumber daya, kode peristiwa, dan nama kolom yang berubah—bukan nilainya. Password, token, alamat email, deskripsi Project, dan payload request tidak disalin ke log. Nama pelaku ditampilkan dari akun saat ini; setelah akun dihapus, label Akun dihapus muncul. Log tidak memiliki tombol edit/hapus.',
                'Perubahan data dan log disimpan dalam satu transaksi; kegagalan log membatalkan perubahan. Email reset adalah efek eksternal: log dibuat setelah broker melaporkan pengiriman berhasil, bukan bukti penerimaan email. Login, penggantian password mandiri, perubahan lewat CLI/SQL, dan tamper-proof/retensi otomatis belum tercakup.',
            ],
            en: [
                'System → Activity Log records Project creation/update/deletion, managed-user creation/update, profile update/deletion, and successful administrator password-link sends. Filter by event, resource type, or ID. Historical actions are not backfilled.',
                'Records contain time, actor/resource IDs, event codes, and changed field names—not values. Passwords, tokens, email addresses, Project descriptions, and request payloads are not copied. Actor names come from the current account; deleted accounts show a fallback. No edit/delete UI exists.',
                'Data changes and audit records share a transaction; audit failure rolls back the mutation. Reset email is external: logging follows broker success, not inbox receipt. Login, self-service password changes, CLI/SQL writes, tamper-proof storage, and automatic retention are not covered.',
            ],
        },
    },
    {
        id: 'users',
        adminOnly: true,
        title: { id: 'Pengelolaan pengguna', en: 'User management' },
        content: {
            id: [
                'Admin membuka Sistem → Pengguna untuk mencari/filter akun, membuat pengguna, atau mengubah nama, email, role dan status aktif. Menyimpan memilih satu role baseline dan mengganti role sebelumnya.',
                'Pengguna baru tidak memiliki password default. Klik Kirim tautan password agar pengguna memilih password sendiri, lalu masuk dan verifikasi email. Pada pengembangan lokal, tautan dikirim ke log server yang harus dijaga kerahasiaannya.',
                'Nonaktif memblokir login dan mencabut remember token/sesi database. Admin tidak dapat menonaktifkan atau menurunkan role sendiri. Harus selalu ada minimal satu Admin aktif terverifikasi; proteksi ini juga berlaku pada penghapusan profil/perubahan email. Perubahan email menghapus verifikasi.',
            ],
            en: [
                'Admins open System → Users to search/filter accounts, create users, or change name, email, role and active status. Saving selects one baseline role and replaces previous roles.',
                'New users have no default password. Send a password link so the user can choose one, then sign in and verify email. Local development delivers links to sensitive server logs.',
                'Inactive status blocks login and revokes remember tokens/database sessions. Admins cannot deactivate or demote themselves. At least one active verified Admin must remain, including profile deletion/email changes. Email changes clear verification.',
            ],
        },
    },
    {
        id: 'getting-started',
        title: {
            id: 'Mulai menggunakan Jiro',
            en: 'Getting started with Jiro',
        },
        content: {
            id: [
                'Masuk menggunakan akun yang disediakan administrator. Registrasi publik tidak tersedia. Email harus terverifikasi untuk mengakses ruang kerja.',
                'Menu yang terlihat mengikuti izin akun. Profil, keamanan, dan tampilan tersedia pada bagian Akun. Kelompok menu dapat diciutkan; tombol pada tepi sidebar mengganti tampilan penuh menjadi ikon.',
                'Gunakan pencarian header atau Ctrl/Cmd + K untuk menemukan halaman yang tersedia. Ini adalah pencarian navigasi, bukan pencarian data proyek.',
            ],
            en: [
                'Sign in with an account provided by your administrator. Public registration is closed. A verified email is required to access the workspace.',
                'Visible menus follow your account permissions. Profile, security, and appearance are under Account. Menu groups can collapse; the edge button switches the sidebar between full and icon views.',
                'Use header search or Ctrl/Cmd + K to find available pages. This searches navigation, not project records.',
            ],
        },
    },
    {
        id: 'projects',
        title: { id: 'Mengelola proyek', en: 'Managing projects' },
        content: {
            id: [
                'Halaman Proyek menampilkan data dari database. Cari nama/deskripsi, filter status, urutkan kolom, atau pilih jumlah baris. Filter dan halaman disimpan di URL.',
                'Admin dapat membuat, mengedit, dan menghapus proyek; Editor dapat membuat dan mengedit; Viewer hanya membaca. Hak akses juga ditegakkan di server.',
                'Nama wajib diisi (maksimal 255 karakter), deskripsi opsional (maksimal 5000), dan status Aktif atau Diarsipkan. Arsip tidak menghapus data. Penghapusan setelah konfirmasi bersifat permanen.',
            ],
            en: [
                'Projects displays database records. Search names/descriptions, filter status, sort columns, or change page size. Filters and page are stored in the URL.',
                'Admins can create, edit, and delete; Editors can create and edit; Viewers can only read. Permissions are also enforced on the server.',
                'Name is required (up to 255 characters), description is optional (up to 5000), and status is Active or Archived. Archiving does not delete data. Confirmed deletion is permanent.',
            ],
        },
    },
    {
        id: 'preferences',
        title: {
            id: 'Tema, bahasa, dan akun',
            en: 'Theme, language, and account',
        },
        content: {
            id: [
                'Gunakan ikon palet untuk memilih warna aksen, warna sidebar, radius sudut, dan mode Terang/Gelap/Sistem. Perubahan langsung ditampilkan dan disimpan di browser; Reset mengembalikan teal/sidebar gelap/radius membulat/mode sistem.',
                'Bahasa Indonesia/English dipilih pada header dan disimpan lewat cookie terenkripsi serta session. Preferensi bukan pengaturan lintas perangkat.',
                'Profil mengubah nama/email. Perubahan email dapat membutuhkan verifikasi ulang. Keamanan mengubah password dan meminta password saat ini. Jangan bagikan password atau tautan reset.',
            ],
            en: [
                'Use the palette icon to choose accent color, sidebar color, corner radius, and Light/Dark/System mode. Changes preview immediately and persist in this browser; Reset restores teal/dark sidebar/rounded corners/system mode.',
                'Choose Indonesia/English in the header; language is stored in an encrypted cookie and session. Preferences are not cross-device account settings.',
                'Profile changes your name/email. Email changes can require verification again. Security changes your password and requires the current password. Never share passwords or reset links.',
            ],
        },
    },
    {
        id: 'development',
        adminOnly: true,
        title: { id: 'Panduan pengembangan', en: 'Development guide' },
        content: {
            id: [
                'Kode aplikasi asli menggunakan Laravel, Inertia, React, TypeScript, Tailwind, dan Wayfinder. Dokumentasi sumber tersedia di docs/PROJECT_OVERVIEW.md, docs/ADDING_MODULES.md, dan docs/AUTHORIZATION.md.',
                'Modul baru mengikuti model/migration/factory, policy, Form Request, controller/routes, halaman typed, navigasi/terjemahan, lalu tes. Jangan mengandalkan tombol tersembunyi untuk keamanan.',
                'Verifikasi dengan composer test, npm run check, npm run types:check, dan npm run build. Jalankan pemeriksaan browser memakai database terisolasi. Deployment nyata membutuhkan konfigurasi hosting, email, backup, serta pengujian tersendiri.',
            ],
            en: [
                'Original application code uses Laravel, Inertia, React, TypeScript, Tailwind, and Wayfinder. Source documentation is in docs/PROJECT_OVERVIEW.md, docs/ADDING_MODULES.md, and docs/AUTHORIZATION.md.',
                'New modules follow model/migration/factory, policy, Form Request, controller/routes, typed pages, navigation/translations, and tests. Hidden buttons are not security enforcement.',
                'Verify with composer test, npm run check, npm run types:check, and npm run build. Browser checks should use isolated data. Real deployment needs host/mail/backup configuration and separate verification.',
            ],
        },
    },
];
