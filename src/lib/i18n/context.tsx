'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Language, TranslationDictionary } from './types';
import {
  translations,
  getLocalizedCategory,
  getLocalizedMenuItem,
  getLocalizedCurrency,
} from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof TranslationDictionary) => string;
  dict: TranslationDictionary;
  isAmharic: boolean;
  translateCategory: (
    slug: string,
    name: string,
    desc: string | null,
    nameAm?: string | null,
    nameEn?: string | null,
    descAm?: string | null,
    descEn?: string | null
  ) => { name: string; description: string | null };
  translateMenuItem: (
    name: string,
    desc: string | null,
    nameAm?: string | null,
    nameEn?: string | null,
    descAm?: string | null,
    descEn?: string | null
  ) => { name: string; description: string | null };
  formatCurrency: (rawCurrency: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
}

export function LanguageProvider({
  children,
  defaultLanguage = 'am',
  storageKey = 'barch_app_lang',
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'am' || stored === 'en') {
        setLanguageState(stored);
      } else {
        // Enforce the designated default
        setLanguageState(defaultLanguage);
      }
    } catch {
      // Ignore localStorage read errors in restricted contexts
    }
    setMounted(true);
  }, [storageKey, defaultLanguage]);

  const setLanguage = useCallback(
    (newLang: Language) => {
      setLanguageState(newLang);
      try {
        localStorage.setItem(storageKey, newLang);
      } catch {
        // Ignore localStorage write errors
      }
    },
    [storageKey]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'am' ? 'en' : 'am');
  }, [language, setLanguage]);

  const dict = useMemo(() => translations[language], [language]);

  const t = useCallback(
    (key: keyof TranslationDictionary): string => {
      return dict[key] || translations.en[key] || String(key);
    },
    [dict]
  );

  const translateCategory = useCallback(
    (
      slug: string,
      name: string,
      desc: string | null,
      nameAm?: string | null,
      nameEn?: string | null,
      descAm?: string | null,
      descEn?: string | null
    ) => {
      return getLocalizedCategory(
        slug,
        name,
        desc,
        language,
        nameAm,
        nameEn,
        descAm,
        descEn
      );
    },
    [language]
  );

  const translateMenuItem = useCallback(
    (
      name: string,
      desc: string | null,
      nameAm?: string | null,
      nameEn?: string | null,
      descAm?: string | null,
      descEn?: string | null
    ) => {
      return getLocalizedMenuItem(
        name,
        desc,
        language,
        nameAm,
        nameEn,
        descAm,
        descEn
      );
    },
    [language]
  );

  const formatCurrency = useCallback(
    (rawCurrency: string) => {
      return getLocalizedCurrency(rawCurrency, language);
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      dict,
      isAmharic: language === 'am',
      translateCategory,
      translateMenuItem,
      formatCurrency,
    }),
    [language, setLanguage, toggleLanguage, t, dict, translateCategory, translateMenuItem, formatCurrency]
  );

  // Render children immediately so server-side rendered structure is stable,
  // then client smoothly hydrides language if user previously set a preference.
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a <LanguageProvider>');
  }
  return context;
}
