// components/ServerTranslation.tsx
'use server'

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { cache } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/lib/i18n';
import { ReactNode } from "react";

// Cache translations to avoid repeated file reads
const translationCache = new Map<string, Record<string, any>>();

/**
 * Load translation file for a specific language and namespace
 * Uses caching for performance optimization
 */
const loadTranslations = cache(async (lang: string, namespace: string = 'app'): Promise<Record<string, any>> => {
  const cacheKey = `${lang}:${namespace}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', lang, `${namespace}.yml`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const translations = yaml.load(fileContent) as Record<string, any>;

    translationCache.set(cacheKey, translations);
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for ${lang}/${namespace}:`, error);

    // Fallback to default language if the requested language file doesn't exist
    if (lang !== DEFAULT_LANGUAGE) {
      return loadTranslations(DEFAULT_LANGUAGE, namespace);
    }

    return {};
  }
});

/**
 * Get a nested value from an object using a dot-separated path
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Replace interpolation parameters in a translation string
 */
function interpolate(text: string, params?: Record<string, any>): string {
  if (!params) return text;

  return Object.entries(params).reduce((result, [key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    return result.replace(regex, String(value));
  }, text);
}

/**
 * Server-side translation function
 *
 * @param lang - Language code ('en', 'ta', etc.)
 * @param key - Translation key (dot notation)
 * @param params - Optional interpolation parameters
 * @param namespace - Optional namespace (defaults to 'app')
 */
export async function t(
    lang: string,
    key: string,
    params?: Record<string, any>,
    namespace: string = 'app'
): Promise<string> {
  // Validate language
  const validLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;

  // Load translations
  const translations = await loadTranslations(validLang, namespace);

  // Get translation value
  const value = getNestedValue(translations, key);

  // Return key if translation not found
  if (!value) {
    console.warn(`Translation missing for key: ${key} in ${validLang}/${namespace}`);
    return key;
  }

  // Handle non-string values (like objects for nested keys)
  if (typeof value !== 'string') {
    return key;
  }

  // Return interpolated translation
  return interpolate(value, params);
}

/**
 * ServerTranslation component for use in Server Components
 */
interface ServerTranslationProps {
  translationKey: string
  params?: Record<string, any>
  children: (translatedText: string) => ReactNode
}

export async function ServerTranslation({ translationKey, params, children }: ServerTranslationProps) {
  // TODO: Implement actual translation logic
  const translatedText = translationKey

  // Return the rendered children with the translated text
  return children(translatedText)
}