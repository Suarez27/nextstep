import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'nextstep_lang';

function resolveInitialLanguage() {
    if (typeof window === 'undefined') return 'es';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'en' ? 'en' : 'es';
}

const LanguageContext = createContext({
    language: 'es',
    setLanguage: () => {},
    toggleLanguage: () => {},
});

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(resolveInitialLanguage);

    // Sincroniza el atributo lang del <html> para que el navegador
    // no auto-traduzca la página (Chrome translate, etc.)
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.setAttribute('translate', 'no');
    }, [language]);

    const setLanguage = useCallback((nextLanguage) => {
        const normalized = nextLanguage === 'en' ? 'en' : 'es';
        setLanguageState(normalized);
        window.localStorage.setItem(STORAGE_KEY, normalized);
    }, []);

    // Usa setState funcional para no capturar 'language' por closure
    const toggleLanguage = useCallback(() => {
        setLanguageState((prev) => {
            const next = prev === 'es' ? 'en' : 'es';
            window.localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    }, []);

    const value = useMemo(
        () => ({ language, setLanguage, toggleLanguage }),
        [language, setLanguage, toggleLanguage],
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    return useContext(LanguageContext);
}
