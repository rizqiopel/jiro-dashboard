# Jiro Dashboard — Adding or removing a module

Use Project as the working example, not the unverified Zenith snippets. Follow existing structure; no generator/table/form dependency is required.

## Extension checklist

1. Define fields, limits, status semantics, ownership/tenancy, and named permissions first. Project deliberately uses a shared workspace; copying it does not create tenant isolation.
2. Generate a model/migration/factory using `php artisan make:model YourModel --migration --factory --no-interaction`. Inspect schema before changes. Use a field allowlist, useful test factories, and safe indexes. Do not seed production demo records.
3. Add permission names/baseline grants in `config/jiro.php`. `RolesAndPermissionsSeeder` synchronizes baseline roles; running it may replace manual grants for those roles. Review before seeding existing applications.
4. Generate a policy and store/update/index requests. Compare `ProjectPolicy` and `*ProjectRequest`: authorize reads and writes on the server, validate fields, allowlist sort/direction/page sizes, bound query length. Use scoped queries if the new module requires ownership. Never pass arbitrary request values as SQL identifiers.
5. Add a resource controller and named routes with `auth`/`verified`, before the fallback. Return typed Inertia props; redirect after writes and flash translated feedback. Project shows escaped parameterized name/description search, grouped status filters, stable ordering, pagination totals/URLs, and out-of-range recovery.
6. Generate routes with `php artisan wayfinder:generate --with-form --no-interaction` or build. Import named functions from `@/routes/`; don't hand-edit generated files.
7. Add `resources/js/pages/your-module/` and typed props. Reuse `DataTable` (`components/data-table.tsx`) and the Project form/dialog patterns, with module-specific components where needed. Keep query state in URLs; reset page when filters change; disable repeated submissions; implement draft-preserving errors, empty/pending/success states, and delete confirmation.
8. Add permission-aware navigation in `lib/navigation.ts`, frontend strings in `lib/i18n.ts`, and backend translations in `lang/`. UI visibility must mirror, not replace, policy decisions.
9. Add PHPUnit feature tests following `ProjectTest`: real endpoints, role matrix, guest/unverified denial, invalid writes with unchanged data, missing records, table query failure modes, persistence. Run focused tests, then the checks in `TESTING.md`; inspect actual browser workflows on isolated data.

## Removing the Project example from a new application

Do this only in a new copy after deciding whether any Project data must be retained. Remove its resource routes/controller/requests/policy/model/factory/test/pages/types/form/delete dialog; remove Project navigation import/entry, dashboard import/shortcut/copy, permissions/grants, and obsolete translations. `components/data-table.tsx` is reusable and may stay if another module uses it. Regenerate Wayfinder routes and rebuild after removing imports.

For an **unmigrated new copy**, the Project create-table migration can be omitted. For an **already deployed database**, retain migration history and write a separately reviewed drop/archive migration after backups; do not delete historical migrations or reset the database to remove a module. Review persisted permission grants separately. Never run `migrate:fresh` on data that must be preserved.

Run the complete checks and inspect dashboard/sidebar after removal. No automatic removal tool is provided or executed in this workspace.
