# Jiro Dashboard

Reusable Laravel + Inertia.js + React dashboard foundation, independently developed using Zenith documentation as a reference. We do not have or reproduce Zenith source code.

**Current status:** Local starter and approved System expansion implemented: authentication/access controls, responsive shell/customizer, Project CRUD, Users, Activity Log, Notifications, application Settings, Help and internal Documentation. Fresh source-only setup, role/session browser workflows, and no-dev cached runtime verified. Hosting deployment and maintained E2E/Vitest automation remain deferred; see the handoff.

## Fresh copy

Copy source and lockfiles, not this workspace's secrets/database/dependencies/generated assets. Run `composer setup --no-interaction` in a fresh development copy. It installs locked dependencies, creates absent environment/SQLite files, generates a key only if empty, migrates/seeds baseline roles, and builds. No account is created. This is not a production deployment command; see [setup](docs/SETUP.md).

## Local startup

Dependencies, `.env`, application key, SQLite database, and built frontend assets have already been prepared in this workspace.

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Open http://127.0.0.1:8000/login. For frontend development, run `npm run dev` in a second terminal.

Public registration is disabled. No demo account was seeded. Create your own administrator from an interactive terminal:

```powershell
php artisan jiro:create-admin
```

The command asks for name/email and a hidden password with confirmation. Verify the email after login using local log mail, or use `--verified` only after independently confirming ownership. See [authentication and authorization](docs/AUTHORIZATION.md) for requirements and role permissions.

## Documentation

- [Installation and local configuration](docs/SETUP.md)
- [Architecture and scope](docs/PROJECT_OVERVIEW.md)
- [Design tokens and rebranding](docs/DESIGN_SYSTEM.md)
- [Adding/removing modules](docs/ADDING_MODULES.md)
- [Production deployment guidance](docs/DEPLOYMENT.md)
- [Admin provisioning and authorization](docs/AUTHORIZATION.md)
