# Jiro Dashboard — Authentication and authorization

## Current implementation

Application Settings: baseline Admin gets settings.view + settings.update. GET needs view, PUT requires both with active/auth/verified. Revision conflicts reject stale writes, audit records only changed field names. No role/credential/config changes. Public branding/defaults/support contacts are guest/auth-shared, not confidential. Latest seeding is 12 permissions/18 grants, superseding historical totals below. Default-setting changes do not send mass notifications.

Notifications: all active verified roles can use their own inbox. No global inbox Admin bypass or extra permission is granted; all four routes start from `$request->user()->notifications()` and restrict supported notification type, including bulk-read. Foreign/missing UUIDs return 404. Project recipients must be active/verified with projects.view at send time, excluding actor. Account-management events go only to target, including inactive/unverified targets for later access. Content contains safe metadata without resource links or secret snapshots; resource routes enforce permissions independently. Profile deletion removes its notifications.

Activity Log: baseline Admin also has `activity.view`; GET `/activity-log` requires auth + verified + this permission. Editor/Viewer cannot read it directly. There are no log update/delete endpoints. Actor relation shares only current id/name; deleted actors become null, with resource IDs preserved. Baseline seeding now defines 10 permissions/16 role grants, superseding the earlier Users-only totals below.

Users expansion: baseline Admin now has `users.view`, `users.create`, `users.update`, `users.reset-password`. Editor/Viewer have none of these; every managed write also requires users.view plus auth/verified. No unrestricted Admin bypass, force-verification endpoint, or user-management delete endpoint exists. Deactivation replaces deletion in the management UI.

Inactive accounts cannot log in; any existing web session is invalidated on the next request. Deactivation clears remember token and removes target database sessions when that driver is used. Managed self deactivation/Admin demotion/email replacement are rejected. The last active **verified** Admin cannot be deactivated/demoted, change email, or delete their profile without another active verified Admin. Transactions lock the baseline Admin role before these mutations; SQLite is verified, cross-database/race coverage remains pending. Operators using direct SQL/CLI remain responsible for maintaining this invariant.

New Users accounts have undisclosed random passwords and unverified email. Admin explicitly sends a broker password-reset link (throttled endpoint); the user chooses a password, logs in, then follows the normal verification flow. Email edits clear verification. This never marks inbox ownership verified. Baseline-role seeding now creates 9 permissions/15 role grants; rerunning synchronizes baseline grants deliberately.

Laravel Fortify handles email/password login, logout, password reset, password confirmation, and email verification. Public registration is disabled.

Server-side authorization uses `spatie/laravel-permission` 8.3.0 with the `web` guard and Laravel's built-in `can` middleware/Gate integration. The dashboard requires authentication, verified email, and `dashboard.view`. A verified user without permissions receives 403.

## Roles and permission matrix

`config/jiro.php` is the baseline role/permission source of truth.

| Permission | Admin | Editor | Viewer |
| --- | --- | --- | --- |
| dashboard.view | Yes | Yes | Yes |
| projects.view | Yes | Yes | Yes |
| projects.create | Yes | Yes | No |
| projects.update | Yes | Yes | No |
| projects.delete | Yes | No | No |

The Project module now has production resource endpoints/model and an auto-discovered `ProjectPolicy`. Index/detail require `projects.view`; create/edit/update/delete require view plus the corresponding write permission. All routes also require authenticated, verified users. Projects belong to a shared internal workspace, with no implicit owner/tenant restriction. `ProjectTest` checks the actual endpoints; older isolated permission-boundary tests remain as baseline contract tests.

Admin is not an unrestricted superuser: it has the defined permissions, not an unconditional Gate bypass. New modules must define and seed their permissions explicitly. Tests must verify both direct unauthorized requests and presentation behavior.

## Seed baseline roles

```powershell
php artisan migrate --no-interaction
php artisan db:seed --no-interaction
```

`DatabaseSeeder` calls `RolesAndPermissionsSeeder`. It creates no users and can be repeated without duplicate roles/permissions. It synchronizes permissions for the three baseline roles from `config/jiro.php`, resets permission cache, and leaves unrelated custom roles/permissions intact. Re-seeding WILL replace manual permission changes on baseline roles; maintain those changes in the configuration instead.

## Create your administrator

Run in an interactive terminal at the project root:

```powershell
php artisan jiro:create-admin
```

Prompts: `Name`, `Email`, `Password`, `Confirm password`. Password prompts are hidden and do not fall back to visible input. No password option/environment variable or default secret is supported. `--no-interaction` deliberately fails; an operator must enter a password in a suitable terminal.

Password requirements: at least 12 characters, upper/lowercase letters, a number, and a symbol; no more than 72 bytes to avoid bcrypt truncation. Errors create no account. Name/email are validated, email is normalized to lowercase, and existing emails are rejected case-insensitively without changing credentials or granting privileges. Account creation and role assignment are transactional.

Name/email may optionally be passed as nonsecret options:

```powershell
php artisan jiro:create-admin --name="Your Name" --email="you@example.com"
```

By default the account is UNVERIFIED. Sign in, request the verification email from the verification screen, and inspect the local message in `storage/logs/laravel.log`. The log driver sends nothing to your inbox. Follow the signed verification URL in the same browser session. Treat these links as sensitive; the log driver is only a local development convenience.

If the operator has independently confirmed email ownership, the command supports explicit trusted provisioning:

```powershell
php artisan jiro:create-admin --verified
```

This intentionally marks the address verified; do not use it to pretend delivery or ownership was verified by the application. Creating additional administrators with new email addresses is supported, but promoting/resetting an existing account is not this command's purpose.

## Existing-user role assignment

For a trusted operator with shell access, the package provides:

```powershell
php artisan permission:assign-role Viewer USER_ID web --no-interaction
```

Replace `USER_ID` with an existing user's numeric ID and use a seeded role. This command ADDS a role; it does not replace existing roles or downgrade an Admin. Multiple roles combine their granted permissions. Account creation for nonadmins, role replacement/revocation workflows, and user-management UI are not yet implemented. Do not use raw database pivot edits as an administrative shortcut.

## Frontend contract

Inertia shares `auth.roles` and `auth.permissions` arrays for UI visibility and `auth.user` without serialized role/permission relationships or password. Guest arrays are empty. Frontend contracts are declared in `resources/js/types/auth.ts`.

UI filtering is not security enforcement. Protect new routes with `can:permission.name` and implement resource policies/Form Request authorization where appropriate. Navigation filters by permissions/verification, and Project actions use server-derived policy capabilities. Project writes authorize through Form Requests or Gate before database changes.

## Verification and limits

Tests cover secure provisioning success/failure, duplicate refusal, weak/mismatched/overlength passwords, noninteractive rejection, role seeding idempotence, role matrix via direct HTTP requests, dashboard gates, login/logout, and log-mail rendering. Upstream reset-token and signed-verification tests remain active.

No default account is created by installation or seeding. Tests provision temporary factory accounts and verify authentication and role-based access without introducing default credentials into the application.
