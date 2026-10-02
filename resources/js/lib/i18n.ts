import { usePage } from '@inertiajs/react';

const indonesian = {
    'Application Settings': 'Pengaturan Aplikasi',
    'Application name': 'Nama aplikasi',
    Tagline: 'Tagline',
    'Logo path': 'Path logo',
    'Support email': 'Email bantuan',
    'Support URL': 'URL bantuan',
    'Default language': 'Bahasa default',
    'Default theme': 'Tema default',
    'Workspace defaults apply only when a browser has no saved preference.':
        'Default ruang kerja berlaku hanya jika browser belum menyimpan preferensi.',
    'Logo must be an existing image under public, for example /jiro-icon.svg. Support links use HTTPS. Leave optional fields blank to clear them.':
        'Logo harus berupa gambar yang tersedia di public, misalnya /jiro-icon.svg. Tautan bantuan menggunakan HTTPS. Kosongkan kolom opsional untuk menghapusnya.',
    'Contact support': 'Hubungi bantuan',
    'Open support website': 'Buka situs bantuan',
    'Starter version': 'Versi starter',
    'No support contact configured. Contact your administrator.':
        'Kontak bantuan belum diatur. Hubungi administrator Anda.',
    Notifications: 'Notifikasi',
    Unread: 'Belum dibaca',
    Read: 'Dibaca',
    Refresh: 'Muat ulang',
    'Mark as read': 'Tandai dibaca',
    'Mark all as read': 'Tandai semua dibaca',
    'Delete notification?': 'Hapus notifikasi?',
    'This removes this notification from your inbox only.':
        'Hanya menghapus notifikasi ini dari inbox Anda.',
    'Notification status': 'Status notifikasi',
    'No notifications found.': 'Tidak ada notifikasi.',
    'Updates for your account. Opening the inbox does not mark them as read.':
        'Pembaruan untuk akun Anda. Membuka inbox tidak otomatis menandai dibaca.',
    'A project was created.': 'Sebuah proyek dibuat.',
    'A project was updated.': 'Sebuah proyek diperbarui.',
    'A project was deleted.': 'Sebuah proyek dihapus.',
    'Your account was created.': 'Akun Anda dibuat.',
    'Your account was updated.': 'Akun Anda diperbarui.',
    'A password link was sent for your account.':
        'Tautan password dikirim untuk akun Anda.',
    'Workspace update': 'Pembaruan ruang kerja',
    'Activity Log': 'Log Aktivitas',
    Time: 'Waktu',
    Actor: 'Pelaku',
    Event: 'Peristiwa',
    Resource: 'Sumber daya',
    'Changed fields': 'Kolom berubah',
    'Deleted account': 'Akun dihapus',
    'All events': 'Semua peristiwa',
    'All resources': 'Semua sumber daya',
    'Resource ID': 'ID sumber daya',
    'No activity recorded.': 'Belum ada aktivitas tercatat.',
    'Recorded changes, not sensitive values. Older actions are not backfilled.':
        'Mencatat perubahan, bukan nilai sensitif. Aktivitas sebelum modul ini tidak ditambahkan ulang.',
    Verified: 'Terverifikasi',
    Users: 'Pengguna',
    Role: 'Role',
    Inactive: 'Nonaktif',
    Unverified: 'Belum terverifikasi',
    'Create user': 'Tambah pengguna',
    'Edit user': 'Edit pengguna',
    'Search users': 'Cari pengguna',
    'Account status': 'Status akun',
    'All roles': 'Semua role',
    'No users found.': 'Pengguna tidak ditemukan.',
    'Manage user accounts and access.': 'Kelola akun dan akses pengguna.',
    'Send password link': 'Kirim tautan password',
    Send: 'Kirim',
    'The link lets this user choose a new password.':
        'Tautan memungkinkan pengguna memilih password baru.',
    'New users set their own password using a password link. Email verification is still required.':
        'Pengguna baru mengatur password sendiri melalui tautan password. Verifikasi email tetap diperlukan.',
    'Saving replaces all assigned roles with the selected role.':
        'Menyimpan akan mengganti semua role dengan role yang dipilih.',
    Documentation: 'Dokumentasi',
    Resources: 'Sumber daya',
    'Help & Support': 'Bantuan & Dukungan',
    'Your guide to the Jiro workspace.': 'Panduan ruang kerja Jiro Anda.',
    'Search documentation': 'Cari dokumentasi',
    'Table of contents': 'Daftar isi',
    'No guides found.': 'Panduan tidak ditemukan.',
    'Answers to common questions and safe troubleshooting steps.':
        'Jawaban pertanyaan umum dan langkah troubleshooting yang aman.',
    'Read documentation': 'Baca dokumentasi',
    'Customize theme': 'Sesuaikan tema',
    'Preview changes instantly. Preferences are saved in this browser.':
        'Pratinjau langsung. Preferensi disimpan di browser ini.',
    'Accent color': 'Warna aksen',
    'Sidebar color': 'Warna sidebar',
    'Corner radius': 'Radius sudut',
    'Reset to default': 'Reset ke default',
    'Collapse sidebar': 'Ciutkan sidebar',
    'Expand sidebar': 'Perluas sidebar',
    'Search pages': 'Cari halaman',
    'Search pages…': 'Cari halaman…',
    'Find pages available to your account.':
        'Temukan halaman yang tersedia untuk akun Anda.',
    'No pages found.': 'Halaman tidak ditemukan.',
    Teal: 'Teal',
    Blue: 'Biru',
    Violet: 'Ungu',
    Orange: 'Oranye',
    Slate: 'Abu-abu',
    Square: 'Kotak',
    Rounded: 'Membulat',
    Soft: 'Lembut',
    Projects: 'Proyek',
    'Build on your foundation': 'Kembangkan fondasi Anda',
    'Your database-backed reference module is ready.':
        'Modul referensi berbasis database Anda sudah siap.',
    'Create, organize, and maintain projects with server-enforced permissions.':
        'Buat dan kelola proyek dengan permission yang ditegakkan di server.',
    'Explore projects': 'Buka proyek',
    'Create project': 'Buat proyek',
    'Edit project': 'Edit proyek',
    'Delete project': 'Hapus proyek',
    'Project details': 'Detail proyek',
    'Back to projects': 'Kembali ke proyek',
    'Manage projects in your shared workspace.':
        'Kelola proyek dalam ruang kerja bersama.',
    'Add a project to your shared workspace.':
        'Tambahkan proyek ke ruang kerja bersama.',
    Description: 'Deskripsi',
    Optional: 'Opsional',
    Status: 'Status',
    Active: 'Aktif',
    Archived: 'Diarsipkan',
    Created: 'Dibuat',
    Actions: 'Tindakan',
    View: 'Lihat',
    Edit: 'Edit',
    Delete: 'Hapus',
    'Save changes': 'Simpan perubahan',
    'Search projects': 'Cari proyek',
    Search: 'Cari',
    'Filter status': 'Filter status',
    'Rows per page': 'Baris per halaman',
    'All statuses': 'Semua status',
    'Reset filters': 'Reset filter',
    'No projects found': 'Tidak ada proyek',
    'Create your first project to get started.':
        'Buat proyek pertama Anda untuk memulai.',
    'Try changing your filters or going to the previous page.':
        'Ubah filter atau kembali ke halaman sebelumnya.',
    'Loading results…': 'Memuat hasil…',
    Results: 'Hasil',
    Page: 'Halaman',
    Previous: 'Sebelumnya',
    Next: 'Berikutnya',
    'No description provided.': 'Belum ada deskripsi.',
    'This permanently deletes the project. This cannot be undone.':
        'Proyek akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
    'Confirm deletion': 'Konfirmasi penghapusan',
    'Could not delete the project. Please try again.':
        'Proyek gagal dihapus. Silakan coba lagi.',
    Overview: 'Ringkasan',
    Dashboard: 'Dashboard',
    Workspace: 'Ruang kerja',
    Account: 'Akun',
    Profile: 'Profil',
    Security: 'Keamanan',
    Appearance: 'Tampilan',
    Settings: 'Pengaturan',
    Language: 'Bahasa',
    Theme: 'Tema',
    Light: 'Terang',
    Dark: 'Gelap',
    System: 'Sistem',
    'Log out': 'Keluar',
    Navigation: 'Navigasi',
    'Close navigation': 'Tutup navigasi',
    'Toggle sidebar': 'Buka/tutup sidebar',
    Breadcrumb: 'Jejak navigasi',
    'A foundation for what comes next.': 'Fondasi untuk kebutuhan berikutnya.',
    'Development workspace': 'Ruang pengembangan',
    'Application workspace': 'Ruang aplikasi',
    'Welcome back': 'Selamat datang kembali',
    'Your workspace, ready to grow.': 'Ruang kerja Anda, siap berkembang.',
    'Start with a solid foundation. Add the modules your application needs, at your own pace.':
        'Mulai dari fondasi yang solid. Tambahkan modul sesuai kebutuhan aplikasi Anda, secara bertahap.',
    'Account settings': 'Pengaturan akun',
    'Personalize your workspace': 'Sesuaikan ruang kerja',
    'Quick access': 'Akses cepat',
    'Everything starts with the essentials.': 'Semuanya dimulai dari fondasi.',
    'Manage your identity and contact details.':
        'Kelola identitas dan informasi kontak Anda.',
    'Keep your account and password secure.':
        'Jaga keamanan akun dan password Anda.',
    'Make this workspace feel like yours.':
        'Atur ruang kerja sesuai preferensi Anda.',
    'Your access': 'Akses Anda',
    'Assigned roles': 'Role yang diberikan',
    'Available permissions': 'Permission yang tersedia',
    'Your email is verified.': 'Email Anda telah terverifikasi.',
    'No role assigned': 'Belum ada role',
    'Included in your foundation': 'Tersedia dalam fondasi',
    Authentication: 'Autentikasi',
    'Email and password access, recovery, and verification.':
        'Akses email dan password, pemulihan, serta verifikasi.',
    'Access control': 'Kontrol akses',
    'Server-enforced roles and named permissions.':
        'Role dan permission ditegakkan di backend.',
    'Personal preferences': 'Preferensi pribadi',
    'Persistent theme and language preferences.':
        'Preferensi tema dan bahasa yang tersimpan.',
    'A clean starting point': 'Titik awal yang bersih',
    'No business data yet. Your first module belongs here.':
        'Belum ada data bisnis. Modul pertama Anda akan dikembangkan di sini.',
    'Reference CRUD is the next development milestone, not a simulated dataset.':
        'Contoh CRUD adalah tahap pengembangan berikutnya, bukan kumpulan data simulasi.',
    'Profile settings': 'Pengaturan profil',
    'Security settings': 'Pengaturan keamanan',
    'Appearance settings': 'Pengaturan tampilan',
    'Manage your profile and account settings':
        'Kelola profil dan pengaturan akun Anda',
    'Update your name and email address': 'Perbarui nama dan alamat email Anda',
    Name: 'Nama',
    'Full name': 'Nama lengkap',
    'Email address': 'Alamat email',
    Save: 'Simpan',
    Cancel: 'Batal',
    Password: 'Password',
    'Show password': 'Tampilkan password',
    'Hide password': 'Sembunyikan password',
    'Update password': 'Perbarui password',
    'Ensure your account is using a long, random password to stay secure':
        'Gunakan password panjang dan unik agar akun tetap aman',
    'Current password': 'Password saat ini',
    'New password': 'Password baru',
    'Confirm password': 'Konfirmasi password',
    'Update the appearance settings for your account':
        'Atur tema dan bahasa untuk ruang kerja Anda',
    'Your preference is remembered on this browser.':
        'Preferensi Anda tersimpan di browser ini.',
    'Delete account': 'Hapus akun',
    'Delete your account and all of its resources':
        'Hapus akun dan seluruh data terkait',
    Warning: 'Peringatan',
    'Please proceed with caution, this cannot be undone.':
        'Lanjutkan dengan hati-hati. Tindakan ini tidak dapat dibatalkan.',
    'Are you sure you want to delete your account?':
        'Yakin ingin menghapus akun Anda?',
    'Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.':
        'Setelah akun dihapus, data terkait akan dihapus permanen. Masukkan password untuk mengonfirmasi penghapusan akun.',
    'Your email address is unverified.':
        'Alamat email Anda belum terverifikasi.',
    'Click here to re-send the verification email.':
        'Kirim ulang email verifikasi.',
    'A new verification link has been sent to your email address.':
        'Tautan verifikasi baru telah dikirim ke alamat email Anda.',
    'Log in': 'Masuk',
    'Log in to your account': 'Masuk ke akun Anda',
    'Enter your email and password below to log in':
        'Masukkan email dan password untuk masuk',
    'Forgot your password?': 'Lupa password?',
    'Remember me': 'Ingat saya',
    'Forgot password': 'Lupa password',
    'Enter your email to receive a password reset link':
        'Masukkan email untuk menerima tautan reset password',
    'Email password reset link': 'Kirim tautan reset password',
    'Or, return to': 'Atau, kembali ke',
    'log in': 'halaman masuk',
    'Email verification': 'Verifikasi email',
    'Please verify your email address by clicking on the link we just emailed to you.':
        'Verifikasi email dengan membuka tautan yang dikirim ke alamat email Anda.',
    'Resend verification email': 'Kirim ulang email verifikasi',
    'Reset password': 'Reset password',
    'Please enter your new password below': 'Masukkan password baru Anda',
    'Confirm your password': 'Konfirmasi password Anda',
    'This is a secure area of the application. Please confirm your password before continuing.':
        'Area ini dilindungi. Konfirmasi password Anda sebelum melanjutkan.',
    'Confirm password to continue': 'Konfirmasi password untuk melanjutkan',
    'Could not update language. Please try again.':
        'Bahasa gagal diperbarui. Silakan coba lagi.',
    'Page not found': 'Halaman tidak ditemukan',
    'The page you are looking for does not exist or has moved.':
        'Halaman yang Anda cari tidak ada atau telah dipindahkan.',
    'Access denied': 'Akses ditolak',
    'Your account does not have permission to open this page.':
        'Akun Anda tidak memiliki izin untuk membuka halaman ini.',
    'Something went wrong': 'Terjadi kesalahan',
    'Please try again later.': 'Silakan coba kembali nanti.',
    'Temporarily unavailable': 'Sementara tidak tersedia',
    'Go to dashboard': 'Buka dashboard',
    'Go to login': 'Buka halaman masuk',
} as const;

export type Locale = 'id' | 'en';
export type TranslationKey = keyof typeof indonesian;

export function translateLabel(text: string, locale: Locale): string {
    if (locale === 'id' && Object.hasOwn(indonesian, text)) {
        return indonesian[text as TranslationKey];
    }

    return text;
}

export function useI18n() {
    const { locale } = usePage().props;

    return {
        locale,
        t: (key: TranslationKey) => translateLabel(key, locale),
        label: (text: string) => translateLabel(text, locale),
    };
}
