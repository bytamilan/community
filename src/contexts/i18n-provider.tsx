'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { useParams } from 'next/navigation';

interface I18nProviderProps {
  children: React.ReactNode
  lang?: string
}

export function I18nProvider({ children, lang }: I18nProviderProps) {
  const [mounted, setMounted] = useState(false);
  const params = useParams<{ locale?: string }>();
  
  useEffect(() => {
    // Change language based on route if available
    if (lang !== lang) {
      i18n.changeLanguage(lang)
    }else if (params?.locale && ['en', 'ta'].includes(params.locale as string)) {
      i18n.changeLanguage(params.locale as string);
    }
    
    setMounted(true);
  }, [params?.locale]);

  // To avoid hydration errors, only render once mounted on client
  if (!mounted) return null;

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}