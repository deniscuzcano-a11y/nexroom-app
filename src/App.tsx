import './App.css'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { BadgeEuro, Boxes, Clapperboard, Sparkles } from 'lucide-react'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { ImagePlaceholder } from './components/ImagePlaceholder'
import { RoomAnalyzer } from './components/RoomAnalyzer'
import { HeroShowcase } from './components/HeroShowcase'
import { AIDemoPreview } from './components/AIDemoPreview'
import { StyleSelector } from './components/StyleSelector'
import { RoomTypeSelector } from './components/RoomTypeSelector'
import { ColorPaletteSelector } from './components/ColorPaletteSelector'
import { MoodSelector } from './components/MoodSelector'
import { RoomSizeSelector } from './components/RoomSizeSelector'
import { UpdatesSection } from './components/UpdatesSection'
import { AboutSection } from './components/AboutSection'
import { ExperiencePage } from './components/ExperiencePage'
import type { RoomAnalysisResult } from './types/roomAnalysis'
import type {
  ColorPaletteKey,
  MoodKey,
  NeedKey,
  RoomSizeKey,
  RoomTypeKey,
  StyleKey,
} from './types'

type SetupItem = {
  key: NeedKey
  name: string
  category: string
  price: number
  note?: string
}

type GeneratedSetup = {
  budget: number
  style: StyleKey
  needs: NeedKey[]
  items: SetupItem[]
  total: number
  status: 'within' | 'over'
  summary: string
}

type ExampleItem = {
  title: string
  meta: string
  body: string
  style: 'minimal' | 'modern' | 'cozy' | 'scandinavian' | 'japandi' | 'luxury'
}

type FeatureItem = {
  title: string
  body: string
}

type StepItem = {
  title: string
  body: string
}

type TestimonialItem = {
  quote: string
  name: string
  role: string
}

type PricingPlan = {
  name: string
  price: string
  unit?: string
  features: string[]
  cta: string
}

type ExploreCard = {
  title: string
  body: string
  cta: string
  href: string
  kind: 'demo' | 'experience' | 'beta' | 'updates'
}

type ConfigPanelStep = 'space' | 'style' | 'budget'

function eur(value: number, language = 'en') {
  return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function pick<T>(arr: readonly T[], r: () => number) {
  return arr[Math.floor(r() * arr.length)] ?? arr[0]
}

function createRng(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function tierForBudget(budget: number) {
  if (budget < 500) return 'low' as const
  if (budget < 800) return 'mid' as const
  return 'high' as const
}

type Translate = (key: string, options?: Record<string, string | number>) => string

function styleTone(style: StyleKey, t?: Translate) {
  const key = `demo.styleTone.${style}`
  if (t) {
    return {
      adjective: t(`${key}.adjective`),
      vibe: t(`${key}.vibe`),
    }
  }

  switch (style) {
    case 'minimalist':
      return { adjective: 'Minimal', vibe: 'clean lines, calm palette' }
    case 'modern':
      return { adjective: 'Modern', vibe: 'bold accents, sleek forms' }
    case 'cozy':
      return { adjective: 'Cozy', vibe: 'warm textures, soft light' }
    case 'scandinavian':
      return { adjective: 'Scandinavian', vibe: 'light woods, functional design' }
    case 'japandi':
      return { adjective: 'Japandi', vibe: 'minimalist, natural materials' }
    case 'luxury':
      return { adjective: 'Luxury', vibe: 'premium materials, elegant details' }
    default:
      return { adjective: 'Modern', vibe: 'bold accents, sleek forms' }
  }
}

function generateSetup(params: {
  budget: number
  style: StyleKey
  needs: NeedKey[]
  roomType: RoomTypeKey
  roomSize: RoomSizeKey
  colorPalette: ColorPaletteKey
  moods: MoodKey[]
  t: Translate
  analysis?: RoomAnalysisResult | null
}): GeneratedSetup {
  const budget = clamp(Math.round(params.budget || 0), 150, 12000)
  const style = params.style
  const needs = params.needs.length ? params.needs : (['bed', 'lamp'] as NeedKey[])
  const roomType = params.roomType
  const roomSize = params.roomSize
  const colorPalette = params.colorPalette
  const moods = params.moods

  const tier = tierForBudget(budget)
  const tone = styleTone(style, params.t)
  const analysis = params.analysis
  const analysisReason = (need: NeedKey) => {
    const lighting = analysis ? analysis.lightingQuality.toLowerCase() : params.t('demo.catalog.analysisFallback.light')
    const colors = analysis?.dominantColors?.slice(0, 2).join(params.t('demo.catalog.analysisFallback.and')) || params.t('demo.catalog.analysisFallback.palette')
    const missing = analysis?.missingFurniture?.includes(need)
      ? params.t('demo.catalog.analysisFallback.urgent')
      : params.t('demo.catalog.analysisFallback.flow')
    return params.t('demo.catalog.analysisFallback.reason', { missing, lighting, colors })
  }

  const seed =
    budget * 31 +
    style.charCodeAt(0) * 997 +
    needs.reduce((acc, n) => acc + n.charCodeAt(0) * 101, 0) +
    roomType.charCodeAt(0) * 103 +
    roomSize.charCodeAt(0) * 107 +
    colorPalette.charCodeAt(0) * 109 +
    moods.reduce((acc, m) => acc + m.charCodeAt(0) * 113, 0)
  const r = createRng(seed)

  const catalog: Record<
    NeedKey,
    Record<
      'low' | 'mid' | 'high',
      { names: string[]; min: number; max: number; notes?: string[] }
    >
  > = {
    bed: {
      low: {
        names: [
          params.t('demo.catalog.bed.low.0', { style: tone.adjective }),
          params.t('demo.catalog.bed.low.1', { style: tone.adjective }),
          params.t('demo.catalog.bed.low.2', { style: tone.adjective }),
        ],
        min: 180,
        max: 260,
        notes: [params.t('demo.catalog.notes.value'), params.t('demo.catalog.notes.sturdy')],
      },
      mid: {
        names: [
          params.t('demo.catalog.bed.mid.0', { style: tone.adjective }),
          params.t('demo.catalog.bed.mid.1', { style: tone.adjective }),
          params.t('demo.catalog.bed.mid.2', { style: tone.adjective }),
        ],
        min: 250,
        max: 380,
        notes: [params.t('demo.catalog.notes.materials'), params.t('demo.catalog.notes.comfort')],
      },
      high: {
        names: [
          params.t('demo.catalog.bed.high.0', { style: tone.adjective }),
          params.t('demo.catalog.bed.high.1', { style: tone.adjective }),
          params.t('demo.catalog.bed.high.2', { style: tone.adjective }),
        ],
        min: 390,
        max: 620,
        notes: [params.t('demo.catalog.notes.premium'), params.t('demo.catalog.notes.longTerm')],
      },
    },
    desk: {
      low: {
        names: [
          params.t('demo.catalog.desk.low.0', { style: tone.adjective }),
          params.t('demo.catalog.desk.low.1', { style: tone.adjective }),
          params.t('demo.catalog.desk.low.2', { style: tone.adjective }),
        ],
        min: 69,
        max: 120,
        notes: [params.t('demo.catalog.notes.spaceSaving'), params.t('demo.catalog.notes.functional')],
      },
      mid: {
        names: [
          params.t('demo.catalog.desk.mid.0', { style: tone.adjective }),
          params.t('demo.catalog.desk.mid.1', { style: tone.adjective }),
          params.t('demo.catalog.desk.mid.2', { style: tone.adjective }),
        ],
        min: 109,
        max: 190,
        notes: [params.t('demo.catalog.notes.ergonomics'), params.t('demo.catalog.notes.tidy')],
      },
      high: {
        names: [
          params.t('demo.catalog.desk.high.0', { style: tone.adjective }),
          params.t('demo.catalog.desk.high.1', { style: tone.adjective }),
          params.t('demo.catalog.desk.high.2', { style: tone.adjective }),
        ],
        min: 170,
        max: 280,
        notes: [params.t('demo.catalog.notes.finish'), params.t('demo.catalog.notes.durable')],
      },
    },
    lamp: {
      low: {
        names: [
          params.t('demo.catalog.lamp.low.0', { style: tone.adjective }),
          params.t('demo.catalog.lamp.low.1', { style: tone.adjective }),
          params.t('demo.catalog.lamp.low.2', { style: tone.adjective }),
        ],
        min: 24,
        max: 55,
        notes: [params.t('demo.catalog.notes.warmLight'), params.t('demo.catalog.notes.valueLighting')],
      },
      mid: {
        names: [
          params.t('demo.catalog.lamp.mid.0', { style: tone.adjective }),
          params.t('demo.catalog.lamp.mid.1', { style: tone.adjective }),
          params.t('demo.catalog.lamp.mid.2', { style: tone.adjective }),
        ],
        min: 45,
        max: 85,
        notes: [params.t('demo.catalog.notes.lightQuality'), params.t('demo.catalog.notes.premiumLook')],
      },
      high: {
        names: [
          params.t('demo.catalog.lamp.high.0', { style: tone.adjective }),
          params.t('demo.catalog.lamp.high.1', { style: tone.adjective }),
          params.t('demo.catalog.lamp.high.2', { style: tone.adjective }),
        ],
        min: 70,
        max: 130,
        notes: [params.t('demo.catalog.notes.scenes'), params.t('demo.catalog.notes.statementLight')],
      },
    },
    storage: {
      low: {
        names: [
          params.t('demo.catalog.storage.low.0', { style: tone.adjective }),
          params.t('demo.catalog.storage.low.1', { style: tone.adjective }),
          params.t('demo.catalog.storage.low.2', { style: tone.adjective }),
        ],
        min: 69,
        max: 120,
        notes: [params.t('demo.catalog.notes.organization'), params.t('demo.catalog.notes.quickSetup')],
      },
      mid: {
        names: [
          params.t('demo.catalog.storage.mid.0', { style: tone.adjective }),
          params.t('demo.catalog.storage.mid.1', { style: tone.adjective }),
          params.t('demo.catalog.storage.mid.2', { style: tone.adjective }),
        ],
        min: 110,
        max: 190,
        notes: [params.t('demo.catalog.notes.cleaner'), params.t('demo.catalog.notes.capacity')],
      },
      high: {
        names: [
          params.t('demo.catalog.storage.high.0', { style: tone.adjective }),
          params.t('demo.catalog.storage.high.1', { style: tone.adjective }),
          params.t('demo.catalog.storage.high.2', { style: tone.adjective }),
        ],
        min: 180,
        max: 320,
        notes: [params.t('demo.catalog.notes.premiumCapacity'), params.t('demo.catalog.notes.builtIn')],
      },
    },
  }

  const items: SetupItem[] = needs.map((need) => {
    const entry = catalog[need][tier]
    const name = pick(entry.names, r)
    const priceRaw = entry.min + (entry.max - entry.min) * (0.35 + r() * 0.65)
    const price = Math.round(priceRaw / 5) * 5
    const category =
      need === 'bed'
        ? params.t('demo.steps.3.furnitureCategories.bed')
        : need === 'desk'
          ? params.t('demo.visual.productCategories.studyZone')
          : need === 'lamp'
            ? params.t('demo.steps.3.furnitureCategories.lamp')
            : params.t('demo.visual.productCategories.visualOrder')
    const note = analysis ? analysisReason(need) : entry.notes ? pick(entry.notes, r) : undefined
    return { key: need, name, category, price, note }
  })

  const total = items.reduce((acc, it) => acc + it.price, 0)
  const status: GeneratedSetup['status'] = total <= budget ? 'within' : 'over'

  const summary = analysis
    ? `${analysis.summary} ${status === 'within'
        ? `${params.t('demo.steps.3.optimizedFor')} ${tone.vibe}. ${params.t('demo.steps.3.roomForUpgrades')}.`
        : `${params.t('demo.steps.3.greatPicks')} ${tone.vibe} ${params.t('demo.steps.3.butOverBudget')}. ${params.t('demo.steps.3.tryRemovingNeed')}.`
      }`
    : status === 'within'
      ? `${params.t('demo.steps.3.optimizedFor')} ${tone.vibe}. ${params.t('demo.steps.3.roomForUpgrades')}.`
      : `${params.t('demo.steps.3.greatPicks')} ${tone.vibe} ${params.t('demo.steps.3.butOverBudget')}. ${params.t('demo.steps.3.tryRemovingNeed')}.`

  return {
    budget,
    style,
    needs,
    items,
    total,
    status,
    summary,
  }
}

function LandingPage() {
  const { t, i18n } = useTranslation()
  const [configPanelStep, setConfigPanelStep] = useState<ConfigPanelStep>('space')
  const [roomType, setRoomType] = useState<RoomTypeKey>('bedroom')
  const [budget, setBudget] = useState<number>(650)
  const [style, setStyle] = useState<StyleKey>('modern')
  const [roomSize, setRoomSize] = useState<RoomSizeKey>('medium')
  const [colorPalette, setColorPalette] = useState<ColorPaletteKey>('neutral')
  const [needs, setNeeds] = useState<Record<NeedKey, boolean>>({
    bed: true,
    desk: true,
    lamp: true,
    storage: false,
  })
  const [moods, setMoods] = useState<MoodKey[]>(['relaxing'])
  const [areTestimonialsExpanded, setAreTestimonialsExpanded] = useState(false)

  const selectedNeeds = useMemo(
    () => (Object.keys(needs) as NeedKey[]).filter((k) => needs[k]),
    [needs],
  )

  const [analysis, setAnalysis] = useState<RoomAnalysisResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [setup, setSetup] = useState<GeneratedSetup | null>(null)

  const canContinueToNeeds = useMemo(() => budget >= 150 && budget <= 12000, [budget])
  const canGenerate = useMemo(() => selectedNeeds.length > 0, [selectedNeeds.length])
  const exampleItems = useMemo(
    () => t('examples.items', { returnObjects: true }) as ExampleItem[],
    [t],
  )
  const whyFeatures = useMemo(
    () => t('why.features', { returnObjects: true }) as FeatureItem[],
    [t],
  )
  const workflowSteps = useMemo(
    () => t('howItWorks.steps', { returnObjects: true }) as StepItem[],
    [t],
  )
  const pricingPlans = useMemo(
    () => t('pricing.plans', { returnObjects: true }) as PricingPlan[],
    [t],
  )
  const exploreCards = useMemo(
    () => t('explore.cards', { returnObjects: true }) as ExploreCard[],
    [t],
  )
  const trustBadges = useMemo(
    () => t('trust.badges', { returnObjects: true }) as string[],
    [t],
  )
  const trustLogos = useMemo(
    () => t('trust.logos', { returnObjects: true }) as string[],
    [t],
  )
  const testimonialItems = useMemo(
    () => t('testimonials', { returnObjects: true }) as TestimonialItem[],
    [t],
  )
  const visibleTestimonials = areTestimonialsExpanded
    ? testimonialItems
    : testimonialItems.slice(0, 3)
  const exploreIcons = {
    demo: Sparkles,
    experience: Clapperboard,
    beta: BadgeEuro,
    updates: Boxes,
  } satisfies Record<ExploreCard['kind'], typeof Sparkles>
  const configSummaries = useMemo(
    () => ({
      space: `${t(`demo.steps.1.roomTypes.${roomType}`)} / ${t(`demo.steps.1.roomSizeDimensions.${roomSize}`)}`,
      style: `${t(`demo.steps.1.styles.${style}`)} / ${t(`demo.steps.1.colorPalettes.${colorPalette}`)}`,
      budget: eur(budget, i18n.language),
    }),
    [budget, colorPalette, i18n.language, roomSize, roomType, style, t],
  )
  const configSteps = useMemo(
    () =>
      [
        {
          key: 'space',
          index: '01',
          label: t('demo.config.space'),
          summary: configSummaries.space,
          isComplete: true,
        },
        {
          key: 'style',
          index: '02',
          label: t('demo.config.style'),
          summary: configSummaries.style,
          isComplete: moods.length > 0,
        },
        {
          key: 'budget',
          index: '03',
          label: t('demo.config.budget'),
          summary: configSummaries.budget,
          isComplete: canContinueToNeeds && canGenerate,
        },
      ] satisfies Array<{
        key: ConfigPanelStep
        index: string
        label: string
        summary: string
        isComplete: boolean
      }>,
    [canContinueToNeeds, canGenerate, configSummaries, moods.length, t],
  )
  const activeConfigIndex = Math.max(
    0,
    configSteps.findIndex((step) => step.key === configPanelStep),
  )

  async function onGenerate() {
    setIsGenerating(true)
    setSetup(null)
    await new Promise((r) => setTimeout(r, 850))
    const result = generateSetup({
      budget,
      style,
      needs: selectedNeeds,
      roomType,
      roomSize,
      colorPalette,
      moods,
      t,
      analysis,
    })
    setSetup(result)
    setIsGenerating(false)
    setConfigPanelStep('budget')
  }

  return (
    <div className="nr-page">
      <header className="nr-header">
        <div className="nr-brand" aria-label="NEXROOM home">
          <span className="nr-mark" aria-hidden="true">
            N
          </span>
          <span className="nr-name">NEXROOM</span>
        </div>

        <nav className="nr-nav" aria-label="Primary">
          <a className="nr-navLink" href="#demo">
            {t('nav.demo')}
          </a>
          <a className="nr-navLink" href="#how-it-works">
            {t('nav.howItWorks')}
          </a>
          <a className="nr-navLink" href="/experience">
            {t('nav.experience')}
          </a>
          <a className="nr-navLink" href="#pricing">
            {t('nav.pricing')}
          </a>
        </nav>

        <LanguageSwitcher />
      </header>

      <main>
<motion.section
        className="nr-hero"
        aria-labelledby="hero-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="nr-heroGrid">
          <motion.div
            className="nr-heroCopy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="nr-eyebrow">{t('hero.eyebrow')}</p>
            <h1 id="hero-title">{t('hero.title')}</h1>
            <p className="nr-subtitle">
              {t('hero.subtitle')}
            </p>

            <div className="nr-ctaRow">
              <motion.a
                className="nr-primaryBtn"
                href="#demo"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('hero.cta')}
              </motion.a>
              <p className="nr-ctaHint">{t('hero.ctaHint')}</p>
            </div>
          </motion.div>

          <HeroShowcase />
        </div>
      </motion.section>

        <section className="nr-trust" aria-labelledby="trust-title">
          <div className="nr-trustTop">
            <div>
              <h2 id="trust-title" className="nr-h2Small">
                {t('trust.title', { count: 1000 })}
              </h2>
              <p className="nr-sectionSub">
                {t('trust.subtitle')}
              </p>
            </div>
            <div className="nr-badges" aria-label="Trust signals">
              {trustBadges.map((badge) => (
                <span key={badge} className="nr-badge">{badge}</span>
              ))}
            </div>
          </div>

          <div className="nr-logoRow" aria-label="Use cases">
            {trustLogos.map(
              (name) => (
                <motion.div
                  key={name}
                  className="nr-logoPill"
                  aria-hidden="true"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {name}
                </motion.div>
              ),
            )}
          </div>

          <div className="nr-testimonialGrid" aria-label="Preview notes">
            {visibleTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="nr-testimonialCard"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="nr-stars" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <p className="nr-quote">"{testimonial.quote}"</p>
                <div className="nr-person">
                  <div className="nr-avatar" aria-hidden="true" />
                  <div>
                    <div className="nr-personName">{testimonial.name}</div>
                    <div className="nr-personRole">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {testimonialItems.length > 3 && (
            <div className="nr-testimonialActions">
              <button
                type="button"
                className="nr-secondaryBtn nr-testimonialToggle"
                onClick={() => setAreTestimonialsExpanded((value) => !value)}
                aria-expanded={areTestimonialsExpanded}
              >
                {areTestimonialsExpanded ? t('trust.showLessNotes') : t('trust.showMoreNotes')}
              </button>
            </div>
          )}
        </section>

        <section className="nr-explore" aria-labelledby="explore-title">
          <div className="nr-sectionHead">
            <h2 id="explore-title">{t('explore.title')}</h2>
            <p className="nr-sectionSub">{t('explore.subtitle')}</p>
          </div>

          <div className="nr-exploreGrid">
            {exploreCards.map((card, index) => {
              const Icon = exploreIcons[card.kind]

              return (
                <motion.a
                  key={card.title}
                  className={`nr-exploreCard nr-exploreCard--${card.kind}`}
                  href={card.href}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.24 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  whileHover={{ y: -4 }}
                >
                  <span className="nr-exploreIcon" aria-hidden="true">
                    <Icon size={18} strokeWidth={2.1} />
                  </span>
                  <span className="nr-exploreTitle">{card.title}</span>
                  <span className="nr-exploreBody">{card.body}</span>
                  <span className="nr-exploreCta">{card.cta}</span>
                </motion.a>
              )
            })}
          </div>
        </section>

        <section className="nr-demo" id="demo" aria-labelledby="demo-title">
          <div className="nr-demoHead">
            <div>
              <h2 id="demo-title">{t('demo.title')}</h2>
              <p className="nr-sectionSub">
                {t('demo.subtitle')}
              </p>
            </div>
            <div className="nr-demoBadge" aria-hidden="true">
              {t('demo.badge')}
            </div>
          </div>

          <div className="nr-demoShell">
            <div className="nr-stepper" role="tablist" aria-label="Demo configuration steps">
              {configSteps.map((step, index) => (
                <button
                  key={step.key}
                  type="button"
                  className={`nr-stepPill ${configPanelStep === step.key ? 'is-active' : ''} ${
                    index < activeConfigIndex ? 'is-done' : ''
                  }`}
                  onClick={() => setConfigPanelStep(step.key)}
                  aria-selected={configPanelStep === step.key}
                  role="tab"
                >
                  <span className="nr-stepIdx">{step.index}</span>
                  <span className="nr-stepLabel">{step.label}</span>
                </button>
              ))}
              <div
                className="nr-stepBar"
                aria-hidden="true"
                style={{
                  width: `${((activeConfigIndex + 1) / configSteps.length) * 100}%`,
                }}
              />
            </div>

            <div className="nr-demoGrid">
              <div className="nr-demoCard nr-demoForm" aria-label="Demo inputs">
                <motion.div
                  className="nr-stepPanel nr-stepPanel--compactConfig"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                    <div className="nr-configAccordion">
                      <div className={`nr-configSection ${configPanelStep === 'space' ? 'is-open' : ''}`}>
                        <button
                          type="button"
                          className="nr-configHeader"
                          onClick={() => setConfigPanelStep('space')}
                          aria-expanded={configPanelStep === 'space'}
                        >
                          <span className="nr-configIndex">01</span>
                          <span>
                            <strong>{t('demo.config.space')}</strong>
                            <small>{configSummaries.space}</small>
                          </span>
                          <em>{t('demo.config.completed')}</em>
                        </button>

                        {configPanelStep === 'space' && (
                          <div className="nr-configBody">
                            <RoomAnalyzer
                              style={style}
                              roomType={roomType}
                              roomSize={roomSize}
                              budget={budget}
                              selectedNeeds={selectedNeeds}
                              onAnalysisChange={setAnalysis}
                            />

                            <div className="nr-formRow">
                              <div className="nr-label">{t('demo.steps.1.roomType')}</div>
                              <RoomTypeSelector
                                selectedRoom={roomType}
                                onRoomChange={(room) => setRoomType(room as RoomTypeKey)}
                              />
                            </div>

                            <div className="nr-formRow">
                              <div className="nr-label">{t('demo.steps.1.roomSize')}</div>
                              <RoomSizeSelector
                                selectedSize={roomSize}
                                onSizeChange={(size) => setRoomSize(size as RoomSizeKey)}
                              />
                            </div>

                            <div className="nr-panelActions">
                              <button
                                type="button"
                                className="nr-nextBtn"
                                onClick={() => setConfigPanelStep('style')}
                              >
                                {t('demo.config.continue')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={`nr-configSection ${configPanelStep === 'style' ? 'is-open' : ''}`}>
                        <button
                          type="button"
                          className="nr-configHeader"
                          onClick={() => setConfigPanelStep('style')}
                          aria-expanded={configPanelStep === 'style'}
                        >
                          <span className="nr-configIndex">02</span>
                          <span>
                            <strong>{t('demo.config.style')}</strong>
                            <small>{configSummaries.style}</small>
                          </span>
                          <em>{moods.length ? t('demo.config.completed') : t('demo.config.edit')}</em>
                        </button>

                        {configPanelStep === 'style' && (
                          <div className="nr-configBody">
                            <div className="nr-formRow">
                              <div className="nr-label">{t('demo.steps.1.styleLabel')}</div>
                              <StyleSelector
                                selectedStyle={style}
                                onStyleChange={(newStyle) => setStyle(newStyle as StyleKey)}
                              />
                            </div>

                            <div className="nr-formRow">
                              <div className="nr-label">{t('demo.steps.1.colorPalette')}</div>
                              <ColorPaletteSelector
                                selectedPalette={colorPalette}
                                onPaletteChange={(palette) => setColorPalette(palette as ColorPaletteKey)}
                              />
                            </div>

                            <div className="nr-formRow">
                              <div className="nr-label">{t('demo.steps.2.moodLabel')}</div>
                              <MoodSelector
                                selectedMoods={moods}
                                onMoodsChange={(newMoods) => setMoods(newMoods as MoodKey[])}
                              />
                            </div>

                            <div className="nr-panelActions">
                              <button
                                type="button"
                                className="nr-secondaryBtn"
                                onClick={() => setConfigPanelStep('space')}
                              >
                                {t('demo.config.back')}
                              </button>
                              <button
                                type="button"
                                className="nr-nextBtn"
                                onClick={() => setConfigPanelStep('budget')}
                              >
                                {t('demo.config.continue')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={`nr-configSection ${configPanelStep === 'budget' ? 'is-open' : ''}`}>
                        <button
                          type="button"
                          className="nr-configHeader"
                          onClick={() => setConfigPanelStep('budget')}
                          aria-expanded={configPanelStep === 'budget'}
                        >
                          <span className="nr-configIndex">03</span>
                          <span>
                            <strong>{t('demo.config.budget')}</strong>
                            <small>{configSummaries.budget}</small>
                          </span>
                          <em>{canContinueToNeeds && canGenerate ? t('demo.config.completed') : t('demo.config.edit')}</em>
                        </button>

                        {configPanelStep === 'budget' && (
                          <div className="nr-configBody">
                            <div className="nr-formRow">
                              <label className="nr-label" htmlFor="nr-budget-compact">
                                {t('demo.steps.1.budgetLabel')}
                              </label>
                              <div className="nr-inputWrap">
                                <span className="nr-inputPrefix" aria-hidden="true">
                                  €
                                </span>
                                <input
                                  id="nr-budget-compact"
                                  className="nr-input"
                                  type="number"
                                  inputMode="numeric"
                                  min={150}
                                  max={12000}
                                  step={50}
                                  value={budget}
                                  onChange={(e) => setBudget(Number(e.target.value || 0))}
                                  aria-describedby="nr-budget-help-compact"
                                />
                              </div>
                              <div className="nr-help" id="nr-budget-help-compact">
                                {t('demo.steps.1.budgetHelp')}
                              </div>
                            </div>

                            <div className="nr-formRow">
                              <div className="nr-label">{t('demo.steps.2.needsLabel')}</div>
                              <div className="nr-needGrid" role="group" aria-label={t('demo.steps.2.needsLabel')}>
                                {(
                                  [
                                    ['bed', t('demo.steps.3.furnitureCategories.bed')],
                                    ['desk', t('demo.steps.3.furnitureCategories.desk')],
                                    ['lamp', t('demo.steps.3.furnitureCategories.lamp')],
                                    ['storage', t('demo.steps.3.furnitureCategories.storage')],
                                  ] as const
                                ).map(([key, label]) => (
                                  <label key={key} className="nr-need">
                                    <input
                                      type="checkbox"
                                      checked={needs[key]}
                                      onChange={(e) =>
                                        setNeeds((prev) => ({
                                          ...prev,
                                          [key]: e.target.checked,
                                        }))
                                      }
                                    />
                                    <span>{label}</span>
                                  </label>
                                ))}
                              </div>
                              <div className="nr-help">
                                {t('demo.steps.2.needsHelp')}
                              </div>
                            </div>

                            <div className="nr-panelActions">
                              <button
                                type="button"
                                className="nr-secondaryBtn"
                                onClick={() => {
                                  setRoomType('bedroom')
                                  setBudget(650)
                                  setStyle('modern')
                                  setRoomSize('medium')
                                  setColorPalette('neutral')
                                }}
                              >
                                {t('demo.steps.1.recommended')}
                              </button>
                              <button
                                type="button"
                                className="nr-nextBtn"
                                onClick={onGenerate}
                                disabled={isGenerating || !canContinueToNeeds || !canGenerate}
                              >
                                {isGenerating ? t('demo.steps.2.generating') : t('demo.config.generateFullRoom')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </motion.div>
              </div>

              <div className="nr-demoCard nr-demoResults" aria-label="Generated setup">
                <div className={`nr-resultsInner ${setup ? 'is-ready' : ''}`}>
                  <AIDemoPreview
                    budget={budget}
                    total={setup?.total}
                    status={setup?.status}
                    roomLabel={t(`demo.steps.1.roomTypes.${roomType}`)}
                    styleLabel={t(`demo.steps.1.styles.${style}`)}
                    lightingLabel={analysis?.lightingQuality}
                    analysisReady={Boolean(analysis)}
                    isGenerating={isGenerating}
                    canGenerate={canGenerate}
                    items={setup?.items}
                    onGenerate={onGenerate}
                    isReady={Boolean(setup)}
                  />

                  {analysis && (
                    <div className="nr-analysisBanner">
                      <div className="nr-analysisMeta">
                        <div className="nr-summaryTitle">{t('demo.analysis.resultTitle')}</div>
                        <p className="nr-analysisText">{analysis.summary}</p>
                      </div>
                      <div className="nr-analysisMetrics">
                        <span>{t('demo.analysis.detectedRoom')}: {analysis.detectedRoom}</span>
                        <span>{t('demo.analysis.lighting')}: {analysis.lightingQuality}</span>
                        <span>{t('demo.analysis.budgetFit')}: {analysis.budgetFit}</span>
                      </div>
                    </div>
                  )}
                  {!setup && (
                    <div className={`nr-skeleton ${isGenerating ? 'is-on' : ''}`}>
                      <div className="nr-skelTitle" />
                      <div className="nr-skelRow" />
                      <div className="nr-skelRow" />
                      <div className="nr-skelRow" />
                      <div className="nr-skelTotal" />
                      <div className="nr-skelRow" />
                    </div>
                  )}

                  {setup && (
                    <>
                      <div className="nr-resultsTop">
                        <div>
                          <div className="nr-resultsKicker">{t('demo.steps.3.generatedSetup')}</div>
                          <div className="nr-resultsTitle">
                            {t('demo.steps.3.resultHeading', {
                              style: styleTone(setup.style as StyleKey, t).adjective,
                              room: t(`demo.steps.1.roomTypes.${roomType}`),
                            })}
                          </div>
                        </div>

                        <div
                          className={`nr-status ${
                            setup.status === 'within' ? 'ok' : 'bad'
                          }`}
                        >
                          {setup.status === 'within'
                            ? t('demo.steps.3.withinBudget')
                            : t('demo.steps.3.overBudget')}
                        </div>
                      </div>

                      <p className="nr-resultsSummary">{setup.summary}</p>

                      {analysis && (
                        <div className="nr-suggestionSection">
                          <div className="nr-sectionHead">
                            <div className="nr-summaryTitle">{t('demo.analysis.recommendations')}</div>
                          </div>
                          <div className="nr-suggestionGrid">
                            {analysis.recommendations.map((suggestion) => (
                              <div key={suggestion.title} className="nr-suggestionCard">
                                <div className="nr-suggestionHead">
                                  <div className={`nr-suggestionPreview nr-suggestionPreview--${suggestion.imageType}`} aria-hidden="true" />
                                  <div>
                                    <div className="nr-resultBadge">{t(`demo.analysis.status.${suggestion.status}`)}</div>
                                    <strong>{suggestion.title}</strong>
                                  </div>
                                </div>
                                <p className="nr-suggestionReason">{suggestion.reason}</p>
                                <div className="nr-suggestionMeta">
                                  <span>{t('demo.analysis.match', { percent: suggestion.match })}</span>
                                  <span>{t('demo.analysis.priceLabel')}: {eur(suggestion.price, i18n.language)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="nr-productGrid">
                        {setup.items.map((it) => (
                          <div key={it.key} className="nr-productCard">
                            <div className="nr-productImg" aria-hidden="true">
                              <div className="nr-productGlyph" />
                            </div>
                            <div className="nr-productBody">
                              <div className="nr-catRow">
                                <span className="nr-catPill">{it.category}</span>
                                <span
                                  className={`nr-miniStatus ${
                                    setup.status === 'within' ? 'ok' : 'bad'
                                  }`}
                                >
                                  {setup.status === 'within'
                                    ? t('demo.steps.3.withinBudget')
                                    : t('demo.steps.3.overBudget')}
                                </span>
                              </div>
                              <div className="nr-itemName">{it.name}</div>
                              {it.note && (
                                <div className="nr-itemNote">{it.note}</div>
                              )}
                            </div>
                            <div className="nr-itemPrice">{t('demo.visual.fromPrice', { price: eur(it.price, i18n.language) })}</div>
                          </div>
                        ))}

                        <div className="nr-summaryCard">
                          <div className="nr-summaryTop">
                            <div className="nr-summaryTitle">{t('demo.steps.3.budgetSummary')}</div>
                            <div
                              className={`nr-status ${
                                setup.status === 'within' ? 'ok' : 'bad'
                              }`}
                            >
                              {setup.status === 'within'
                                ? t('demo.steps.3.withinBudget')
                                : t('demo.steps.3.overBudget')}
                            </div>
                          </div>

                          <div className="nr-totals">
                            <div className="nr-totalRow">
                              <span>{t('demo.steps.3.budgetLabel')}</span>
                              <strong>{eur(setup.budget, i18n.language)}</strong>
                            </div>
                            <div className="nr-totalRow">
                              <span>{t('demo.steps.3.totalSpent')}</span>
                              <strong>{eur(setup.total, i18n.language)}</strong>
                            </div>

                            <div className="nr-meter" aria-hidden="true">
                              <div className="nr-meterTrack">
                                <div
                                  className={`nr-meterFill ${
                                    setup.status === 'within' ? 'ok' : 'bad'
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round((setup.total / setup.budget) * 100),
                                    )}%`,
                                  }}
                                />
                              </div>
                              <div className="nr-meterMeta">
                                <span>
                                  {Math.round((setup.total / setup.budget) * 100)}%
                                </span>
                                <span>
                                  {setup.total <= setup.budget
                                    ? t('demo.steps.3.remainingAmount', { amount: eur(setup.budget - setup.total, i18n.language) })
                                    : t('demo.steps.3.overAmount', { amount: eur(setup.total - setup.budget, i18n.language) })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <UpdatesSection />

        <section className="nr-examples" aria-labelledby="examples-title">
          <div className="nr-sectionHead">
            <h2 id="examples-title">{t('examples.title')}</h2>
            <p className="nr-sectionSub">
              {t('examples.subtitle')}
            </p>
          </div>

          <div className="nr-exampleGrid">
            {exampleItems.map((item, index) => (
              <motion.div
                key={item.title}
                className="nr-exampleCard"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <ImagePlaceholder
                  type={item.style}
                  className="nr-exampleImg"
                />
                <div className="nr-exampleBody">
                  <div className="nr-exampleTitle">{item.title}</div>
                  <div className="nr-exampleMeta">{item.meta}</div>
                  <p className="nr-exampleText">{item.body}</p>
                  <motion.a
                    className="nr-textLink"
                    href="#demo"
                    whileHover={{ x: 5 }}
                  >
                    {t('examples.tryInDemo')}
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="nr-why" aria-labelledby="why-title">
          <div className="nr-sectionHead">
            <h2 id="why-title">{t('why.title')}</h2>
            <p className="nr-sectionSub">
              {t('why.subtitle')}
            </p>
          </div>

          <div className="nr-whyGrid">
            {whyFeatures.map((f) => (
              <div key={f.title} className="nr-whyCard">
                <div className="nr-whyTitle">{f.title}</div>
                <p className="nr-whyBody">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <AboutSection />

        <section
          className="nr-steps"
          id="how-it-works"
          aria-labelledby="how-title"
        >
          <div className="nr-sectionHead">
            <h2 id="how-title">{t('howItWorks.title')}</h2>
            <p className="nr-sectionSub">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <ol className="nr-stepGrid">
            {workflowSteps.map((step, index) => (
              <li key={step.title} className="nr-stepCard">
                <div className="nr-stepNum">0{index + 1}</div>
                <h3 className="nr-stepTitle">{step.title}</h3>
                <p className="nr-stepBody">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="nr-pricing" id="pricing" aria-labelledby="pricing-title">
          <div className="nr-sectionHead">
            <h2 id="pricing-title">{t('pricing.title')}</h2>
            <p className="nr-sectionSub">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="nr-priceGrid">
            {pricingPlans.map((plan, index) => (
              <div key={plan.name} className={`nr-priceCard ${index === 1 ? 'is-featured' : ''}`}>
                <div className="nr-priceTop">
                  <div className="nr-priceName">{plan.name}</div>
                  <div className="nr-priceValue">
                    {Number(plan.price) === 0 ? eur(0, i18n.language) : eur(Number(plan.price), i18n.language)}
                    {plan.unit && <span className="nr-priceUnit">{plan.unit}</span>}
                  </div>
                </div>
                <ul className="nr-bullets">
                  {plan.features.map((feature: string) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                {index === 1 ? (
                  <button
                    type="button"
                    className="nr-genBtn nr-priceBtn"
                    onClick={() => {
                      setConfigPanelStep('space')
                      const el = document.getElementById('demo')
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <a className="nr-genBtn nr-priceBtn" href="#demo">
                    {plan.cta}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="nr-footer">
        <p>© {new Date().getFullYear()} NEXROOM</p>
      </footer>
    </div>
  )
}

function App() {
  const routePath =
    typeof window === 'undefined' ? '/' : window.location.pathname.replace(/\/+$/, '') || '/'

  if (routePath === '/experience') {
    return <ExperiencePage />
  }

  return <LandingPage />
}

export default App
