import { useEffect, useMemo, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
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
import { analyzeRoomImage } from '../services/roomAnalysisService'
import type { RoomAnalysisResult } from '../types/roomAnalysis'
import type {
  NeedKey,
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
  onAnalysisChange: (analysis: RoomAnalysisResult | null) => void
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

function dataUrlToFile(dataUrl: string, fileName: string) {
  const [meta, value] = dataUrl.split(',')
  const mimeType = meta.match(/data:(.*?);base64/)?.[1] || 'image/jpeg'
  const binary = window.atob(value || '')
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new File([bytes], fileName, { type: mimeType })
}

export function RoomAnalyzer({
  style,
  roomType,
  roomSize,
  budget,
  selectedNeeds,
  onAnalysisChange,
}: RoomAnalyzerProps) {
  const { t, i18n } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scanStage, setScanStage] = useState(0)
  const [analysis, setAnalysis] = useState<RoomAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

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
  const errorTitle = t('demo.analysis.errorTitle')

  const handleCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      return
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      setAnalysisError(null)
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
    const file = dataUrlToFile(dataUrl, 'nexroom-room-capture.jpg')
    setImageSrc(dataUrl)
    setPhotoFile(file)
    stopCamera()
    await analyzePhoto(dataUrl, file)
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setImageSrc(objectUrl)
    setPhotoFile(file)
    await analyzePhoto(objectUrl, file)
  }

  const analyzePhoto = async (src: string, file = photoFile) => {
    const fileToAnalyze = file ?? (src.startsWith('data:') ? dataUrlToFile(src, 'nexroom-room.jpg') : null)
    if (!fileToAnalyze) return

    setIsAnalyzing(true)
    setAnalysis(null)
    setAnalysisError(null)
    setScanStage(1)
    let nextStage = 1
    const stageTimer = window.setInterval(() => {
      nextStage = Math.min(nextStage + 1, scanStepConfig.length - 2)
      setScanStage(nextStage)
    }, 280)

    try {
      const [result] = await Promise.all([
        analyzeRoomImage(fileToAnalyze, {
          budget,
          language: i18n.language,
          locale: i18n.language,
          roomType: t(`demo.steps.1.roomTypes.${roomType}`),
          roomSize: t(`demo.steps.1.roomSizes.${roomSize}`),
          selectedNeeds: selectedNeeds.map((need) => t(`demo.steps.3.furnitureCategories.${need}`)),
          style: t(`demo.steps.1.styles.${style}`),
        }),
        new Promise((resolve) => window.setTimeout(resolve, 1500)),
      ])
      setScanStage(scanStepConfig.length - 1)
      setAnalysis(result)
    } catch (error) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : t('aiMock.errors.readFailure'),
      )
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
          {analysisError ? (
            <span className="nr-status bad">{t('demo.analysis.errorBadge')}</span>
          ) : analysisReady ? (
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

      {analysisError && (
        <div className="nr-analysisSummaryCard">
          <div className="nr-summaryTop">
            <div className="nr-summaryTitle">{errorTitle}</div>
            <span className="nr-status bad">AI</span>
          </div>
          <p>{analysisError}</p>
        </div>
      )}

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
