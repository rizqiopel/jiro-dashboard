<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-app-name="{{ $workspaceSettings['name'] ?? config('app.name') }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                window.jiroDefaults = {{ \Illuminate\Support\Js::from(\Illuminate\Support\Arr::only($workspaceSettings ?? app(\App\Actions\ResolveWorkspaceSettings::class)->defaults(), ['appearance', 'accent', 'sidebar', 'radius'])) }};
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(0.978 0.004 220);
            }

            html.dark {
                background-color: oklch(0.17 0.018 240);
            }
        </style>

        <link rel="icon" href="/jiro-icon.svg" type="image/svg+xml">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $workspaceSettings['name'] ?? config('app.name', 'Jiro Dashboard') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
