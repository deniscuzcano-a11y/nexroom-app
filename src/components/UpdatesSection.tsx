import { motion } from 'framer-motion'
import {
  BadgeCheck,
  Boxes,
  ChevronDown,
  CheckCircle2,
  Languages,
  ScanSearch,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type UpdateItem = {
  badge: string
  title: string
  body: string
}

type UpdateRelease = {
  key: string
  name: string
  label: string
  changes: string[]
}

const icons = [ScanSearch, BadgeCheck, Boxes, Languages, Sparkles, Zap] as const

export function UpdatesSection() {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const items = useMemo(
    () => t('updates.items', { returnObjects: true }) as UpdateItem[],
    [t],
  )
  const releases = useMemo(
    () => t('updates.releases', { returnObjects: true }) as UpdateRelease[],
    [t],
  )
  const [activeReleaseKey, setActiveReleaseKey] = useState(() => releases[0]?.key ?? '')
  const activeRelease = releases.find((release) => release.key === activeReleaseKey) ?? releases[0]
  const visibleItems = isExpanded ? items : items.slice(0, 3)

  return (
    <section className="nr-updates" aria-labelledby="updates-title">
      <div className="nr-sectionHead">
        <h2 id="updates-title">{t('updates.title')}</h2>
        <p className="nr-sectionSub">{t('updates.subtitle')}</p>
      </div>

      <div className="nr-updatesGrid">
        {visibleItems.map((item, index) => {
          const Icon = icons[index % icons.length]

          return (
            <motion.article
              key={item.title}
              className="nr-updateCard"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
            >
              <div className="nr-updateTop">
                <span className="nr-updateIcon" aria-hidden="true">
                  <Icon size={18} strokeWidth={2.1} />
                </span>
                <span className="nr-updateBadge">{item.badge}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </motion.article>
          )
        })}
      </div>

      <div className="nr-updatesAction">
        <button
          type="button"
          className="nr-secondaryBtn nr-updatesToggle"
          onClick={() => setIsExpanded((value) => !value)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? t('updates.showLess') : t('updates.showMore')}
          <ChevronDown
            size={16}
            strokeWidth={2.2}
            className={isExpanded ? 'is-open' : undefined}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          className="nr-secondaryBtn nr-updatesToggle"
          onClick={() => setIsHistoryOpen((value) => !value)}
          aria-expanded={isHistoryOpen}
        >
          {isHistoryOpen ? t('updates.hideHistory') : t('updates.viewHistory')}
          <ChevronDown
            size={16}
            strokeWidth={2.2}
            className={isHistoryOpen ? 'is-open' : undefined}
            aria-hidden="true"
          />
        </button>
      </div>

      {isHistoryOpen && activeRelease && (
        <motion.div
          className="nr-updateHistoryPanel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div className="nr-updatesHistory">
            <label className="nr-updateSelectLabel" htmlFor="nr-update-select">
              {t('updates.selectLabel')}
            </label>
            <div className="nr-updateSelectWrap">
              <select
                id="nr-update-select"
                className="nr-updateSelect"
                value={activeRelease.key}
                onChange={(event) => setActiveReleaseKey(event.target.value)}
              >
                {releases.map((release) => (
                  <option key={release.key} value={release.key}>
                    {release.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <article
            className="nr-updateReleaseCard"
          >
            <div className="nr-updateReleaseTop">
              <span className="nr-updateIcon" aria-hidden="true">
                <BadgeCheck size={18} strokeWidth={2.1} />
              </span>
              <span className="nr-updateBadge">{activeRelease.label}</span>
            </div>

            <div className="nr-updateReleaseBody">
              <h3>{activeRelease.name}</h3>
              <ul className="nr-updateChangeList">
                {activeRelease.changes.map((change) => (
                  <li key={change}>
                    <CheckCircle2 size={16} strokeWidth={2.2} aria-hidden="true" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </motion.div>
      )}
    </section>
  )
}
