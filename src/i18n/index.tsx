import { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

type Locale = "en" | "ar";

const translations = {
  en,
  ar,
};

type TranslationDictionary = typeof translations.en;

interface I18nContextValue {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  locale: string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const getNestedValue = (source: TranslationDictionary, key: string) => {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);
};

const interpolate = (template: string, vars?: Record<string, string | number>) => {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, token) => {
    const value = vars[token];
    return value === undefined ? "" : String(value);
  });
};

const storageKey = "dietco-language";

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem(storageKey);
    return stored === "ar" ? "ar" : "en";
  });

  const setLanguage = (next: Locale) => {
    setLanguageState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, next);
    }
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = translations[language];
    const t = (key: string, vars?: Record<string, string | number>) => {
      const raw = getNestedValue(dictionary, key);
      if (typeof raw === "string") {
        return interpolate(raw, vars);
      }
      return key;
    };
    const locale = language === "ar" ? "ar-SA" : "en-SA";
    return { language, setLanguage, t, locale };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
};
