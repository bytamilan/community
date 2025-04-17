'use client';

import { useTranslation as useTran} from 'react-i18next';
import {SUPPORTED_LANGUAGES} from "@/lib/i18n";

export function useTranslation() {
  const { t, i18n } = useTran();
  
  return {
    t,
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage,
    languages: SUPPORTED_LANGUAGES,
    languageNames: {
      'en': 'English',
      'zh': '中文'
    }
  };
}