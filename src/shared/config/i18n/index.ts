import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ru from './locales/ru.json'

const LANGUAGE_STORAGE_KEY = 'app-language'

function readStoredLanguage(): 'ru' | 'en' {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (stored === 'ru' || stored === 'en') {
    return stored
  }
  return 'ru'
}

const initialLanguage = readStoredLanguage()

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

document.documentElement.lang = initialLanguage

i18n.on('languageChanged', (language) => {
  const normalized = language.startsWith('ru') ? 'ru' : 'en'
  localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized)
  document.documentElement.lang = normalized
})

export { i18n }
