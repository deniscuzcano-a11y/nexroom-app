import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface StyleOption {
  key: string
  name: string
  description: string
  image: string
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
      description: 'Clean lines, bold accents',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'
    },
    {
      key: 'scandinavian',
      name: t('demo.steps.1.styles.scandinavian'),
      description: 'Light woods, functional design',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'
    },
    {
      key: 'japandi',
      name: t('demo.steps.1.styles.japandi'),
      description: 'Minimalist, natural materials',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'
    },
    {
      key: 'minimalist',
      name: t('demo.steps.1.styles.minimalist'),
      description: 'Less is more, pure simplicity',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'
    },
    {
      key: 'luxury',
      name: t('demo.steps.1.styles.luxury'),
      description: 'Premium materials, elegant details',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'
    },
    {
      key: 'cozy',
      name: t('demo.steps.1.styles.cozy'),
      description: 'Warm textures, inviting spaces',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'
    }
  ]

  return (
    <div className="nr-styleGrid">
      {styles.map((style) => (
        <motion.button
          key={style.key}
          type="button"
          className={`nr-styleCard ${selectedStyle === style.key ? 'is-selected' : ''}`}
          onClick={() => onStyleChange(style.key)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="nr-styleImage"
            style={{ backgroundImage: `url(${style.image})` }}
          />
          <div className="nr-styleContent">
            <div className="nr-styleName">{style.name}</div>
            <div className="nr-styleDesc">{style.description}</div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}