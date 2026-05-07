import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface RoomSizeOption {
  key: string
  name: string
  dimensions: string
  description: string
}

interface RoomSizeSelectorProps {
  selectedSize: string
  onSizeChange: (size: string) => void
}

export function RoomSizeSelector({ selectedSize, onSizeChange }: RoomSizeSelectorProps) {
  const { t } = useTranslation()

  const sizes: RoomSizeOption[] = [
    {
      key: 'small',
      name: t('demo.steps.1.roomSizes.small'),
      dimensions: t('demo.steps.1.roomSizeDimensions.small'),
      description: t('demo.steps.1.roomSizeDescriptions.small'),
    },
    {
      key: 'medium',
      name: t('demo.steps.1.roomSizes.medium'),
      dimensions: t('demo.steps.1.roomSizeDimensions.medium'),
      description: t('demo.steps.1.roomSizeDescriptions.medium'),
    },
    {
      key: 'large',
      name: t('demo.steps.1.roomSizes.large'),
      dimensions: t('demo.steps.1.roomSizeDimensions.large'),
      description: t('demo.steps.1.roomSizeDescriptions.large'),
    },
    {
      key: 'xl',
      name: t('demo.steps.1.roomSizes.xl'),
      dimensions: t('demo.steps.1.roomSizeDimensions.xl'),
      description: t('demo.steps.1.roomSizeDescriptions.xl'),
    }
  ]

  return (
    <div className="nr-sizeGrid">
      {sizes.map((size) => (
        <motion.button
          key={size.key}
          type="button"
          className={`nr-sizeCard ${selectedSize === size.key ? 'is-selected' : ''}`}
          onClick={() => onSizeChange(size.key)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="nr-sizeContent">
            <div className="nr-sizeName">{size.name}</div>
            <div className="nr-sizeDimensions">{size.dimensions}</div>
            <div className="nr-sizeDesc">{size.description}</div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
