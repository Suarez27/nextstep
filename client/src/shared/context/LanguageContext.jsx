import { createContext, useContext, useMemo, useState } from 'react';

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

    function setLanguage(nextLanguage) {
        const normalized = nextLanguage === 'en' ? 'en' : 'es';
        setLanguageState(normalized);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, normalized);
        }
    }

    function toggleLanguage() {
        setLanguage(language === 'es' ? 'en' : 'es');
    }

    const value = useMemo(
        () => ({ language, setLanguage, toggleLanguage }),
        [language],
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    return useContext(LanguageContext);
}
