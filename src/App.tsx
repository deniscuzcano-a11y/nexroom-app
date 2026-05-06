import './App.css'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { ImagePlaceholder } from './components/ImagePlaceholder'
import { StyleSelector } from './components/StyleSelector'
import { RoomTypeSelector } from './components/RoomTypeSelector'
import { ColorPaletteSelector } from './components/ColorPaletteSelector'
import { MoodSelector } from './components/MoodSelector'
import { RoomSizeSelector } from './components/RoomSizeSelector'

type StyleKey = 'modern' | 'scandinavian' | 'japandi' | 'minimalist' | 'luxury' | 'cozy'
type NeedKey = 'bed' | 'desk' | 'lamp' | 'storage'
type RoomTypeKey = 'bedroom' | 'livingroom' | 'gaming' | 'office' | 'studio'
type RoomSizeKey = 'small' | 'medium' | 'large' | 'xl'
type ColorPaletteKey = 'neutral' | 'warm' | 'cool' | 'bold'
type MoodKey = 'productive' | 'relaxing' | 'social' | 'creative' | 'minimal'
type DemoStep = 1 | 2 | 3

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

function eur(value: number) {
  return new Intl.NumberFormat('de-DE', {
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
  if (budget < 650) return 'low' as const
  if (budget < 1500) return 'mid' as const
  return 'high' as const
}

function styleTone(style: StyleKey) {
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
  t: (key: string) => string
}): GeneratedSetup {
  const budget = clamp(Math.round(params.budget || 0), 150, 12000)
  const style = params.style
  const needs = params.needs.length ? params.needs : (['bed', 'lamp'] as NeedKey[])
  const roomType = params.roomType
  const roomSize = params.roomSize
  const colorPalette = params.colorPalette
  const moods = params.moods

  const tier = tierForBudget(budget)
  const tone = styleTone(style)

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
          `${tone.adjective} platform bed`,
          `${tone.adjective} slatted frame bed`,
          `${tone.adjective} compact bed frame`,
        ],
        min: 220,
        max: 420,
        notes: ['Simple frame, great value', 'Sturdy basics included'],
      },
      mid: {
        names: [
          `${tone.adjective} upholstered bed`,
          `${tone.adjective} oak-look bed frame`,
          `${tone.adjective} storage bed base`,
        ],
        min: 520,
        max: 900,
        notes: ['Better materials, nicer finish', 'Comfort-focused design'],
      },
      high: {
        names: [
          `${tone.adjective} premium bed with headboard`,
          `${tone.adjective} solid-wood statement bed`,
          `${tone.adjective} hotel-style bed frame`,
        ],
        min: 980,
        max: 1600,
        notes: ['Premium build & details', 'Designed for long-term comfort'],
      },
    },
    desk: {
      low: {
        names: [
          `${tone.adjective} writing desk`,
          `${tone.adjective} compact workstation`,
          `${tone.adjective} foldable desk`,
        ],
        min: 80,
        max: 160,
        notes: ['Space-saving footprint', 'Clean, functional setup'],
      },
      mid: {
        names: [
          `${tone.adjective} desk with cable management`,
          `${tone.adjective} standing-ready desk`,
          `${tone.adjective} desk + drawer unit`,
        ],
        min: 220,
        max: 420,
        notes: ['Better ergonomics', 'Keeps things tidy'],
      },
      high: {
        names: [
          `${tone.adjective} premium desk (solid top)`,
          `${tone.adjective} designer workstation`,
          `${tone.adjective} executive desk`,
        ],
        min: 520,
        max: 990,
        notes: ['Premium finish', 'Built to last'],
      },
    },
    lamp: {
      low: {
        names: [
          `${tone.adjective} bedside lamp`,
          `${tone.adjective} task lamp`,
          `${tone.adjective} dimmable table lamp`,
        ],
        min: 25,
        max: 60,
        notes: ['Warm light recommended', 'Great value lighting'],
      },
      mid: {
        names: [
          `${tone.adjective} dimmable LED lamp`,
          `${tone.adjective} ambient bedside lamp`,
          `${tone.adjective} glare-free reading lamp`,
        ],
        min: 70,
        max: 140,
        notes: ['Better light quality', 'More premium look'],
      },
      high: {
        names: [
          `${tone.adjective} smart lamp (scene presets)`,
          `${tone.adjective} premium ambient lamp`,
          `${tone.adjective} designer lamp`,
        ],
        min: 160,
        max: 320,
        notes: ['Scene presets for evenings', 'Statement lighting piece'],
      },
    },
    storage: {
      low: {
        names: [
          `${tone.adjective} open shelving`,
          `${tone.adjective} under-bed boxes`,
          `${tone.adjective} simple wardrobe rail`,
        ],
        min: 60,
        max: 140,
        notes: ['Budget-friendly organization', 'Quick to set up'],
      },
      mid: {
        names: [
          `${tone.adjective} dresser (3–4 drawers)`,
          `${tone.adjective} wardrobe with shelves`,
          `${tone.adjective} closed storage cabinet`,
        ],
        min: 220,
        max: 520,
        notes: ['Cleaner look', 'More capacity'],
      },
      high: {
        names: [
          `${tone.adjective} premium wardrobe system`,
          `${tone.adjective} large dresser + organizer`,
          `${tone.adjective} built-in style storage`,
        ],
        min: 620,
        max: 1250,
        notes: ['Premium capacity & finish', 'Looks built-in'],
      },
    },
  }

  const items: SetupItem[] = needs.map((need) => {
    const entry = catalog[need][tier]
    const name = pick(entry.names, r)
    const priceRaw = entry.min + (entry.max - entry.min) * (0.35 + r() * 0.65)
    const price = Math.round(priceRaw / 5) * 5
    const note = entry.notes ? pick(entry.notes, r) : undefined
    const category =
      need === 'bed'
        ? params.t('demo.steps.3.furnitureCategories.bed')
        : need === 'desk'
          ? params.t('demo.steps.3.furnitureCategories.desk')
          : need === 'lamp'
            ? params.t('demo.steps.3.furnitureCategories.lamp')
            : params.t('demo.steps.3.furnitureCategories.storage')
    return { key: need, name, category, price, note }
  })

  const total = items.reduce((acc, it) => acc + it.price, 0)
  const status: GeneratedSetup['status'] = total <= budget ? 'within' : 'over'

  const summary =
    status === 'within'
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

function App() {
  const { t } = useTranslation()
  const [demoStep, setDemoStep] = useState<DemoStep>(1)
  const [roomType, setRoomType] = useState<RoomTypeKey>('bedroom')
  const [budget, setBudget] = useState<number>(1200)
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

  const selectedNeeds = useMemo(
    () => (Object.keys(needs) as NeedKey[]).filter((k) => needs[k]),
    [needs],
  )

  const [isGenerating, setIsGenerating] = useState(false)
  const [setup, setSetup] = useState<GeneratedSetup | null>(null)

  const canContinueToNeeds = useMemo(() => budget >= 150 && budget <= 12000, [budget])
  const canGenerate = useMemo(() => selectedNeeds.length > 0, [selectedNeeds.length])

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
    })
    setSetup(result)
    setIsGenerating(false)
    setDemoStep(3)
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
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="nr-eyebrow">{t('hero.eyebrow')}</p>
            <h1 id="hero-title">{t('hero.title')}</h1>
            <p className="nr-subtitle">
              {t('hero.subtitle')}
            </p>

            <div className="nr-ctaRow" id="demo">
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

          <motion.div
            className="nr-heroVisual"
            aria-hidden="true"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="nr-glow nr-glowA" />
            <div className="nr-glow nr-glowB" />

            <motion.div
              className="nr-mockCard"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="nr-mockTop">
                <div className="nr-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="nr-pill">Bedroom • Scandinavian • €1200</div>
              </div>

              <div className="nr-mockBody">
                <div className="nr-mockGrid">
                  <div className="nr-swatch nr-swatch1" />
                  <div className="nr-swatch nr-swatch2" />
                  <div className="nr-swatch nr-swatch3" />
                  <div className="nr-swatch nr-swatch4" />
                </div>

                <div className="nr-mockLines">
                  <div className="nr-line nr-line1" />
                  <div className="nr-line nr-line2" />
                  <div className="nr-line nr-line3" />
                </div>

                <div className="nr-mockFooter">
                  <div className="nr-miniKpi">
                    <div className="nr-miniLabel">Budget</div>
                    <div className="nr-miniValue">€1,200</div>
                  </div>
                  <div className="nr-miniKpi">
                    <div className="nr-miniLabel">Est.</div>
                    <div className="nr-miniValue">€1,148</div>
                  </div>
                  <div className="nr-miniKpi">
                    <div className="nr-miniLabel">Match</div>
                    <div className="nr-miniValue">92%</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

        <section className="nr-trust" aria-labelledby="trust-title">
          <div className="nr-trustTop">
            <div>
              <h2 id="trust-title" className="nr-h2Small">
                {t('trust.title', { count: 1000 })}
              </h2>
              <p className="nr-sectionSub">
                Designers, students, and busy builders use NEXROOM to go from “ideas”
                to “done” faster.
              </p>
            </div>
            <div className="nr-badges" aria-label="Trust badges">
              <span className="nr-badge">Privacy‑first</span>
              <span className="nr-badge">Budget‑aware</span>
              <span className="nr-badge">Fast iterations</span>
            </div>
          </div>

          <div className="nr-logoRow" aria-label="Customer logos">
            {(['ArcHome', 'NordNest', 'StudioNine', 'Roomly', 'Craft & Co'] as const).map(
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

          <div className="nr-testimonialGrid" aria-label="Testimonials">
            {(
              [
                {
                  quote:
                    'I went from “blank room” to a cohesive setup in minutes. The budget bar is surprisingly accurate.',
                  name: 'Mina K.',
                  role: 'First apartment',
                },
                {
                  quote:
                    'The style consistency is the killer feature. Everything matches without me hunting through 20 tabs.',
                  name: 'Alex R.',
                  role: 'Remote worker',
                },
                {
                  quote:
                    'Perfect for quick iterations. Change one need, regenerate, done. Feels like a real product.',
                  name: 'Sam P.',
                  role: 'Indie builder',
                },
              ] as const
            ).map((t, index) => (
              <motion.div
                key={t.name}
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
                <p className="nr-quote">“{t.quote}”</p>
                <div className="nr-person">
                  <div className="nr-avatar" aria-hidden="true" />
                  <div>
                    <div className="nr-personName">{t.name}</div>
                    <div className="nr-personRole">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
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
            <div className="nr-stepper" role="tablist" aria-label="Demo steps">
              {(
                [
                  [1, t('demo.steps.1.title')],
                  [2, t('demo.steps.2.title')],
                  [3, t('demo.steps.3.title')],
                ] as const
              ).map(([idx, label]) => (
                <button
                  key={idx}
                  type="button"
                  className={`nr-stepPill ${demoStep === idx ? 'is-active' : ''} ${
                    demoStep > idx ? 'is-done' : ''
                  }`}
                  onClick={() => setDemoStep(idx)}
                  aria-selected={demoStep === idx}
                  role="tab"
                >
                  <span className="nr-stepIdx">{String(idx).padStart(2, '0')}</span>
                  <span className="nr-stepLabel">{label}</span>
                </button>
              ))}
              <div
                className="nr-stepBar"
                aria-hidden="true"
                style={{
                  width: `${(demoStep / 3) * 100}%`,
                }}
              />
            </div>

            <div className="nr-demoGrid">
              <div className="nr-demoCard nr-demoForm" aria-label="Demo inputs">
                {demoStep === 1 && (
                  <motion.div
                    className="nr-stepPanel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="nr-panelTitle">{t('demo.steps.1.title')}</div>

                    <div className="nr-formRow">
                      <div className="nr-label">{t('demo.steps.1.roomType')}</div>
                      <RoomTypeSelector
                        selectedRoom={roomType}
                        onRoomChange={(room) => setRoomType(room as RoomTypeKey)}
                      />
                    </div>

                    <div className="nr-formRow">
                      <div className="nr-label">{t('demo.steps.1.styleLabel')}</div>
                      <StyleSelector
                        selectedStyle={style}
                        onStyleChange={(newStyle) => setStyle(newStyle as StyleKey)}
                      />
                    </div>

                    <div className="nr-formRow">
                      <div className="nr-label">{t('demo.steps.1.roomSize')}</div>
                      <RoomSizeSelector
                        selectedSize={roomSize}
                        onSizeChange={(size) => setRoomSize(size as RoomSizeKey)}
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
                      <label className="nr-label" htmlFor="nr-budget">
                        {t('demo.steps.1.budgetLabel')}
                      </label>
                      <div className="nr-inputWrap">
                        <span className="nr-inputPrefix" aria-hidden="true">
                          €
                        </span>
                        <input
                          id="nr-budget"
                          className="nr-input"
                          type="number"
                          inputMode="numeric"
                          min={150}
                          max={12000}
                          step={50}
                          value={budget}
                          onChange={(e) => setBudget(Number(e.target.value || 0))}
                          aria-describedby="nr-budget-help"
                        />
                      </div>
                      <div className="nr-help" id="nr-budget-help">
                        {t('demo.steps.1.budgetHelp')}
                      </div>
                    </div>

                    <div className="nr-panelActions">
                      <button
                        type="button"
                        className="nr-secondaryBtn"
                        onClick={() => {
                          setRoomType('bedroom')
                          setBudget(1200)
                          setStyle('modern')
                          setRoomSize('medium')
                          setColorPalette('neutral')
                          setDemoStep(2)
                        }}
                      >
                        {t('demo.steps.1.recommended')}
                      </button>
                      <button
                        type="button"
                        className="nr-nextBtn"
                        onClick={() => setDemoStep(2)}
                        disabled={!canContinueToNeeds}
                      >
                        {t('demo.continue')}
                      </button>
                    </div>
                  </motion.div>
                )}

                {demoStep === 2 && (
                  <motion.div
                    className="nr-stepPanel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="nr-panelTitle">{t('demo.steps.2.title')}</div>

                    <div className="nr-formRow">
                      <div className="nr-label">{t('demo.steps.2.needsLabel')}</div>
                      <div className="nr-needGrid" role="group" aria-label="Needs">
                        {(
                          [
                            ['bed', 'Bed'],
                            ['desk', 'Desk'],
                            ['lamp', 'Lamp'],
                            ['storage', 'Storage'],
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

                    <div className="nr-formRow">
                      <div className="nr-label">{t('demo.steps.2.moodLabel')}</div>
                      <MoodSelector
                        selectedMoods={moods}
                        onMoodsChange={(newMoods) => setMoods(newMoods as MoodKey[])}
                      />
                    </div>

                    <button
                      type="button"
                      className="nr-genBtn"
                      onClick={onGenerate}
                      disabled={isGenerating || !canGenerate}
                    >
                      {isGenerating ? 'Generating…' : t('demo.steps.2.generate')}
                    </button>

                    <div className="nr-panelActions">
                      <button
                        type="button"
                        className="nr-secondaryBtn"
                        onClick={() => setDemoStep(1)}
                      >
                        {t('demo.back')}
                      </button>
                      <button
                        type="button"
                        className="nr-nextBtn"
                        onClick={() => setDemoStep(3)}
                        disabled={!setup}
                        title={!setup ? 'Generate a setup first' : undefined}
                      >
                        {t('demo.viewResults')}
                      </button>
                    </div>

                    <p className="nr-micro">
                      {t('demo.micro')}
                    </p>
                  </motion.div>
                )}

                {demoStep === 3 && (
                  <motion.div
                    className="nr-stepPanel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="nr-panelTitle">{t('demo.steps.3.title')}</div>
                    <p className="nr-help">
                      {t('demo.steps.3.help')}
                    </p>
                    <div className="nr-panelActions">
                      <button
                        type="button"
                        className="nr-secondaryBtn"
                        onClick={() => setDemoStep(2)}
                      >
                        {t('demo.back')}
                      </button>
                      <button
                        type="button"
                        className="nr-nextBtn"
                        onClick={onGenerate}
                        disabled={isGenerating}
                      >
                        {isGenerating ? t('demo.steps.3.refreshing') : t('demo.steps.3.regenerate')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="nr-demoCard nr-demoResults" aria-label="Generated setup">
                <div className={`nr-resultsInner ${setup ? 'is-ready' : ''}`}>
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
                          <div className="nr-resultsKicker">Generated setup</div>
                          <div className="nr-resultsTitle">
                            {styleTone(setup.style as StyleKey).adjective} bedroom
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
                            <div className="nr-itemPrice">{eur(it.price)}</div>
                          </div>
                        ))}

                        <div className="nr-summaryCard">
                          <div className="nr-summaryTop">
                            <div className="nr-summaryTitle">Total summary</div>
                            <div
                              className={`nr-status ${
                                setup.status === 'within' ? 'ok' : 'bad'
                              }`}
                            >
                              {setup.status === 'within'
                                ? 'Within budget'
                                : 'Over budget'}
                            </div>
                          </div>

                          <div className="nr-totals">
                            <div className="nr-totalRow">
                              <span>Budget</span>
                              <strong>{eur(setup.budget)}</strong>
                            </div>
                            <div className="nr-totalRow">
                              <span>Total</span>
                              <strong>{eur(setup.total)}</strong>
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
                                    ? `${eur(setup.budget - setup.total)} remaining`
                                    : `${eur(setup.total - setup.budget)} over`}
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

        <section className="nr-examples" aria-labelledby="examples-title">
          <div className="nr-sectionHead">
            <h2 id="examples-title">{t('examples.title')}</h2>
            <p className="nr-sectionSub">
              A few curated previews—so you know what “good” looks like.
            </p>
          </div>

          <div className="nr-exampleGrid">
            {(t('examples.items', { returnObjects: true }) as any[]).map((item: any, index: number) => (
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
                  type={item.style as any}
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
            {(t('why.features', { returnObjects: true }) as any[]).map((f: any) => (
              <div key={f.title} className="nr-whyCard">
                <div className="nr-whyTitle">{f.title}</div>
                <p className="nr-whyBody">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

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
            {(t('howItWorks.steps', { returnObjects: true }) as any[]).map((step: any, index: number) => (
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
            {(t('pricing.plans', { returnObjects: true }) as any[]).map((plan: any, index: number) => (
              <div key={plan.name} className={`nr-priceCard ${index === 1 ? 'is-featured' : ''}`}>
                <div className="nr-priceTop">
                  <div className="nr-priceName">{plan.name}</div>
                  <div className="nr-priceValue">
                    {plan.price === '0' ? eur(0) : eur(plan.price)}
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
                      setDemoStep(1)
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

export default App
