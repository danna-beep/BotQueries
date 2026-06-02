import { useTranslation as useI18nTranslation } from 'react-i18next'

export const useTranslation = (namespace?: string) => {
  const { t, i18n } = useI18nTranslation(namespace)
  
  const onChangeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }
  
  const currentLanguage = i18n.language
  
  return {
    t,
    onChangeLanguage,
    currentLanguage,
    isReady: i18n.isInitialized,
  }
}
