import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface ColorPaletteOption {
  key: string
  name: string
  colors: string[]
  description: string
}

interface ColorPaletteSelectorProps {
  selectedPalette: string
  onPaletteChange: (palette: string) => void
}

export function ColorPaletteSelector({ selectedPalette, onPaletteChange }: ColorPaletteSelectorProps) {
  const { t } = useTranslation()

  const palettes: ColorPaletteOption[] = [
    {
      key: 'neutral',
      name: t('demo.steps.1.colorPalettes.neutral'),
      colors: ['#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8'],
      description: t('demo.steps.1.colorPaletteDescriptions.neutral'),
    },
    {
      key: 'warm',
      name: t('demo.steps.1.colorPalettes.warm'),
      colors: ['#fef7ed', '#fed7aa', '#fdba74', '#fb923c'],
      description: t('demo.steps.1.colorPaletteDescriptions.warm'),
    },
    {
      key: 'cool',
      name: t('demo.steps.1.colorPalettes.cool'),
      colors: ['#f0f9ff', '#bae6fd', '#7dd3fc', '#38bdf8'],
      description: t('demo.steps.1.colorPaletteDescriptions.cool'),
    },
    {
      key: 'bold',
      name: t('demo.steps.1.colorPalettes.bold'),
      colors: ['#fef2f2', '#fecaca', '#fca5a5', '#f87171'],
      description: t('demo.steps.1.colorPaletteDescriptions.bold'),
    }
  ]

  return (
    <div className="nr-paletteGrid">
      {palettes.map((palette) => (
        <motion.button
          key={palette.key}
          type="button"
          className={`nr-paletteCard ${selectedPalette === palette.key ? 'is-selected' : ''}`}
          onClick={() => onPaletteChange(palette.key)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="nr-paletteColors">
            {palette.colors.map((color, index) => (
              <div
                key={index}
                className="nr-paletteSwatch"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="nr-paletteContent">
            <div className="nr-paletteName">{palette.name}</div>
            <div className="nr-paletteDesc">{palette.description}</div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
