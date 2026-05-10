import './ExperiencePage.css'

import { motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  BadgeEuro,
  Boxes,
  Eye,
  Layers3,
  ScanSearch,
  Sparkles,
} from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import heroPrism from '../assets/hero.png'
import { LanguageSwitcher } from './LanguageSwitcher'
import { RoomSceneMockup } from './RoomSceneMockup'

const BETA_FORM_URL = 'https://tally.so/r/rjGd1v'

type DoubtCard = {
  title: string
  body: string
}

type AnalysisCard = {
  title: string
  value: string
  body: string
}

type ScanStat = {
  label: string
  value: string
}

type PackCard = {
  title: string
  label: string
  price: string
  body: string
  items: string[]
}

type BudgetRow = {
  label: string
  value: string
}

type SectionCopy = {
  kicker: string
  title: string
  body: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

function ExperienceSection({
  id,
  copy,
  visual,
  flip = false,
}: {
  id: string
  copy: SectionCopy
  visual: React.ReactNode
  flip?: boolean
}) {
  return (
    <motion.section
      id={id}
      className={`nx-section ${flip ? 'is-flipped' : ''}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      variants={stagger}
    >
      <motion.div className="nx-sectionCopy" variants={fadeUp}>
        <p className="nx-kicker">{copy.kicker}</p>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
      </motion.div>
      <motion.div className="nx-sectionVisual" variants={fadeUp}>
        {visual}
      </motion.div>
    </motion.section>
  )
}

export function ExperiencePage() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? i18n.language
  const fixedT = useMemo(() => i18n.getFixedT(language), [i18n, language])

  const translatedArray = useCallback(<T,>(key: string) => {
    const value = fixedT(key, { returnObjects: true })
    return Array.isArray(value) ? (value as T[]) : []
  }, [fixedT])

  const problemCards = useMemo(
    () => translatedArray<DoubtCard>('experience.problem.cards'),
    [translatedArray],
  )
  const scanStats = useMemo(
    () => translatedArray<ScanStat>('experience.scan.stats'),
    [translatedArray],
  )
  const analysisCards = useMemo(
    () => translatedArray<AnalysisCard>('experience.analysis.cards'),
    [translatedArray],
  )
  const packs = useMemo(
    () => translatedArray<PackCard>('experience.packs.cards'),
    [translatedArray],
  )
  const budgetRows = useMemo(
    () => translatedArray<BudgetRow>('experience.budget.rows'),
    [translatedArray],
  )
  const heroLabels = useMemo(
    () => translatedArray<string>('experience.hero.visual.labels'),
    [translatedArray],
  )
  const scanLabels = useMemo(
    () => translatedArray<string>('experience.scan.labels'),
    [translatedArray],
  )
  const transformBeforeLabels = useMemo(
    () => translatedArray<string>('experience.transformation.before.labels'),
    [translatedArray],
  )
  const transformAfterLabels = useMemo(
    () => translatedArray<string>('experience.transformation.after.labels'),
    [translatedArray],
  )

  return (
    <div className="nx-experience">
      <div className="nx-backdrop" aria-hidden="true" />

      <header className="nx-header">
        <a className="nx-brand" href="/" aria-label={t('experience.nav.homeAria')}>
          <span className="nx-mark">N</span>
          <span>{t('experience.brand')}</span>
        </a>

        <nav className="nx-nav" aria-label={t('experience.nav.aria')}>
          <a href="#scan">{t('experience.nav.scan')}</a>
          <a href="#packs">{t('experience.nav.packs')}</a>
          <a href="#beta">{t('experience.nav.beta')}</a>
        </nav>

        <LanguageSwitcher />
      </header>

      <main>
        <section className="nx-hero" aria-labelledby="experience-title">
          <motion.div
            className="nx-heroCopy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
          >
            <p className="nx-eyebrow">
              <Sparkles size={16} aria-hidden="true" />
              <span>{t('experience.hero.eyebrow')}</span>
            </p>
            <h1 id="experience-title">{t('experience.hero.title')}</h1>
            <p className="nx-heroText">{t('experience.hero.subtitle')}</p>

            <div className="nx-ctaRow">
              <a className="nx-primaryCta" href="#problem">
                <span>{t('experience.hero.primaryCta')}</span>
                <ArrowDown size={18} aria-hidden="true" />
              </a>
              <a
                className="nx-secondaryCta"
                href={BETA_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{t('experience.hero.secondaryCta')}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="nx-heroVisual"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.16 }}
            aria-label={t('experience.hero.visual.aria')}
          >
            <img className="nx-prism" src={heroPrism} alt="" aria-hidden="true" />
            <div className="nx-productFrame">
              <div className="nx-frameTop">
                <span>{t('experience.hero.visual.badge')}</span>
                <strong>{t('experience.hero.visual.status')}</strong>
              </div>

              <RoomSceneMockup
                mode="scan"
                labels={heroLabels}
                showScan
                className="nx-heroRoom"
                ariaLabel={t('experience.hero.visual.aria')}
              />

              <div className="nx-heroPanel">
                <div>
                  <span>{t('experience.hero.visual.panelLabel')}</span>
                  <strong>{t('experience.hero.visual.panelTitle')}</strong>
                </div>
                <div className="nx-miniBudget">
                  <BadgeEuro size={16} aria-hidden="true" />
                  <span>{t('experience.hero.visual.budget')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <ExperienceSection
          id="problem"
          copy={{
            kicker: t('experience.problem.kicker'),
            title: t('experience.problem.title'),
            body: t('experience.problem.body'),
          }}
          visual={
            <div className="nx-doubtGrid">
              {problemCards.map((card, index) => (
                <motion.article
                  className="nx-doubtCard"
                  key={`problem-${index}`}
                  variants={fadeUp}
                  custom={index}
                >
                  <span>0{index + 1}</span>
                  <strong>{card.title}</strong>
                  <p>{card.body}</p>
                </motion.article>
              ))}
            </div>
          }
        />

        <ExperienceSection
          id="scan"
          flip
          copy={{
            kicker: t('experience.scan.kicker'),
            title: t('experience.scan.title'),
            body: t('experience.scan.body'),
          }}
          visual={
            <div className="nx-scanStudio">
              <div className="nx-scanTop">
                <ScanSearch size={18} aria-hidden="true" />
                <span>{t('experience.scan.visualLabel')}</span>
              </div>
              <RoomSceneMockup
                mode="scan"
                labels={scanLabels}
                showScan
                className="nx-scanRoom"
                ariaLabel={t('experience.scan.visualLabel')}
              />
              <div className="nx-scanStats">
                {scanStats.map((stat, index) => (
                  <div key={`scan-stat-${index}`}>
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        <ExperienceSection
          id="analysis"
          copy={{
            kicker: t('experience.analysis.kicker'),
            title: t('experience.analysis.title'),
            body: t('experience.analysis.body'),
          }}
          visual={
            <div className="nx-analysisDeck">
              {analysisCards.map((card, index) => {
                const icons = [Eye, Layers3, BadgeEuro, Boxes, Sparkles]
                const Icon = icons[index % icons.length]

                return (
                  <motion.article className="nx-analysisCard" key={`analysis-${index}`} variants={fadeUp}>
                    <Icon size={18} aria-hidden="true" />
                    <span>{card.title}</span>
                    <strong>{card.value}</strong>
                    <p>{card.body}</p>
                  </motion.article>
                )
              })}
            </div>
          }
        />

        <ExperienceSection
          id="transformation"
          flip
          copy={{
            kicker: t('experience.transformation.kicker'),
            title: t('experience.transformation.title'),
            body: t('experience.transformation.body'),
          }}
          visual={
            <div className="nx-transformStage">
              <article>
                <div className="nx-stageLabel">{t('experience.transformation.before.title')}</div>
                <RoomSceneMockup
                  mode="before"
                  labels={transformBeforeLabels}
                  compact
                  className="nx-stageRoom"
                  ariaLabel={t('experience.transformation.before.title')}
                />
                <p>{t('experience.transformation.before.body')}</p>
              </article>
              <article>
                <div className="nx-stageLabel">{t('experience.transformation.after.title')}</div>
                <RoomSceneMockup
                  mode="after"
                  labels={transformAfterLabels}
                  compact
                  className="nx-stageRoom"
                  ariaLabel={t('experience.transformation.after.title')}
                />
                <p>{t('experience.transformation.after.body')}</p>
              </article>
            </div>
          }
        />

        <section id="packs" className="nx-packs" aria-labelledby="packs-title">
          <motion.div
            className="nx-sectionHead"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.14 }}
            variants={stagger}
          >
            <motion.p className="nx-kicker" variants={fadeUp}>
              {t('experience.packs.kicker')}
            </motion.p>
            <motion.h2 id="packs-title" variants={fadeUp}>
              {t('experience.packs.title')}
            </motion.h2>
            <motion.p variants={fadeUp}>{t('experience.packs.body')}</motion.p>
          </motion.div>

          <motion.div
            className="nx-packGrid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
            variants={stagger}
          >
            {packs.map((pack, index) => (
              <motion.article className="nx-packCard" key={`pack-${index}`} variants={fadeUp}>
                <div className="nx-packTop">
                  <span>{pack.label}</span>
                  <strong>{pack.price}</strong>
                </div>
                <div className={`nx-packVisual nx-packVisual--${index % 3}`} aria-hidden="true" />
                <h3>{pack.title}</h3>
                <p>{pack.body}</p>
                <ul>
                  {pack.items.map((item, itemIndex) => (
                    <li key={`pack-${index}-item-${itemIndex}`}>{item}</li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <ExperienceSection
          id="budget"
          copy={{
            kicker: t('experience.budget.kicker'),
            title: t('experience.budget.title'),
            body: t('experience.budget.body'),
          }}
          visual={
            <div className="nx-budgetPanel">
              <div className="nx-budgetHeader">
                <span>{t('experience.budget.visualLabel')}</span>
                <strong>{t('experience.budget.total')}</strong>
              </div>
              <div className="nx-budgetTrack" aria-hidden="true">
                <span />
              </div>
              <div className="nx-budgetRows">
                {budgetRows.map((row, index) => (
                  <div key={`budget-row-${index}`}>
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>
              <p>{t('experience.budget.note')}</p>
            </div>
          }
        />

        <section id="beta" className="nx-close" aria-labelledby="beta-title">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.14 }}
            transition={{ duration: 0.65 }}
          >
            <p className="nx-kicker">{t('experience.close.kicker')}</p>
            <h2 id="beta-title">{t('experience.close.title')}</h2>
            <p>{t('experience.close.body')}</p>
            <div className="nx-ctaRow">
              <a
                className="nx-primaryCta"
                href={BETA_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{t('experience.close.primaryCta')}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="nx-secondaryCta" href="/">
                <span>{t('experience.close.secondaryCta')}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <small>{t('experience.close.note')}</small>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
