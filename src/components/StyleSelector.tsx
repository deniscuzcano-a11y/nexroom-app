import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface StyleOption {
  key: string
  name: string
  description: string
}

interface StyleSelectorProps {
  selectedStyle: string
  onStyleChange: (style: string) => void
}

export function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  const { t } = useTranslation()

  const styles: StyleOption[] = [
    {
      key: 'modern',
      name: t('demo.steps.1.styles.modern'),
      description: t('demo.steps.1.styleDescriptions.modern'),
    },
    {
      key: 'scandinavian',
      name: t('demo.steps.1.styles.scandinavian'),
      description: t('demo.steps.1.styleDescriptions.scandinavian'),
    },
    {
      key: 'japandi',
      name: t('demo.steps.1.styles.japandi'),
      description: t('demo.steps.1.styleDescriptions.japandi'),
    },
    {
      key: 'minimalist',
      name: t('demo.steps.1.styles.minimalist'),
      description: t('demo.steps.1.styleDescriptions.minimalist'),
    },
    {
      key: 'luxury',
      name: t('demo.steps.1.styles.luxury'),
      description: t('demo.steps.1.styleDescriptions.luxury'),
    },
    {
      key: 'cozy',
      name: t('demo.steps.1.styles.cozy'),
      description: t('demo.steps.1.styleDescriptions.cozy'),
    }
  ]

  return (
    <div className="nr-styleGrid">
      {styles.map((style) => (
        <motion.button
          key={style.key}
          type="button"
          className={`nr-styleCard ${selectedStyle === style.key ? 'is-selected' : ''}`}
          data-style={style.key}
          onClick={() => onStyleChange(style.key)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="nr-styleImage"
          >
            <span />
            <span />
            <span />
          </div>
          <div className="nr-styleContent">
            <div className="nr-styleName">{style.name}</div>
            <div className="nr-styleDesc">{style.description}</div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
