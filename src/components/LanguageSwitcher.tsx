import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="nr-langBtn"
      aria-label={t('language.switch')}
    >
      <Languages size={16} />
      <span>{i18n.language === 'en' ? 'ES' : 'EN'}</span>
    </button>
  )
}