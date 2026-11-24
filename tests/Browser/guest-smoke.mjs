#!/usr/bin/env node
/**
 * Dependency-free HTTP smoke check for the Jiro Dashboard guest surface.
 *
 * Usage:
 *   php artisan serve --host=127.0.0.1 --port=8010
 *   node tests/Browser/guest-smoke.mjs http://127.0.0.1:8010
 *
 * Only public endpoints are requested, so no account, cookie, or database
 * fixture is needed. Run it against a throwaway server, never production.
 */

const baseUrl = (
    process.argv[2] ??
    process.env.JIRO_BASE_URL ??
    'http://127.0.0.1:8000'
).replace(/\/+$/, '');

const checks = [
    {
        name: 'login page renders the sign-in form',
        path: '/login',
        status: 200,
        // Inertia renders client-side, so assert the page payload instead of form markup.
        bodyIncludes: ['data-page="app"', '"component":"auth\\/login"'],
    },
    {
        name: 'health endpoint responds',
        path: '/up',
        status: 200,
    },
    {
        name: 'dashboard redirects guests to login',
        path: '/dashboard',
        status: 302,
        locationIncludes: '/login',
    },
    {
        name: 'projects redirects guests to login',
        path: '/projects',
        status: 302,
        locationIncludes: '/login',
    },
    {
        name: 'users redirects guests to login',
        path: '/users',
        status: 302,
        locationIncludes: '/login',
    },
    {
        name: 'closed registration returns 404',
        path: '/register',
        status: 404,
    },
    {
        name: 'unknown route returns 404 without redirecting',
        path: '/this-page-does-not-exist',
        status: 404,
    },
];

let failures = 0;

for (const check of checks) {
    const url = `${baseUrl}${check.path}`;

    try {
        const response = await fetch(url, {
            redirect: 'manual',
            headers: { Accept: 'text/html,application/xhtml+xml' },
        });
        const body = check.bodyIncludes ? await response.text() : '';
        const problems = [];

        if (response.status !== check.status) {
            problems.push(
                `expected HTTP ${check.status}, received ${response.status}`,
            );
        }

        if (
            check.locationIncludes &&
            !(response.headers.get('location') ?? '').includes(
                check.locationIncludes,
            )
        ) {
            problems.push(
                `expected Location to contain "${check.locationIncludes}", received "${response.headers.get('location') ?? ''}"`,
            );
        }

        for (const needle of check.bodyIncludes ?? []) {
            if (!body.includes(needle)) {
                problems.push(`response body is missing ${needle}`);
            }
        }

        if (problems.length > 0) {
            failures++;
            console.log(`FAIL ${check.name} (${check.path})`);
            for (const problem of problems) {
                console.log(`     - ${problem}`);
            }
        } else {
            console.log(`PASS ${check.name} (${check.path})`);
        }
    } catch (error) {
        failures++;
        console.log(`FAIL ${check.name} (${check.path})`);
        console.log(`     - request failed: ${error.message}`);
        console.log(`     - is the application server running at ${baseUrl}?`);
    }
}

console.log(
    failures === 0
        ? '\nAll guest smoke checks passed.'
        : `\n${failures} guest smoke check(s) failed.`,
);

process.exitCode = failures === 0 ? 0 : 1;
