# Jiro Dashboard — Setup

## Prerequisites

Verified environment: Windows/PowerShell, PHP 8.3.30, Composer 2.9.4, Node 24.14.1, npm 11.14.1. PHP must have the extensions required by `composer check-platform-reqs`, including PDO SQLite for the local baseline.

## Fresh installation

Use a source-only copy with both lockfiles. Exclude `.env`/credentials, `database/*.sqlite*`, runtime logs/cache/sessions, `vendor/`, `node_modules/`, `public/build/`, `public/hot`, and generated `resources/js/{actions,routes,wayfinder}/`. Preserve empty writable storage/cache directories and their `.gitignore` files.

Verified shortcut for a fresh **development** copy: `composer setup --no-interaction`. It installs dependencies, creates absent `.env`/SQLite files, generates a key only if empty, migrates, synchronizes baseline roles, runs `npm ci`, and builds. Rerunning preserves existing environment/key but still changes schema/baseline grants: review those impacts on existing applications. It is not a production command.

Run from the project root in a fresh copy. Do not overwrite an existing `.env` or regenerate an existing application's key.

```powershell
composer install --no-interaction --prefer-dist
npm ci
if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env' }
if (-not (Test-Path 'database/database.sqlite')) {
    New-Item -ItemType File 'database/database.sqlite' | Out-Null
}
```

For a NEW application whose `APP_KEY` is still empty:

```powershell
php artisan key:generate
```

Then:

```powershell
php artisan migrate --no-interaction
php artisan db:seed --no-interaction
npm run build
php artisan serve --host=127.0.0.1 --port=8000
```

Visit http://127.0.0.1:8000/login. In a second terminal use `npm run dev` when editing frontend files. Separate server commands are the documented Windows baseline; the upstream combined `composer dev` launcher has not been verified.

## Configuration and access

- `.env.example` defines `APP_NAME="Jiro Dashboard"`, `APP_LOCALE=id`, English fallback, SQLite, and log mail.
- Indonesian/English switching is available in the header and appearance settings. Auth, settings, navigation, dashboard, and error pages use translations; backend auth/password and active form validation messages follow the same request locale. Other untranslated framework messages fall back to English.
- Initial application name comes from `APP_NAME`; a saved System → Application Settings name overrides UI branding without changing `.env`. `VITE_APP_NAME` is a build-time fallback; rebuild after changing frontend environment values. Saved DB settings take precedence over corresponding config branding defaults.
- Registration, 2FA, and passkeys are disabled. Login, password reset, verification, and profile/security pages come from the official starter.
- The base seeder creates roles/permissions, never accounts. In an interactive terminal, run `php artisan jiro:create-admin` and choose your own credentials. Password is hidden and must meet the rules in `AUTHORIZATION.md`. No shared password is provided.
- Newly created admins require verification before dashboard access. Request the link after login; use local log mail as below. Trusted operators who independently confirmed email ownership can explicitly pass `--verified`.
- Log mail writes reset/verification messages to `storage/logs/laravel.log`; use the links there for local testing. No email is sent to a real mailbox. Treat logs containing these links as sensitive.
- This is a development configuration, not production deployment guidance. Disable debug and configure secure mail/runtime settings before deployment.

## Troubleshooting

### Rebranding and preferences

- Change `APP_NAME` and keep `VITE_APP_NAME="${APP_NAME}"`; run `php artisan config:clear` and `npm run build` after changing configuration/build-time values.
- Set `JIRO_LOGO_PATH=/images/my-logo.svg` after placing your own file under `public/images/`; an empty value uses the Jiro monogram. Set `JIRO_TAGLINE` for custom copy. For a translated custom tagline, add its source string to `resources/js/lib/i18n.ts`.
- Favicon: replace `public/jiro-icon.svg` or update its link in `resources/views/app.blade.php`. The old starter icon assets are preserved but no longer linked.
- Palette: edit semantic `--primary`, `--primary-foreground`, `--ring`, and sidebar tokens in both `:root` and `.dark` in `resources/css/app.css`, then rebuild. Keep foreground/background contrast readable.
- Navigation: use typed entries in `resources/js/lib/navigation.ts` and generated Wayfinder routes. A `permission` field filters links; enforce the same permission on the server. A `verified` entry is hidden before email verification.
- Theme persists in browser `appearance` storage/cookie and responds to OS preference in System mode. Locale persists in encrypted `jiro_locale` cookie plus session; it is not synchronized across browsers/accounts. Clearing site data resets browser preferences.
- Frontend translations use typed source strings in `resources/js/lib/i18n.ts`. Backend messages use `lang/id/` with `lang/en/` fallback. Notification email bodies remain English unless separately localized.

### Laravel Boost / OpenCode

Laravel Boost is installed with development dependencies. `opencode.json` connects the local `laravel-boost` MCP server using `php artisan boost:mcp` from the project root. `boost.json` identifies OpenCode as the project's integration target. The connection was verified in the development session with `application-info`.

After a fresh setup, open OpenCode in this project and inspect `/mcps` if tools are unavailable. PHP must be accessible to the OpenCode service. Run `php artisan boost:install --guidelines --no-interaction` to regenerate guidelines when needed; it preserves project instructions above the generated block. Do not regenerate MCP settings with the current Boost installer without reviewing them: its installed OpenCode adapter uses the older config shape, whereas this project uses V2 `mcp.servers`.

Boost is development tooling, not a login system. It does not create an administrator account and is omitted by `composer install --no-dev` in production. Administrator provisioning is handled separately by `jiro:create-admin`.

### Application troubleshooting

Application Settings upgrade: migrate, deliberately synchronize baseline permissions (`php artisan db:seed --class=RolesAndPermissionsSeeder --no-interaction`), then build. Review manual baseline-role grants before seeding. New singleton overrides initially empty; original branding/id/system/teal/dark-sidebar config preserved. Admin edits System → Application Settings. Logo must already exist under public (e.g. /jiro-icon.svg); no uploads/remote paths. Support URL HTTPS; contacts/defaults public, no credentials. Blank optional fields clear them; .env untouched.

Browser choices override defaults. Customize Reset removes theme overrides and adopts application defaults; locale independent. Historical appearance cookies remain explicit until reset. Reload on revision conflict. Help version is starter release label in config/jiro.php, not framework/PHP version. Back up workspace_settings with other app data.

Notifications upgrade: run `php artisan migrate --no-interaction` and `npm run build`. No new permission seeding is needed for inbox access: active verified users see only their own records. Subsequent supported changes generate notices; there is no historical backfill or queue worker requirement for these synchronous database-only notifications. Badge updates on navigation/reload, not realtime.

Activity Log upgrade: `php artisan migrate --no-interaction`, deliberately synchronize baseline permissions with `php artisan db:seed --class=RolesAndPermissionsSeeder --no-interaction`, then `npm run build`. Admin receives `activity.view`; manual baseline-role grants may be overwritten by seeding, so review first. `/activity-log` starts empty and records subsequent supported UI mutations; historical data is not backfilled. Protect database/log backups and plan a project-specific retention policy before production.

Users-module upgrade: run `php artisan migrate --no-interaction`, deliberately run `php artisan db:seed --class=RolesAndPermissionsSeeder --no-interaction` to synchronize new baseline permissions, then `npm run build`. Review manual baseline-role grants before seeding. Existing users default to active, passwords/verification untouched. Admin accesses `/users`, creates an account, and sends its password link; use log mail locally. If the only verified active Admin needs a different email, first provision and actually verify a second administrator.

SSR is off by default (`INERTIA_SSR_ENABLED=false`); normal startup needs no SSR service. An empty logo env override uses the fallback mark. HTML CSRF errors redirect back with localized expiry feedback; JSON retains 419. Route-binding 404 errors resolve the selected locale.

See `DESIGN_SYSTEM.md`, `ADDING_MODULES.md`, and `DEPLOYMENT.md` for customization/removal/deployment. Latest source-only verification includes every System migration, setup rerun preserving env/key, no automatic accounts/demo data, full checks and cached no-dev runtime/browser Settings write. Windows/SQLite only; Linux/GitHub CI and non-SQLite databases remain unverified. Temporary QA copies/accounts are not template defaults.

Existing installations upgrading to Phase 4 must run `php artisan migrate --no-interaction` and `npm run build`. The migration adds the Project table without resetting existing users/roles. Open `/projects` from the sidebar after signing in. There is no automatic demo-data seeder.

### Reference module extension pattern

Use the implemented Project module as the reference: model/migration/factory → policy → Form Requests → resource controller/routes → typed pages/forms → navigation/translations → endpoint tests. Relevant paths are `app/Models/Project.php`, `app/Policies/ProjectPolicy.php`, `app/Http/Requests/*ProjectRequest.php`, `app/Http/Controllers/ProjectController.php`, `resources/js/pages/projects/`, `resources/js/components/{project-form,delete-project,data-table}.tsx`, and `tests/Feature/ProjectTest.php`.

Add new named permissions to `config/jiro.php`, seed deliberately (baseline-role grants are synchronized), and enforce them in the new policy before exposing UI actions. Keep sortable columns/page sizes allowlisted; never use arbitrary request values as SQL column/order expressions. The Project example is intentionally shared-workspace, not a tenancy/ownership implementation. Do not install extra generators/table libraries for a simple module.

- Missing Vite manifest: run `npm run build` or start `npm run dev`.
- Missing generated TypeScript routes: `php artisan wayfinder:generate --with-form --no-interaction` (also generated during frontend builds).
- Stale configuration: `php artisan config:clear`.
- Missing SQLite database: create the file as above, then run migrations. Do not reset existing databases.
- Commit/preserve `composer.lock` and `package-lock.json` for reproducibility when Git is set up. `.env`, local databases, dependencies, and generated build files must not be committed.
