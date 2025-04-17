// lib/i18n.ts
'use client'
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import yaml from 'js-yaml';

export const SUPPORTED_LANGUAGES = ['en','ta'];
export const DEFAULT_LANGUAGE = 'en';

i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: SUPPORTED_LANGUAGES,
        debug: process.env.NODE_ENV === 'development',
        interpolation: { escapeValue: false },
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.yml',
            parse: (data: string) => yaml.load(data) as Record<string, any>,
        },
        detection: {
            order: ['path', 'cookie', 'navigator'],
            caches: ['cookie'],
            cookieMinutes: 525600,
            lookupFromPathIndex: 0,
        },
        ns: ['app'],
        defaultNS: 'app',
        react: { useSuspense: false },
    });

export default i18n;
