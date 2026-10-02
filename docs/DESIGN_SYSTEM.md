# Jiro Dashboard — Design and rebranding

## Original baseline

Shell expansion: brand and header align at 64px; breadcrumbs are below the sticky header. Desktop uses a round edge toggle; mobile uses the header drawer toggle. Navigation groups remember expansion per browser and remain reachable in icon-only mode. Ctrl/Cmd+K opens header search for allowed pages and nonsecret guide content.

The palette header button now opens Customize: Light/Dark/System, teal/blue/violet/orange/slate accent, independent light/dark sidebar, square/rounded/soft radius, and reset. `hooks/use-custom-theme.ts` validates stored values, tolerates blocked/corrupt storage, syncs cross-tab changes, and applies root data attributes; CSS keeps each color/mode variant in semantic tokens. Radius changes feed sm/md/lg/xl/2xl tokens. Reset sets mode to System plus teal/dark sidebar/rounded. These are browser preferences, not persisted application defaults yet. No horizontal layout, density, RTL, or chart customization is claimed.

Clean left sidebar, dark navigation surface, teal primary actions, Instrument Sans, rounded bordered cards, restrained typography. Dashboard shows actual account access/foundation information, not invented business metrics. `resources/js/app.tsx` selects AuthLayout for `auth/*`, AppLayout + SettingsLayout for `settings/*`, no shell for welcome/error, and AppLayout for other pages. Page `layout` properties supply breadcrumbs.

## Brand a new copy

1. Set `APP_NAME` and `VITE_APP_NAME` in its `.env`. Change `JIRO_TAGLINE`; optionally set `JIRO_LOGO_PATH` to an asset under `public/`.
2. Replace `public/jiro-icon.svg` and review `resources/js/components/app-logo*.tsx` / `resources/views/app.blade.php` for fallback branding/favicon. Do not copy another product's proprietary artwork.
3. Update titles/copy in `resources/js/lib/i18n.ts` and page components; backend strings live under `lang/`.
4. Rebuild with `npm run build`; refresh configuration cache on deployed releases. Runtime brand changes alone do not change bundled `VITE_APP_NAME`.

An empty logo override normalizes to null and uses the original fallback. Verify both languages, auth/error pages, desktop/mobile, and light/dark after rebranding.

## Tokens and component conventions

`resources/css/app.css` defines `:root` and `.dark` OKLCH tokens and Tailwind mappings. Edit both palettes together: background/foreground, card/popover, primary/accent/muted, border/input/ring, and sidebar tokens. Use semantic classes (`bg-card`, `text-muted-foreground`, `border-input`) instead of page-specific hardcoded colors. Chart tokens inherited from the starter do not imply a chart module exists.

Reuse `resources/js/components/ui/` primitives. Project pages demonstrate bounded forms, heading hierarchy, labeled inputs/error descriptions, busy buttons, toasts, aria-sort table headings, empty states, and modal destructive confirmation. The DataTable keeps horizontal scrolling inside its container on narrow screens; do not make the document overflow. Theme initialization and persistence belong in `hooks/use-appearance.tsx`, not separate page scripts.

Navigation is centralized in `lib/navigation.ts`; names are translated through `useI18n`. Header preferences use `components/preferences-controls.tsx`. Supported locales are allowlisted in `config/jiro.php`. Notification bodies and some framework strings still fall back to English. Color/accessibility changes require new visual/keyboard checks; no formal WCAG audit is claimed.
