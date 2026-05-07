import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Zap, Heart, Users, Palette, Minus } from 'lucide-react'

interface MoodOption {
  key: string
  name: string
  icon: React.ReactNode
  description: string
}

interface MoodSelectorProps {
  selectedMoods: string[]
  onMoodsChange: (moods: string[]) => void
}

export function MoodSelector({ selectedMoods, onMoodsChange }: MoodSelectorProps) {
  const { t } = useTranslation()

  const moods: MoodOption[] = [
    {
      key: 'productive',
      name: t('demo.steps.2.moods.productive'),
      icon: <Zap size={20} />,
      description: t('demo.steps.2.moodDescriptions.productive'),
    },
    {
      key: 'relaxing',
      name: t('demo.steps.2.moods.relaxing'),
      icon: <Heart size={20} />,
      description: t('demo.steps.2.moodDescriptions.relaxing'),
    },
    {
      key: 'social',
      name: t('demo.steps.2.moods.social'),
      icon: <Users size={20} />,
      description: t('demo.steps.2.moodDescriptions.social'),
    },
    {
      key: 'creative',
      name: t('demo.steps.2.moods.creative'),
      icon: <Palette size={20} />,
      description: t('demo.steps.2.moodDescriptions.creative'),
    },
    {
      key: 'minimal',
      name: t('demo.steps.2.moods.minimal'),
      icon: <Minus size={20} />,
      description: t('demo.steps.2.moodDescriptions.minimal'),
    }
  ]

  const toggleMood = (moodKey: string) => {
    if (selectedMoods.includes(moodKey)) {
      onMoodsChange(selectedMoods.filter(m => m !== moodKey))
    } else {
      onMoodsChange([...selectedMoods, moodKey])
    }
  }

  return (
    <div className="nr-moodGrid">
      {moods.map((mood) => (
        <motion.button
          key={mood.key}
          type="button"
          className={`nr-moodCard ${selectedMoods.includes(mood.key) ? 'is-selected' : ''}`}
          onClick={() => toggleMood(mood.key)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="nr-moodIcon">
            {mood.icon}
          </div>
          <div className="nr-moodContent">
            <div className="nr-moodName">{mood.name}</div>
            <div className="nr-moodDesc">{mood.description}</div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
