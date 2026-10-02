import { useSyncExternalStore } from 'react';

export type CustomTheme = {
    accent: 'teal' | 'blue' | 'violet' | 'orange' | 'slate';
    sidebar: 'dark' | 'light';
    radius: 'square' | 'rounded' | 'soft';
};

let defaults: CustomTheme = {
    accent: 'teal',
    sidebar: 'dark',
    radius: 'rounded',
};
const key = 'jiro.custom-theme';
const listeners = new Set<() => void>();
let current = defaults;
let explicitSelection = false;

function readTheme(): CustomTheme {
    try {
        const value = JSON.parse(localStorage.getItem(key) ?? '{}');
        explicitSelection =
            value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            (['teal', 'blue', 'violet', 'orange', 'slate'].includes(
                value.accent,
            ) ||
                ['dark', 'light'].includes(value.sidebar) ||
                ['square', 'rounded', 'soft'].includes(value.radius));
        return {
            accent: ['teal', 'blue', 'violet', 'orange', 'slate'].includes(
                value?.accent,
            )
                ? value.accent
                : defaults.accent,
            sidebar: ['light', 'dark'].includes(value?.sidebar)
                ? value.sidebar
                : defaults.sidebar,
            radius: ['square', 'rounded', 'soft'].includes(value?.radius)
                ? value.radius
                : defaults.radius,
        };
    } catch {
        explicitSelection = false;
        return defaults;
    }
}

function apply(): void {
    document.documentElement.dataset.accent = current.accent;
    document.documentElement.dataset.sidebarTheme = current.sidebar;
    document.documentElement.dataset.radius = current.radius;
    listeners.forEach((listener) => listener());
}

export function initializeCustomTheme(): void {
    if (window.jiroDefaults) {
        const { accent, sidebar, radius } = window.jiroDefaults;
        defaults = { accent, sidebar, radius };
    }
    current = readTheme();
    apply();
    window.addEventListener('storage', (event) => {
        if (event.key === key || event.key === null) {
            current = readTheme();
            apply();
        }
    });
}

export function setCustomThemeDefaults(value: CustomTheme): void {
    defaults = {
        accent: value.accent,
        sidebar: value.sidebar,
        radius: value.radius,
    };
    if (!explicitSelection) {
        current = defaults;
        apply();
    }
}

export function useCustomTheme() {
    const theme = useSyncExternalStore(
        (callback) => {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            };
        },
        () => current,
        () => defaults,
    );
    const update = (value: CustomTheme) => {
        explicitSelection = true;
        current = value;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            /* Preferences still work when storage is blocked. */
        }
        apply();
    };
    return {
        theme,
        update,
        reset: () => {
            explicitSelection = false;
            try {
                localStorage.removeItem(key);
            } catch {
                /* In-memory reset still works. */
            }
            current = defaults;
            apply();
        },
    };
}
