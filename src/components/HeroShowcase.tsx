import { motion } from 'framer-motion'
import { BadgeEuro, ScanSearch, Sparkles, WandSparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { RoomSceneMockup } from './RoomSceneMockup'

export function HeroShowcase() {
  const { t } = useTranslation()
  const roomLabels = [
    t('demo.visual.tags.modernStyle'),
    t('demo.visual.tags.warmLighting'),
    t('demo.visual.tags.recommendedLayout'),
  ]

  return (
    <motion.div
      className="nr-heroShowcase"
      aria-hidden="true"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.2 }}
    >
      <div className="nr-heroShowcaseTop">
        <div>
          <span className="nr-aiDot" />
          <span>{t('hero.visual.liveLabel')}</span>
        </div>
        <span>{t('hero.visual.confidence')}</span>
      </div>

      <RoomSceneMockup mode="scan" labels={roomLabels} showScan />

      <div className="nr-heroInsightPanel">
        <div className="nr-heroInsightTitle">
          <Sparkles size={16} />
          <span>{t('hero.visual.title')}</span>
        </div>
        <p>{t('hero.visual.subtitle')}</p>

        <div className="nr-heroMetricGrid">
          <div className="nr-heroMetric">
            <BadgeEuro size={16} />
            <span>{t('hero.visual.budget')}</span>
            <strong>€1,200</strong>
          </div>
          <div className="nr-heroMetric">
            <ScanSearch size={16} />
            <span>{t('hero.visual.match')}</span>
            <strong>94%</strong>
          </div>
          <div className="nr-heroMetric">
            <WandSparkles size={16} />
            <span>{t('hero.visual.estimate')}</span>
            <strong>€1,148</strong>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
