import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light';

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    // Always use light theme
    if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark');
    }
};

export function initializeTheme() {
    applyTheme('light');
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');
    const [isClient, setIsClient] = useState(false);

    const updateAppearance = useCallback((mode: Appearance) => {
        // Force light mode only
        setAppearance('light');
        
        // Only use localStorage on client side
        if (typeof window !== 'undefined') {
            localStorage.setItem('appearance', 'light');
        }
        
        setCookie('appearance', 'light');
        applyTheme('light');
    }, []);

    useEffect(() => {
        setIsClient(true);
        updateAppearance('light');
    }, [updateAppearance]);

    return { 
        appearance: 'light' as const, 
        updateAppearance,
        isClient 
    } as const;
}
