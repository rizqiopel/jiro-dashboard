# Browser and HTTP QA artifacts

These checks complement PHPUnit. They are **not** a maintained end-to-end suite and do not replace backend tests.

## Guest smoke check (runnable, no dependencies)

```powershell
php artisan serve --host=127.0.0.1 --port=8010
# in a second terminal
node tests/Browser/guest-smoke.mjs http://127.0.0.1:8010
```

It requests only public endpoints: login form, health check, guest redirects for dashboard/projects/users, closed registration, and the 404 fallback. No account or fixture data is needed.

Use a throwaway server and database. Never point it at a production host.

## Authenticated UI QA protocol

Authenticated browser flows (roles, CRUD, settings, theme, notifications, narrow viewports) are not automated here yet. Earlier QA scripts were created in a temporary directory and no longer exist; when such a flow is verified again, keep the script in this directory so it can be rerun.

When performing that QA manually or with a harness:

1. Copy the development SQLite file to a new file, for example `C:\Users\SERVER\AppData\Local\Temp\opencode\jiro-qa.sqlite`, and start a second server with `DB_DATABASE` pointing at the copy on a non-default port such as 8011.
2. Create Admin/Editor/Viewer accounts with factories or `jiro:create-admin` **in the copy only**. Never reuse or change the normal development administrator.
3. Run the checks against `127.0.0.1:8011`, then stop that server and keep the disposable database out of the repository.
4. Record the flows exercised, viewport sizes, screenshots actually inspected, and any console/network failures in `docs/HANDOFF.md`.
