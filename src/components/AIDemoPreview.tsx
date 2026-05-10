import { BadgeEuro, CheckCircle2, LampDesk, LayoutTemplate, ShoppingBag, Sparkles, WandSparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { RoomSceneMockup } from './RoomSceneMockup'

type PreviewItem = {
  key: string
  name: string
  category: string
  price: number
  note?: string
}

interface AIDemoPreviewProps {
  budget: number
  total?: number
  status?: 'within' | 'over'
  roomLabel: string
  styleLabel: string
  lightingLabel?: string
  isReady?: boolean
  isGenerating?: boolean
  canGenerate?: boolean
  analysisReady?: boolean
  items?: PreviewItem[]
  onGenerate?: () => void
}

function eur(value: number, language = 'en') {
  return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function AIDemoPreview({
  budget,
  total,
  status = 'within',
  roomLabel,
  styleLabel,
  lightingLabel,
  isReady = false,
  isGenerating = false,
  canGenerate = true,
  analysisReady = false,
  items = [],
  onGenerate,
}: AIDemoPreviewProps) {
  const { t, i18n } = useTranslation()
  const estimate = total ?? Math.round(budget * 0.92)
  const usedPercent = Math.min(100, Math.round((estimate / budget) * 100))
  const previewItems = items.length > 0
    ? items.slice(0, 4)
    : [
        {
          key: 'desk',
          name: t('demo.visual.mockProducts.desk'),
          category: t('demo.visual.productCategories.studyZone'),
          price: Math.max(69, Math.round(budget * 0.16 / 5) * 5),
          note: t('demo.visual.productDescriptions.desk'),
        },
        {
          key: 'lamp',
          name: t('demo.visual.mockProducts.lamp'),
          category: t('demo.steps.3.furnitureCategories.lamp'),
          price: Math.max(24, Math.round(budget * 0.07 / 5) * 5),
          note: t('demo.visual.productDescriptions.lamp'),
        },
        {
          key: 'storage',
          name: t('demo.visual.mockProducts.storage'),
          category: t('demo.steps.3.furnitureCategories.storage'),
          price: Math.max(69, Math.round(budget * 0.15 / 5) * 5),
          note: t('demo.visual.productDescriptions.storage'),
        },
      ]
  const insightCards = [
    t('demo.visual.insights.layout'),
    t('demo.visual.insights.lighting'),
    t('demo.visual.insights.budget'),
  ]
  const labels = [
    t('demo.visual.tags.modernStyle'),
    lightingLabel ?? t('demo.visual.tags.warmLighting'),
    t('demo.visual.tags.recommendedLayout'),
  ]

  return (
    <div className={`nr-aiPreview ${isReady ? 'is-ready' : ''}`}>
      <div className="nr-aiPreviewHeader">
        <div>
          <span className="nr-resultsKicker">{t('demo.visual.kicker')}</span>
          <strong>{t('demo.visual.title', { room: roomLabel })}</strong>
        </div>
        <span className={`nr-status ${status === 'within' ? 'ok' : 'bad'}`}>
          {status === 'within' ? t('demo.steps.3.withinBudget') : t('demo.steps.3.overBudget')}
        </span>
      </div>

      <div className="nr-beforeAfter">
        <div className="nr-beforeAfterPanel">
          <span>{t('demo.visual.before')}</span>
          <RoomSceneMockup mode="before" compact ariaLabel={t('demo.visual.before')} />
        </div>
        <div className="nr-beforeAfterPanel is-after">
          <span>{t('demo.visual.after')}</span>
          <RoomSceneMockup mode="after" compact labels={labels} ariaLabel={t('demo.visual.after')} />
        </div>
      </div>

      <div className="nr-aiPreviewFooter">
        <div>
          <Sparkles size={16} />
          <span>{styleLabel}</span>
        </div>
        <div>
          <LampDesk size={16} />
          <span>{lightingLabel ?? t('demo.visual.tags.warmLighting')}</span>
        </div>
        <div>
          <LayoutTemplate size={16} />
          <span>{t('demo.visual.tags.recommendedLayout')}</span>
        </div>
        <div>
          <BadgeEuro size={16} />
          <span>{eur(estimate, i18n.language)} / {eur(budget, i18n.language)}</span>
        </div>
      </div>

      <div className="nr-aiPanelStack">
        <div className="nr-aiStatusCard">
          <div className="nr-aiStatusTop">
            <div>
              <span className="nr-resultsKicker">{t('demo.visual.analysisState')}</span>
              <strong>
                {isGenerating
                  ? t('demo.visual.stateGenerating')
                  : analysisReady
                    ? t('demo.visual.stateReady')
                    : t('demo.visual.stateMock')}
              </strong>
            </div>
            <span className="nr-aiProgressValue">{isGenerating ? '68%' : analysisReady ? '100%' : '42%'}</span>
          </div>
          <div className="nr-aiProgressTrack">
            <span style={{ width: `${isGenerating ? 68 : analysisReady ? 100 : 42}%` }} />
          </div>
          <div className="nr-aiInsightList">
            {insightCards.map((insight) => (
              <span key={insight}>
                <CheckCircle2 size={14} />
                {insight}
              </span>
            ))}
          </div>
        </div>

        <div className="nr-aiBudgetCard">
          <div className="nr-summaryTop">
            <div className="nr-summaryTitle">{t('demo.steps.3.budgetSummary')}</div>
            <span>{usedPercent}%</span>
          </div>
          <div className="nr-meterTrack">
            <div
              className={`nr-meterFill ${status === 'within' ? 'ok' : 'bad'}`}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          <div className="nr-aiBudgetRows">
            <div>
              <span>{t('demo.steps.3.budgetLabel')}</span>
              <strong>{eur(budget, i18n.language)}</strong>
            </div>
            <div>
              <span>{t('demo.visual.estimatedSpend')}</span>
              <strong>{eur(estimate, i18n.language)}</strong>
            </div>
            <div>
              <span>{t('demo.steps.3.remaining')}</span>
              <strong>{eur(Math.max(0, budget - estimate), i18n.language)}</strong>
            </div>
          </div>
        </div>

        <div className="nr-aiProductList">
          <div className="nr-summaryTop">
            <div className="nr-summaryTitle">{t('demo.visual.suggestedProducts')}</div>
            <ShoppingBag size={17} />
          </div>
          {previewItems.map((item) => (
            <div key={item.key} className="nr-aiProductRow">
              <div className={`nr-suggestionPreview nr-suggestionPreview--${item.key}`} aria-hidden="true" />
              <div>
                <span>{item.category}</span>
                <strong>{item.name}</strong>
                <small>{item.note ?? t(`demo.visual.productDescriptions.${item.key}`, { defaultValue: t('demo.visual.productDescriptions.default') })}</small>
              </div>
              <div className="nr-aiProductMeta">
                <em>{status === 'within' ? t('demo.steps.3.withinBudget') : t('demo.visual.previewTag')}</em>
                <b>{t('demo.visual.fromPrice', { price: eur(item.price, i18n.language) })}</b>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="nr-genBtn nr-aiFullRoomBtn"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
        >
          <WandSparkles size={17} />
          {isGenerating ? t('demo.steps.2.generating') : t('demo.visual.generateFullRoom')}
        </button>
      </div>
    </div>
  )
}
