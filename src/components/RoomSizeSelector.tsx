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
      dimensions: '8-12m²',
      description: 'Compact spaces, efficient use'
    },
    {
      key: 'medium',
      name: t('demo.steps.1.roomSizes.medium'),
      dimensions: '12-20m²',
      description: 'Balanced comfort and space'
    },
    {
      key: 'large',
      name: t('demo.steps.1.roomSizes.large'),
      dimensions: '20-35m²',
      description: 'Room for larger furniture'
    },
    {
      key: 'xl',
      name: t('demo.steps.1.roomSizes.xl'),
      dimensions: '35m²+',
      description: 'Spacious and luxurious'
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