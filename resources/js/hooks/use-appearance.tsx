import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
    readonly resetAppearance: () => void;
};

const listeners = new Set<() => void>();
let currentAppearance: Appearance = 'system';
let defaultAppearance: Appearance = 'system';
let explicitSelection = false;

const prefersDark = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getStoredAppearance = (): Appearance | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const stored = localStorage.getItem('appearance');
        if (stored === 'light' || stored === 'dark' || stored === 'system')
            return stored;
    } catch {
        /* Read cookie fallback when storage is blocked. */
    }
    const cookie = document.cookie
        .split('; ')
        .find((value) => value.startsWith('appearance='))
        ?.split('=')[1];
    return cookie === 'light' || cookie === 'dark' || cookie === 'system'
        ? cookie
        : null;
};

const isDarkMode = (appearance: Appearance): boolean => {
    return appearance === 'dark' || (appearance === 'system' && prefersDark());
};

const applyTheme = (appearance: Appearance): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const isDark = isDarkMode(appearance);

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

const mediaQuery = (): MediaQueryList | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = (): void => {
    applyTheme(currentAppearance);
    notify();
};

export function initializeTheme(): void {
    if (typeof window === 'undefined') {
        return;
    }

    defaultAppearance = window.jiroDefaults?.appearance ?? 'system';
    const stored = getStoredAppearance();
    explicitSelection = stored !== null;
    currentAppearance = stored ?? defaultAppearance;
    applyTheme(currentAppearance);

    // Set up system theme change listener
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
    window.addEventListener('storage', (event) => {
        if (event.key === 'appearance' || event.key === null) {
            if (event.newValue === null)
                document.cookie = 'appearance=;path=/;max-age=0;SameSite=Lax';
            const stored = getStoredAppearance();
            explicitSelection = stored !== null;
            currentAppearance = stored ?? defaultAppearance;
            applyTheme(currentAppearance);
            if (stored) setCookie('appearance', stored);
            notify();
        }
    });
}

export function setAppearanceDefault(mode: Appearance): void {
    defaultAppearance = mode;
    if (!explicitSelection) {
        currentAppearance = mode;
        applyTheme(mode);
        notify();
    }
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = useSyncExternalStore(
        subscribe,
        () => currentAppearance,
        () => 'system',
    );

    const resolvedAppearance: ResolvedAppearance = useSyncExternalStore(
        subscribe,
        () => (isDarkMode(currentAppearance) ? 'dark' : 'light'),
        () => 'light',
    );

    const updateAppearance = (mode: Appearance): void => {
        explicitSelection = true;
        currentAppearance = mode;

        // Store in localStorage for client-side persistence...
        try {
            localStorage.setItem('appearance', mode);
        } catch {
            // Theme still works for the current session when storage is blocked.
        }

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode);
        notify();
    };

    const resetAppearance = () => {
        explicitSelection = false;
        try {
            localStorage.removeItem('appearance');
        } catch {
            /* Reset still works in memory. */
        }
        document.cookie = 'appearance=;path=/;max-age=0;SameSite=Lax';
        currentAppearance = defaultAppearance;
        applyTheme(currentAppearance);
        notify();
    };
    return {
        appearance,
        resolvedAppearance,
        updateAppearance,
        resetAppearance,
    } as const;
}
