/**
 * Advanced Internationalization (i18n)
 * Year 3000 Level Multi-Language Support with AI Translation
 */

import { supabase } from '@/integrations/supabase/client';

export type SupportedLanguage = 
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'ru';

export interface Translation {
  key: string;
  value: string;
  language: SupportedLanguage;
}

/**
 * Translation cache
 */
const translationCache = new Map<string, Map<SupportedLanguage, string>>();

/**
 * Get current language from localStorage or browser
 */
export function getCurrentLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  
  const stored = localStorage.getItem('app_language');
  if (stored && isValidLanguage(stored)) {
    return stored as SupportedLanguage;
  }

  // Detect browser language
  const browserLang = navigator.language.split('-')[0];
  if (isValidLanguage(browserLang)) {
    return browserLang as SupportedLanguage;
  }

  return 'en';
}

/**
 * Set current language
 */
export function setCurrentLanguage(language: SupportedLanguage): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
  }
}

/**
 * Check if language is valid
 */
function isValidLanguage(lang: string): lang is SupportedLanguage {
  const validLanguages: SupportedLanguage[] = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'
  ];
  return validLanguages.includes(lang as SupportedLanguage);
}

/**
 * Translation dictionary
 */
const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'patient.list': 'Patient List',
    'patient.add': 'Add Patient',
    'patient.search': 'Search Patients',
    'medication.name': 'Medication',
    'vitals.title': 'Vital Signs',
    'appointments.title': 'Appointments',
    'settings.title': 'Settings',
    'logout': 'Logout',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
  },
  es: {
    'dashboard.title': 'Panel de Control',
    'dashboard.welcome': 'Bienvenido',
    'patient.list': 'Lista de Pacientes',
    'patient.add': 'Agregar Paciente',
    'patient.search': 'Buscar Pacientes',
    'medication.name': 'Medicamento',
    'vitals.title': 'Signos Vitales',
    'appointments.title': 'Citas',
    'settings.title': 'Configuración',
    'logout': 'Cerrar Sesión',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'delete': 'Eliminar',
    'edit': 'Editar',
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito',
  },
  fr: {
    'dashboard.title': 'Tableau de Bord',
    'dashboard.welcome': 'Bienvenue',
    'patient.list': 'Liste des Patients',
    'patient.add': 'Ajouter un Patient',
    'patient.search': 'Rechercher des Patients',
    'medication.name': 'Médicament',
    'vitals.title': 'Signes Vitaux',
    'appointments.title': 'Rendez-vous',
    'settings.title': 'Paramètres',
    'logout': 'Déconnexion',
    'save': 'Enregistrer',
    'cancel': 'Annuler',
    'delete': 'Supprimer',
    'edit': 'Modifier',
    'loading': 'Chargement...',
    'error': 'Erreur',
    'success': 'Succès',
  },
  de: {},
  it: {},
  pt: {},
  zh: {},
  ja: {},
  ko: {},
  ar: {},
  hi: {},
  ru: {},
};

/**
 * Translate text with AI fallback
 */
export async function translate(
  key: string,
  language: SupportedLanguage = getCurrentLanguage(),
  params?: Record<string, string | number>
): Promise<string> {
  // Check cache first
  const cacheKey = `${key}:${language}`;
  const cached = translationCache.get(key)?.get(language);
  if (cached) {
    return formatTranslation(cached, params);
  }

  // Check static translations
  const staticTranslation = translations[language]?.[key];
  if (staticTranslation) {
    // Cache it
    if (!translationCache.has(key)) {
      translationCache.set(key, new Map());
    }
    translationCache.get(key)!.set(language, staticTranslation);
    return formatTranslation(staticTranslation, params);
  }

  // Fallback to English
  const englishTranslation = translations.en[key];
  if (englishTranslation && language !== 'en') {
    // Try AI translation
    try {
      const aiTranslation = await translateWithAI(englishTranslation, language);
      if (aiTranslation) {
        // Cache it
        if (!translationCache.has(key)) {
          translationCache.set(key, new Map());
        }
        translationCache.get(key)!.set(language, aiTranslation);
        return formatTranslation(aiTranslation, params);
      }
    } catch (error) {
      console.warn('AI translation failed, using English:', error);
    }
  }

  // Return English or key as fallback
  return formatTranslation(englishTranslation || key, params);
}

/**
 * Format translation with parameters
 */
function formatTranslation(
  text: string,
  params?: Record<string, string | number>
): string {
  if (!params) return text;

  let formatted = text;
  Object.entries(params).forEach(([key, value]) => {
    formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  });

  return formatted;
}

/**
 * AI-powered translation
 */
async function translateWithAI(
  text: string,
  targetLanguage: SupportedLanguage
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-clinical-decision', {
      body: {
        action: 'translate',
        text,
        targetLanguage,
      },
    });

    if (error) throw error;

    return data?.translation || null;
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
}

/**
 * React hook for translations
 */
export function useTranslation() {
  const [language, setLanguage] = useState<SupportedLanguage>(getCurrentLanguage());

  const t = useCallback(
    async (key: string, params?: Record<string, string | number>) => {
      return await translate(key, language, params);
    },
    [language]
  );

  const changeLanguage = useCallback((newLanguage: SupportedLanguage) => {
    setCurrentLanguage(newLanguage);
    setLanguage(newLanguage);
    translationCache.clear(); // Clear cache on language change
  }, []);

  return { t, language, changeLanguage };
}

/**
 * Format numbers according to locale
 */
export function formatNumber(
  value: number,
  language: SupportedLanguage = getCurrentLanguage()
): string {
  return new Intl.NumberFormat(getLocaleFromLanguage(language)).format(value);
}

/**
 * Format dates according to locale
 */
export function formatDate(
  date: Date | string,
  language: SupportedLanguage = getCurrentLanguage(),
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(
    getLocaleFromLanguage(language),
    options || {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  ).format(dateObj);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  language: SupportedLanguage = getCurrentLanguage()
): string {
  return new Intl.NumberFormat(getLocaleFromLanguage(language), {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Get locale from language code
 */
function getLocaleFromLanguage(language: SupportedLanguage): string {
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-BR',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    ar: 'ar-SA',
    hi: 'hi-IN',
    ru: 'ru-RU',
  };

  return localeMap[language] || 'en-US';
}

/**
 * RTL (Right-to-Left) support
 */
export function isRTL(language: SupportedLanguage): boolean {
  return ['ar', 'he', 'fa'].includes(language);
}

/**
 * Get text direction
 */
export function getTextDirection(language: SupportedLanguage = getCurrentLanguage()): 'ltr' | 'rtl' {
  return isRTL(language) ? 'rtl' : 'ltr';
}

// Fix React import
import { useState, useCallback } from 'react';

