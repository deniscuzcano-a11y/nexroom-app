import { useEffect, useMemo, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  Camera,
  CheckCircle2,
  LampDesk,
  LayoutTemplate,
  ScanSearch,
  Sparkles,
  StopCircle,
  UploadCloud,
  WandSparkles,
} from 'lucide-react'
import { RoomSceneMockup } from './RoomSceneMockup'
import type {
  NeedKey,
  RoomAnalysis,
  RoomSizeKey,
  RoomTypeKey,
  StyleKey,
} from '../types'

interface RoomAnalyzerProps {
  style: StyleKey
  roomType: RoomTypeKey
  roomSize: RoomSizeKey
  budget: number
  selectedNeeds: NeedKey[]
  onAnalysisChange: (analysis: RoomAnalysis | null) => void
}

type ScanStep = {
  key:
    | 'upload'
    | 'analyzing'
    | 'style'
    | 'lighting'
    | 'emptySpaces'
    | 'recommendations'
    | 'transformation'
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>
}

const scanStepConfig: ScanStep[] = [
  { key: 'upload', Icon: UploadCloud },
  { key: 'analyzing', Icon: ScanSearch },
  { key: 'style', Icon: Sparkles },
  { key: 'lighting', Icon: LampDesk },
  { key: 'emptySpaces', Icon: LayoutTemplate },
  { key: 'recommendations', Icon: WandSparkles },
  { key: 'transformation', Icon: CheckCircle2 },
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
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

function choose<T>(arr: readonly T[], r: () => number) {
  return arr[Math.floor(r() * arr.length)] ?? arr[0]
}

function getSizeLabel(width: number, height: number) {
  const area = width * height
  if (area < 600_000) return 'Small'
  if (area < 1_600_000) return 'Medium'
  if (area < 3_600_000) return 'Large'
  return 'Extra large'
}

async function analyzeRoomPhoto(
  t: TFunction,
  src: string,
  roomType: RoomTypeKey,
  roomSize: RoomSizeKey,
  style: StyleKey,
  budget: number,
  selectedNeeds: NeedKey[],
) {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = src

  const analysis = await new Promise<RoomAnalysis>((resolve) => {
    image.onload = () => {
      const width = image.naturalWidth || 1280
      const height = image.naturalHeight || 960
      const canvas = document.createElement('canvas')
      canvas.width = 32
      canvas.height = 32
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve({
          imageSrc: src,
          detectedRoom: roomType,
          estimatedSize: roomSize === 'small' ? t('demo.analysis.sizes.small') : roomSize === 'medium' ? t('demo.analysis.sizes.medium') : roomSize === 'large' ? t('demo.analysis.sizes.large') : t('demo.analysis.sizes.xl'),
          lightingQuality: t('demo.analysis.lightLevels.softNatural'),
          styleCues: t(`demo.analysis.styleCuesValues.${style}`),
          dominantColors: [t('demo.analysis.colors.softBeige'), t('demo.analysis.colors.charcoal'), t('demo.analysis.colors.spruce')],
          missingFurniture: [t('demo.analysis.missingFurniture.storage'), t('demo.analysis.missingFurniture.lamp')],
          clutterLevel: t('demo.analysis.clutterLevels.moderate'),
          budgetFit: t('demo.analysis.budgetFits.balanced'),
          confidence: 82,
          summary: t('demo.analysis.summaryDefault'),
          nextAction: t('demo.analysis.nextActions.default'),
          recommendations: [],
        })
        return
      }

      ctx.drawImage(image, 0, 0, 32, 32)
      const data = ctx.getImageData(0, 0, 32, 32).data
      let rTotal = 0
      let gTotal = 0
      let bTotal = 0
      let brightness = 0
      let count = 0
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const value = (r + g + b) / 3
        rTotal += r
        gTotal += g
        bTotal += b
        brightness += value
        count += 1
      }
      const avgBrightness = Math.round(brightness / count)
      const avgRed = Math.round(rTotal / count)
      const avgGreen = Math.round(gTotal / count)
      const avgBlue = Math.round(bTotal / count)
      const brightnessKey =
        avgBrightness > 190
          ? 'brightOpen'
          : avgBrightness > 130
          ? 'softNatural'
          : avgBrightness > 90
          ? 'moody'
          : 'cozyLow'
      const brightnessLabel = t(`demo.analysis.lightLevels.${brightnessKey}`)
      const styleCues = t(`demo.analysis.styleCuesValues.${style}`)
      const possibleClutter = ['lightlyLayered', 'wellOrganized', 'airyUnderfurnished', 'slightlyCluttered'] as const
      const clutterKey = choose(possibleClutter, createRng(width + height + avgBrightness))
      const clutterLevel = t(`demo.analysis.clutterLevels.${clutterKey}`)
      const missingFurniture = selectedNeeds.length > 0 ? [] : ['storage', 'lamp'] as const
      const inferredMissing = ['storage', 'lamp'] as const
      const missing = missingFurniture.length
        ? missingFurniture.map((item) => t(`demo.analysis.missingFurniture.${item}`))
        : inferredMissing.filter((item) => !selectedNeeds.includes(item)).slice(0, 2).map((item) => t(`demo.analysis.missingFurniture.${item}`))
      const budgetFitKey = budget < 600 ? 'tight' : budget < 1400 ? 'balanced' : 'premium'
      const budgetFit = t(`demo.analysis.budgetFits.${budgetFitKey}`)
      const nextAction = budgetFitKey === 'tight'
        ? t('demo.analysis.nextActions.raiseBudget')
        : t('demo.analysis.nextActions.focusLighting')
      const confidence = clamp(74 + Math.round((avgBrightness / 255) * 18) + Math.floor(createRng(avgBrightness + width + height)() * 8), 76, 98)
      const colorMood = avgRed > avgBlue && avgRed > avgGreen
        ? t('demo.analysis.colors.softBeige')
        : avgBlue > avgRed
          ? t('demo.analysis.colors.spruce')
          : t('demo.analysis.colors.charcoal')
      const summary = t('demo.analysis.summary', {
        roomType: t(`demo.steps.1.roomTypes.${roomType}`),
        lighting: brightnessLabel,
        style: styleCues,
        clutter: clutterLevel,
        missing: missing.join(', '),
      })
      const scoreBase = clamp(Math.round((avgBrightness / 255) * 20 + 80), 80, 96)
      const recommendations = [
        {
          title: roomType === 'office'
            ? t('demo.analysis.recommendationTitles.deskSetup')
            : t('demo.analysis.recommendationTitles.storageSolution'),
          price: Math.round((budget / 5) / 5) * 5,
          reason: t('demo.analysis.recommendationReasons.smartFit', {
            style: styleCues.toLowerCase(),
            clutter: clutterLevel.toLowerCase(),
          }),
          status: 'smartFit' as const,
          match: clamp(scoreBase + 6, 82, 98),
          imageType: roomType === 'office' ? 'desk' as const : 'storage' as const,
        },
        {
          title: style === 'cozy'
            ? t('demo.analysis.recommendationTitles.warmLamp')
            : t('demo.analysis.recommendationTitles.sculpturalLamp'),
          price: Math.round((budget / 12) / 5) * 5,
          reason: t('demo.analysis.recommendationReasons.budgetFriendly', {
            light: brightnessLabel.toLowerCase(),
          }),
          status: 'budgetFriendly' as const,
          match: clamp(scoreBase + 2, 78, 92),
          imageType: 'lamp' as const,
        },
        {
          title: style === 'minimalist'
            ? t('demo.analysis.recommendationTitles.lowShelf')
            : t('demo.analysis.recommendationTitles.modularStorage'),
          price: Math.round((budget / 8) / 5) * 5,
          reason: t('demo.analysis.recommendationReasons.styleMatch', {
            palette: styleCues.toLowerCase(),
          }),
          status: 'styleMatch' as const,
          match: clamp(scoreBase + 4, 80, 94),
          imageType: 'storage' as const,
        },
      ]

      resolve({
        imageSrc: src,
        detectedRoom: t(`demo.steps.1.roomTypes.${roomType}`),
        estimatedSize:
          getSizeLabel(width, height) === 'Small'
            ? t('demo.analysis.sizes.small')
            : getSizeLabel(width, height) === 'Medium'
            ? t('demo.analysis.sizes.medium')
            : getSizeLabel(width, height) === 'Large'
            ? t('demo.analysis.sizes.large')
            : t('demo.analysis.sizes.xl'),
        lightingQuality: brightnessLabel,
        styleCues,
        dominantColors: [colorMood, t('demo.analysis.colors.charcoal'), t('demo.analysis.colors.spruce')],
        missingFurniture: missing,
        clutterLevel,
        budgetFit,
        confidence,
        summary,
        nextAction,
        recommendations,
      })
    }
    image.onerror = () => {
      resolve({
        imageSrc: src,
        detectedRoom: t(`demo.steps.1.roomTypes.${roomType}`),
        estimatedSize: roomSize === 'small' ? t('demo.analysis.sizes.small') : roomSize === 'medium' ? t('demo.analysis.sizes.medium') : roomSize === 'large' ? t('demo.analysis.sizes.large') : t('demo.analysis.sizes.xl'),
        lightingQuality: t('demo.analysis.lightLevels.softNatural'),
        styleCues: t(`demo.analysis.styleCuesValues.${style}`),
        dominantColors: [t('demo.analysis.colors.softBeige'), t('demo.analysis.colors.charcoal'), t('demo.analysis.colors.spruce')],
        missingFurniture: [t('demo.analysis.missingFurniture.storage'), t('demo.analysis.missingFurniture.lamp')],
        clutterLevel: t('demo.analysis.clutterLevels.moderate'),
        budgetFit: t('demo.analysis.budgetFits.balanced'),
        confidence: 78,
        summary: t('demo.analysis.summaryDefault'),
        nextAction: t('demo.analysis.nextActions.default'),
        recommendations: [],
      })
    }
  })

  return analysis
}

export function RoomAnalyzer({
  style,
  roomType,
  roomSize,
  budget,
  selectedNeeds,
  onAnalysisChange,
}: RoomAnalyzerProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scanStage, setScanStage] = useState(0)
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(null)

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [stream])

  useEffect(() => {
    onAnalysisChange(analysis)
  }, [analysis, onAnalysisChange])

  const analysisReady = Boolean(analysis)
  const activeStage = analysisReady ? scanStepConfig.length - 1 : imageSrc || stream ? scanStage : 0
  const progressPercent = analysisReady
    ? 100
    : isAnalyzing
      ? Math.max(18, Math.round((activeStage / (scanStepConfig.length - 1)) * 100))
      : imageSrc || stream
        ? 18
        : 0
  const previewLabels = analysis
    ? [analysis.styleCues, analysis.lightingQuality, t('demo.visual.tags.recommendedLayout')]
    : [t('demo.visual.tags.modernStyle'), t('demo.visual.tags.warmLighting')]

  const details = useMemo(() => {
    if (!analysis) return null
    return [
      { label: t('demo.analysis.detectedRoom'), value: analysis.detectedRoom },
      { label: t('demo.analysis.estimatedSize'), value: analysis.estimatedSize },
      { label: t('demo.analysis.lighting'), value: analysis.lightingQuality },
      { label: t('demo.analysis.styleCues'), value: analysis.styleCues },
    ]
  }, [analysis, t])

  const handleCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      return
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
    } catch {
      // ignore camera permission failures in demo mode
    }
  }

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop())
    setStream(null)
  }

  const capturePhoto = async () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 960
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setImageSrc(dataUrl)
    stopCamera()
    await analyzePhoto(dataUrl)
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setImageSrc(objectUrl)
    await analyzePhoto(objectUrl)
  }

  const analyzePhoto = async (src: string) => {
    setIsAnalyzing(true)
    setAnalysis(null)
    setScanStage(1)
    let nextStage = 1
    const stageTimer = window.setInterval(() => {
      nextStage = Math.min(nextStage + 1, scanStepConfig.length - 2)
      setScanStage(nextStage)
    }, 280)

    try {
      const [result] = await Promise.all([
        analyzeRoomPhoto(t, src, roomType, roomSize, style, budget, selectedNeeds),
        new Promise((resolve) => window.setTimeout(resolve, 1500)),
      ])
      setScanStage(scanStepConfig.length - 1)
      setAnalysis(result)
    } finally {
      window.clearInterval(stageTimer)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="nr-analyzerPanel">
      <div className="nr-analyzerHeader">
        <div>
          <div className="nr-panelTitle">{t('demo.analysis.sectionTitle')}</div>
          <p className="nr-help">{t('demo.analysis.sectionHint')}</p>
        </div>
        <div className="nr-analyzerStatus">
          {analysisReady ? (
            <span className="nr-status ok">{analysis?.confidence}% {t('demo.analysis.confidence')}</span>
          ) : (
            <span className="nr-status">{isAnalyzing ? t('demo.analysis.analyzing') : t('demo.analysis.readyLabel')}</span>
          )}
        </div>
      </div>

      <div className="nr-scanProgressHeader">
        <div>
          <span>{t('demo.analysis.progressLabel')}</span>
          <strong>{progressPercent}%</strong>
        </div>
        <div className="nr-aiProgressTrack">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="nr-analyzerContent">
        <div className={`nr-analyzerPreview ${isAnalyzing ? 'is-scanning' : ''}`}>
          {stream ? (
            <video ref={videoRef} className="nr-analyzerVideo" muted playsInline />
          ) : imageSrc ? (
            <img src={imageSrc} alt={t('demo.analysis.previewAlt')} className="nr-analyzerImage" />
          ) : (
            <div className="nr-analyzerPlaceholder">
              <RoomSceneMockup mode="before" showScan compact />
              <p>{t('demo.analysis.noPhoto')}</p>
            </div>
          )}

          <div className="nr-analyzerOverlay">
            {previewLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          {(isAnalyzing || analysisReady || stream) && (
            <div className="nr-liveScanLayer" aria-hidden="true">
              <div className="nr-liveScanLine" />
              <span className="nr-liveScanPin nr-liveScanPin--one" />
              <span className="nr-liveScanPin nr-liveScanPin--two" />
              <span className="nr-liveScanPin nr-liveScanPin--three" />
            </div>
          )}
        </div>

        <div className="nr-analyzerActions">
          <button type="button" className="nr-secondaryBtn" onClick={handleCamera}>
            <Camera size={16} /> {t('demo.analysis.cameraLabel')}
          </button>
          <button
            type="button"
            className="nr-secondaryBtn"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={16} /> {t('demo.analysis.uploadLabel')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleUpload}
            className="sr-only"
          />
          {stream ? (
            <button type="button" className="nr-nextBtn" onClick={capturePhoto}>
              <Sparkles size={16} /> {t('demo.analysis.captureLabel')}
            </button>
          ) : null}
          {stream ? (
            <button type="button" className="nr-secondaryBtn" onClick={stopCamera}>
              <StopCircle size={16} /> {t('demo.analysis.stopLabel')}
            </button>
          ) : null}
          {imageSrc && !stream ? (
            <button
              type="button"
              className="nr-nextBtn"
              onClick={() => analyzePhoto(imageSrc)}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? t('demo.analysis.analyzing') : t('demo.analysis.analyzeLabel')}
            </button>
          ) : null}

          <div className="nr-scanFlow" aria-label={t('demo.analysis.scanFlowLabel')}>
            {scanStepConfig.map((step, index) => {
              const Icon = step.Icon
              const isComplete = analysisReady ? index < scanStepConfig.length - 1 : index < activeStage
              const isActive = analysisReady
                ? index === scanStepConfig.length - 1
                : index === activeStage

              return (
                <div
                  key={step.key}
                  className={`nr-scanStep ${isComplete ? 'is-complete' : ''} ${isActive ? 'is-active' : ''}`}
                >
                  <span className="nr-scanStepIcon">
                    <Icon size={15} strokeWidth={2.2} />
                  </span>
                  <span>{t(`demo.analysis.scanSteps.${step.key}`)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {analysis && (
        <div className="nr-analysisDeck">
          <div className="nr-transformationCard">
            <div className="nr-transformationHeader">
              <div>
                <div className="nr-resultsKicker">{t('demo.analysis.transformationKicker')}</div>
                <strong>{t('demo.analysis.transformationTitle')}</strong>
              </div>
              <span className="nr-status ok">{analysis.budgetFit}</span>
            </div>
            <div className="nr-transformationGrid">
              <div>
                <span className="nr-analysisLabel">{t('demo.visual.before')}</span>
                <RoomSceneMockup mode="before" compact />
              </div>
              <div>
                <span className="nr-analysisLabel">{t('demo.visual.after')}</span>
                <RoomSceneMockup mode="after" compact labels={previewLabels} />
              </div>
            </div>
          </div>

          <div className="nr-analysisDetails">
            {details?.map((item) => (
              <div key={item.label} className="nr-analysisStat">
                <span className="nr-analysisLabel">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="nr-analysisSummaryCard">
            <div className="nr-summaryTop">
              <div className="nr-summaryTitle">{t('demo.analysis.resultTitle')}</div>
              <span className="nr-status ok">{analysis.confidence}%</span>
            </div>
            <p>{analysis.summary}</p>
            <div className="nr-summaryNotes">
              <div>
                <strong>{t('demo.analysis.missingFurnitureLabel')}:</strong> {analysis.missingFurniture.join(', ')}
              </div>
              <div>
                <strong>{t('demo.analysis.nextAction')}:</strong> {analysis.nextAction}
              </div>
            </div>
          </div>

          <div className="nr-recommendationRail">
            {analysis.recommendations.map((item) => (
              <div key={item.title} className="nr-recommendationMini">
                <div className={`nr-suggestionPreview nr-suggestionPreview--${item.imageType}`} aria-hidden="true" />
                <div>
                  <span>{t(`demo.analysis.status.${item.status}`)}</span>
                  <strong>{item.title}</strong>
                  <small>{t('demo.analysis.match', { percent: item.match })}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
