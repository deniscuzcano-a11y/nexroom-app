import './App.css'

import { useMemo, useState } from 'react'

type StyleKey = 'minimal' | 'modern' | 'cozy'
type NeedKey = 'bed' | 'desk' | 'lamp' | 'storage'
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
    case 'minimal':
      return { adjective: 'Minimal', vibe: 'clean lines, calm palette' }
    case 'modern':
      return { adjective: 'Modern', vibe: 'bold accents, sleek forms' }
    case 'cozy':
      return { adjective: 'Cozy', vibe: 'warm textures, soft light' }
  }
}

function generateSetup(params: {
  budget: number
  style: StyleKey
  needs: NeedKey[]
}): GeneratedSetup {
  const budget = clamp(Math.round(params.budget || 0), 150, 12000)
  const style = params.style
  const needs = params.needs.length ? params.needs : (['bed', 'lamp'] as NeedKey[])

  const tier = tierForBudget(budget)
  const tone = styleTone(style)

  const seed =
    budget * 31 +
    style.charCodeAt(0) * 997 +
    needs.reduce((acc, n) => acc + n.charCodeAt(0) * 101, 0)
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
        ? 'Bed'
        : need === 'desk'
          ? 'Desk'
          : need === 'lamp'
            ? 'Lamp'
            : 'Storage'
    return { key: need, name, category, price, note }
  })

  const total = items.reduce((acc, it) => acc + it.price, 0)
  const status: GeneratedSetup['status'] = total <= budget ? 'within' : 'over'

  const summary =
    status === 'within'
      ? `Optimized for ${tone.vibe}. This setup stays under budget with room for small upgrades.`
      : `Great ${tone.vibe} picks—but you're over budget. Try removing one need or lowering tier items.`

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
  const [demoStep, setDemoStep] = useState<DemoStep>(1)
  const [budget, setBudget] = useState<number>(1200)
  const [style, setStyle] = useState<StyleKey>('modern')
  const [needs, setNeeds] = useState<Record<NeedKey, boolean>>({
    bed: true,
    desk: true,
    lamp: true,
    storage: false,
  })

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
            Demo
          </a>
          <a className="nr-navLink" href="#how-it-works">
            How it works
          </a>
          <a className="nr-navLink" href="#pricing">
            Pricing
          </a>
        </nav>
      </header>

      <main>
        <section className="nr-hero" aria-labelledby="hero-title">
          <div className="nr-heroGrid">
            <div className="nr-heroCopy">
              <p className="nr-eyebrow">AI interior planning, simplified</p>
              <h1 id="hero-title">Design a bedroom you’ll love—instantly.</h1>
              <p className="nr-subtitle">
                Pick a budget, choose a style, and let NEXROOM generate a shoppable
                setup in seconds—optimized for your space and your wallet.
              </p>

              <div className="nr-ctaRow" id="demo">
                <a className="nr-primaryBtn" href="#demo">
                  Start free demo
                </a>
                <p className="nr-ctaHint">No signup. Takes ~60 seconds.</p>
              </div>
            </div>

            <div className="nr-heroVisual" aria-hidden="true">
              <div className="nr-glow nr-glowA" />
              <div className="nr-glow nr-glowB" />

              <div className="nr-mockCard">
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
              </div>
            </div>
          </div>
        </section>

        <section className="nr-trust" aria-labelledby="trust-title">
          <div className="nr-trustTop">
            <div>
              <h2 id="trust-title" className="nr-h2Small">
                Used by 1,000+ users
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
                <div key={name} className="nr-logoPill" aria-hidden="true">
                  {name}
                </div>
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
            ).map((t) => (
              <div key={t.name} className="nr-testimonialCard">
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
              </div>
            ))}
          </div>
        </section>

        <section className="nr-demo" id="demo" aria-labelledby="demo-title">
          <div className="nr-demoHead">
            <div>
              <h2 id="demo-title">Interactive AI demo</h2>
              <p className="nr-sectionSub">
                A guided, 3‑step flow—like a real product. Get an itemized setup
                with prices and budget tracking.
              </p>
            </div>
            <div className="nr-demoBadge" aria-hidden="true">
              Product preview
            </div>
          </div>

          <div className="nr-demoShell">
            <div className="nr-stepper" role="tablist" aria-label="Demo steps">
              {(
                [
                  [1, 'Budget & style'],
                  [2, 'Needs'],
                  [3, 'Results'],
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
                  <div className="nr-stepPanel">
                    <div className="nr-panelTitle">Step 1 — Budget & style</div>

                    <div className="nr-formRow">
                      <label className="nr-label" htmlFor="nr-budget">
                        Budget (€)
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
                        Tip: try €600 vs €2500 to see tier changes.
                      </div>
                    </div>

                    <div className="nr-formRow">
                      <label className="nr-label" htmlFor="nr-style">
                        Style
                      </label>
                      <select
                        id="nr-style"
                        className="nr-input nr-select"
                        value={style}
                        onChange={(e) => setStyle(e.target.value as StyleKey)}
                      >
                        <option value="minimal">Minimal</option>
                        <option value="modern">Modern</option>
                        <option value="cozy">Cozy</option>
                      </select>
                    </div>

                    <div className="nr-panelActions">
                      <button
                        type="button"
                        className="nr-secondaryBtn"
                        onClick={() => {
                          setBudget(1200)
                          setStyle('modern')
                          setDemoStep(2)
                        }}
                      >
                        Use recommended
                      </button>
                      <button
                        type="button"
                        className="nr-nextBtn"
                        onClick={() => setDemoStep(2)}
                        disabled={!canContinueToNeeds}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {demoStep === 2 && (
                  <div className="nr-stepPanel">
                    <div className="nr-panelTitle">Step 2 — Select needs</div>

                    <div className="nr-formRow">
                      <div className="nr-label">Needs</div>
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
                        Pick what matters most. We’ll optimize within your budget.
                      </div>
                    </div>

                    <button
                      type="button"
                      className="nr-genBtn"
                      onClick={onGenerate}
                      disabled={isGenerating || !canGenerate}
                    >
                      {isGenerating ? 'Generating…' : 'Generate setup'}
                    </button>

                    <div className="nr-panelActions">
                      <button
                        type="button"
                        className="nr-secondaryBtn"
                        onClick={() => setDemoStep(1)}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="nr-nextBtn"
                        onClick={() => setDemoStep(3)}
                        disabled={!setup}
                        title={!setup ? 'Generate a setup first' : undefined}
                      >
                        View results
                      </button>
                    </div>

                    <p className="nr-micro">
                      Everything runs locally in your browser—no backend.
                    </p>
                  </div>
                )}

                {demoStep === 3 && (
                  <div className="nr-stepPanel">
                    <div className="nr-panelTitle">Step 3 — Results</div>
                    <p className="nr-help">
                      Review the itemized setup. Adjust inputs anytime.
                    </p>
                    <div className="nr-panelActions">
                      <button
                        type="button"
                        className="nr-secondaryBtn"
                        onClick={() => setDemoStep(2)}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="nr-nextBtn"
                        onClick={onGenerate}
                        disabled={isGenerating}
                      >
                        {isGenerating ? 'Refreshing…' : 'Regenerate'}
                      </button>
                    </div>
                  </div>
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
                            {styleTone(setup.style).adjective} bedroom
                          </div>
                        </div>

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
                                    ? 'Within budget'
                                    : 'Over budget'}
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
            <h2 id="examples-title">Example setups</h2>
            <p className="nr-sectionSub">
              A few curated previews—so you know what “good” looks like.
            </p>
          </div>

          <div className="nr-exampleGrid">
            {(
              [
                {
                  title: 'Minimal calm',
                  meta: '€650 • essentials only',
                  body: 'A clean starter setup that stays focused and affordable.',
                },
                {
                  title: 'Modern focus',
                  meta: '€1,200 • work + sleep',
                  body: 'Balanced picks with a tidy workstation and premium lighting.',
                },
                {
                  title: 'Cozy retreat',
                  meta: '€2,400 • comfort upgrades',
                  body: 'Warm textures, higher-quality materials, and smarter storage.',
                },
              ] as const
            ).map((c) => (
              <div key={c.title} className="nr-exampleCard">
                <div className="nr-exampleImg" aria-hidden="true" />
                <div className="nr-exampleBody">
                  <div className="nr-exampleTitle">{c.title}</div>
                  <div className="nr-exampleMeta">{c.meta}</div>
                  <p className="nr-exampleText">{c.body}</p>
                  <a className="nr-textLink" href="#demo">
                    Try this in the demo →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="nr-why" aria-labelledby="why-title">
          <div className="nr-sectionHead">
            <h2 id="why-title">Why NEXROOM</h2>
            <p className="nr-sectionSub">
              Built for speed, taste, and budget reality—without the overwhelm.
            </p>
          </div>

          <div className="nr-whyGrid">
            {(
              [
                {
                  title: 'Budget-aware by default',
                  body: 'Every recommendation is price‑tagged, with trade‑offs explained.',
                },
                {
                  title: 'Style that stays consistent',
                  body: 'We keep materials, colors, and shapes coherent across the setup.',
                },
                {
                  title: 'Fast iteration',
                  body: 'Adjust needs and regenerate instantly until it feels right.',
                },
              ] as const
            ).map((f) => (
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
            <h2 id="how-title">How it works</h2>
            <p className="nr-sectionSub">
              From idea to a shoppable plan—in three simple steps.
            </p>
          </div>

          <ol className="nr-stepGrid">
            <li className="nr-stepCard">
              <div className="nr-stepNum">01</div>
              <h3 className="nr-stepTitle">Tell us your space</h3>
              <p className="nr-stepBody">
                Add room size, must-haves, and your style vibe. Upload a quick
                photo if you want.
              </p>
            </li>
            <li className="nr-stepCard">
              <div className="nr-stepNum">02</div>
              <h3 className="nr-stepTitle">Set a budget</h3>
              <p className="nr-stepBody">
                Choose a target spend and priorities. NEXROOM balances comfort,
                aesthetics, and price.
              </p>
            </li>
            <li className="nr-stepCard">
              <div className="nr-stepNum">03</div>
              <h3 className="nr-stepTitle">Get your plan</h3>
              <p className="nr-stepBody">
                Review the layout, color palette, and furniture picks. Tweak
                options until it feels perfect.
              </p>
            </li>
          </ol>
        </section>

        <section className="nr-pricing" id="pricing" aria-labelledby="pricing-title">
          <div className="nr-sectionHead">
            <h2 id="pricing-title">Pricing</h2>
            <p className="nr-sectionSub">
              Start free. Upgrade when you want saved setups and deeper planning.
            </p>
          </div>

          <div className="nr-priceGrid">
            <div className="nr-priceCard">
              <div className="nr-priceTop">
                <div className="nr-priceName">Free</div>
                <div className="nr-priceValue">{eur(0)}</div>
              </div>
              <ul className="nr-bullets">
                <li>Interactive demo</li>
                <li>Itemized pricing</li>
                <li>Unlimited regenerations</li>
              </ul>
              <a className="nr-genBtn nr-priceBtn" href="#demo">
                Start free demo
              </a>
            </div>

            <div className="nr-priceCard is-featured">
              <div className="nr-priceTop">
                <div className="nr-priceName">Pro</div>
                <div className="nr-priceValue">
                  {eur(9)}
                  <span className="nr-priceUnit">/mo</span>
                </div>
              </div>
              <ul className="nr-bullets">
                <li>Save & compare setups</li>
                <li>Room layout suggestions</li>
                <li>Smarter budget optimization</li>
              </ul>
              <button
                type="button"
                className="nr-genBtn nr-priceBtn"
                onClick={() => {
                  setDemoStep(1)
                  const el = document.getElementById('demo')
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                Try Pro flow
              </button>
            </div>

            <div className="nr-priceCard">
              <div className="nr-priceTop">
                <div className="nr-priceName">Premium</div>
                <div className="nr-priceValue">
                  {eur(19)}
                  <span className="nr-priceUnit">/mo</span>
                </div>
              </div>
              <ul className="nr-bullets">
                <li>Multiple rooms & saved history</li>
                <li>Shareable links</li>
                <li>Priority presets</li>
              </ul>
              <a className="nr-secondaryBtn nr-priceBtn" href="#demo">
                Start with Premium
              </a>
            </div>
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
