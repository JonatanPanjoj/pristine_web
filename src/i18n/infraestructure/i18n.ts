// infrastructure/i18n/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../locales/en/translation.json';
import translationES from '../locales/es/translation.json';

// Configuración de idiomas y recursos
const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
};

// Detecta el idioma del navegador, pero si no está disponible, usa inglés como fallback
const browserLanguage = navigator.language.split('-')[0]; // Ej: 'es-ES' -> 'es'
const supportedLanguages = ['en', 'es']; // Idiomas que soporta tu aplicación
const defaultLanguage = supportedLanguages.includes(browserLanguage) ? browserLanguage : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage, // Usa el idioma detectado del navegador o inglés
    fallbackLng: 'en', // Si el idioma del navegador no es soportado, usa inglés
    interpolation: {
      escapeValue: false, // React ya escapa los valores por defecto
    },
  });

export default i18n;
