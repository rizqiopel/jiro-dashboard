# Jiro Dashboard — Production guidance

Hosting target is not selected and no real production deployment has been performed. This is a platform-neutral release checklist, not a verified Docker/Forge/Cloud recipe. Laravel Cloud is one possible managed target; confirm its requirements separately.

## Build and runtime

- PHP 8.3+ with Composer platform requirements and the chosen PDO driver. Verify `composer check-platform-reqs --no-dev` on the target. PHP extensions/web-server configuration must match the production host.
- Node/npm are needed in the build environment. The verified local toolchain is Node 24.14.1/npm 11.14.1; existing CI specifies Node 22 and has not been run on GitHub here.
- Preserve `composer.lock`/`package-lock.json`; never resolve newer dependencies during an ordinary release.
- Web document root must be `public/`, not the project root. Protect `.env`, database, logs, source, and backups. Configure HTTPS and trusted proxies for the actual host.
- Give only the runtime user needed write access to `storage/` and `bootstrap/cache/`. SQLite, if selected, requires a persistent writable database location and backup/concurrency planning. Other database engines are not yet verified.
- Default SSR is off (`INERTIA_SSR_ENABLED=false`); `npm run build` serves a client-rendered Inertia app. Opting into SSR requires a separately tested SSR build/runtime; do not enable the flag alone.

## Environment and persistent data

Set `APP_ENV=production`, `APP_DEBUG=false`, correct HTTPS `APP_URL`, application/Vite names, and a secure **existing** `APP_KEY`. Generate a key only for a genuinely new app; keep it stable across releases and include it in encrypted backup management. Configure DB/session/cache/queue appropriately. On HTTPS set `SESSION_SECURE_COOKIE=true`; inspect proxy and domain settings. Never copy this development `.env`, local administrator, QA users, or database into production.

Replace log mail with a real mail transport/from address and verify password-reset/verification delivery. Local log mail writes reset/verification links to logs; restrict log access. Provision the first administrator interactively with `php artisan jiro:create-admin`; do not use `--verified` without independently confirming email ownership. Public registration stays closed.

## Release commands

Run tests with development dependencies in CI **before** creating a no-dev release. The following sequence was checked in an isolated source copy on Windows, not on a production host:

```powershell
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
npm ci
npm run build
composer check-platform-reqs --no-dev
php artisan migrate --force --no-interaction
php artisan config:cache --no-interaction
php artisan route:cache --no-interaction
php artisan view:cache --no-interaction
php artisan event:cache --no-interaction
```

Set target environment before caching. Back up persistent data and review migration impact before using `--force`. Seed initial baseline roles deliberately using `php artisan db:seed --class=RolesAndPermissionsSeeder --force --no-interaction`; this synchronizes baseline role grants, so do not seed blindly on every deployment. `composer setup` is a development bootstrap, **not** a production deployment command.

Publish only intended artifacts; generated Wayfinder files/build assets must exist before serving. Never ship `public/hot` from development. Use atomic releases/host rollout controls and test a recovery plan. `config:cache` requires application code to use `config()`, not runtime `env()` outside config files.

## Workers, maintenance, and release smoke checks

Database queue is configured; supervise a queue worker if the application enqueues jobs and restart it on release (`php artisan queue:restart`). No custom scheduled jobs are included; add a supervised scheduler only when needed. Current built-in auth notifications are not asserted to require a worker. Optional public file uploads require an explicit storage strategy; don't expose private storage by default.

Use `php artisan down` / `php artisan up` only according to the selected rollout policy. Smoke-test `/up`, login/logout, Project policies/persistence, reset/verification mail, 404/503 pages, and asset loading. `/up` is a liveness response, not a complete DB/mail readiness probe. Logs must not expose passwords/tokens to unauthorized users. Monitor errors and backup restoration. Do not claim production readiness until host-specific security, permissions, mail, data persistence, and recovery checks are performed.
