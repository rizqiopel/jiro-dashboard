# Jiro Dashboard — Project overview

Original reusable dashboard foundation. Installed baseline: Laravel 13, PHP 8.3, Inertia 3, React 19, TypeScript, Tailwind 4, Fortify, and Spatie Permission. Setup and verification guidance is included in this repository.

## Implemented scope

Closed registration; email/password authentication, reset/verification, profile/security settings; Admin/Editor/Viewer permissions; responsive sidebar shell; light/dark/system appearance; Indonesian/English browser preferences; error pages; shared-workspace Project CRUD with server-side table queries. No tenancy, charts, soft deletion, account/role-management UI, or production demo accounts.

## Directory map and request flow

| Path | Responsibility |
| --- | --- |
| `routes/web.php`, `routes/settings.php` | Web routes and middleware boundaries |
| `app/Http/Controllers/`, `app/Http/Requests/` | Responses, validation, authorization |
| `app/Models/`, `app/Policies/` | Persistence and resource permissions |
| `app/Http/Middleware/` | Safe shared Inertia props and preferences |
| `app/Console/Commands/` | Interactive administrator provisioning |
| `config/jiro.php`, `database/seeders/` | Branding, locales, baseline roles/permissions |
| `resources/js/pages/`, `layouts/`, `components/` | Typed page UI, shell, reusable primitives |
| `resources/js/lib/`, `hooks/`, `types/` | Navigation/translations, theme/flash logic, contracts |
| `resources/css/app.css`, `public/jiro-icon.svg` | Semantic styling and original brand icon |
| `lang/`, `tests/Feature/` | Backend translations and isolated regression tests |

Browser → Laravel auth/verification → validated query/request and policy → Eloquent → Inertia response → React page. UI action visibility is not authorization. Project routes use Wayfinder-generated functions in ignored `resources/js/routes/`; build generates these files. Do not edit generated route/action files.

SQLite is the verified local database. Theme is browser-local; locale uses an encrypted cookie/session, not an account setting. SSR is disabled by default; the shipped build does not require a Node SSR runtime. Notifications use log mail locally. Tests use isolated SQLite and skip Vite rendering; browser/build checks verify assets separately.

## Reuse and release boundaries

Start a new application from source and lockfiles, never from this workspace's secrets/database. Follow `SETUP.md`, `DESIGN_SYSTEM.md`, and `ADDING_MODULES.md`. Production guidance is in `DEPLOYMENT.md`; no real hosting deployment is claimed. Maintained E2E/Vitest automation and non-SQLite verification remain deferred.
