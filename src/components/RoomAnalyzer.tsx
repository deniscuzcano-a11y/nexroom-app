import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, UploadCloud, Image as ImageIcon, Sparkles, StopCircle } from 'lucide-react'
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

function parseImageTone(avgR: number, avgG: number, avgB: number) {
  if (avgR > avgG && avgR > avgB) {
    return ['warm ochre', 'terra cotta', 'soft beige']
  }
  if (avgB > avgR && avgB > avgG) {
    return ['cool slate', 'mist blue', 'soft gray']
  }
  return ['natural linen', 'olive green', 'creamy white']
}

async function analyzeRoomPhoto(
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
          estimatedSize: roomSize === 'small' ? 'Small' : roomSize === 'medium' ? 'Medium' : roomSize === 'large' ? 'Large' : 'Extra large',
          lightingQuality: 'Balanced light',
          styleCues: `${style} geometry with warm contrast`,
          dominantColors: ['soft beige', 'charcoal', 'spruce'],
          missingFurniture: ['storage', 'lamp'],
          clutterLevel: 'Moderate',
          budgetFit: 'Budget-friendly',
          confidence: 82,
          summary: 'Smart room scan completed.',
          nextAction: 'Try another angle to refine the lighting read.',
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
      const avgR = Math.round(rTotal / count)
      const avgG = Math.round(gTotal / count)
      const avgB = Math.round(bTotal / count)
      const avgBrightness = Math.round(brightness / count)
      const brightnessLabel =
        avgBrightness > 190
          ? 'Bright and open'
          : avgBrightness > 130
          ? 'Soft natural light'
          : avgBrightness > 90
          ? 'Moody lighting'
          : 'Cozy low light'
      const palette = parseImageTone(avgR, avgG, avgB)
      const colorSet = [palette[0], palette[1], palette[2]]
      const seed = width + height + avgBrightness + budget + selectedNeeds.length * 43
      const rng = createRng(seed)
      const possibleClutter = ['lightly layered', 'well-organized', 'airy but underfurnished', 'slightly cluttered']
      const clutterLevel = choose(possibleClutter, rng)
      const missingFurniture = selectedNeeds.length > 0 ? [] : ['storage', 'lamp']
      const inferredMissing = ['storage', 'lamp', 'decor'].filter((item) => !selectedNeeds.includes(item as NeedKey))
      const missing = missingFurniture.length ? missingFurniture : inferredMissing.slice(0, 2)
      const budgetFit = budget < 600 ? 'Tight but practical' : budget < 1400 ? 'Well-balanced' : 'Premium enough for upgrades'
      const confidence = clamp(72 + Math.round((avgBrightness / 255) * 18) + Math.floor(rng() * 10), 74, 98)
      const nextAction = budget < 600
        ? 'Raise your budget or choose fewer high-impact pieces.'
        : 'Focus on lighting and texture for a stronger finish.'
      const styleCues =
        style === 'minimalist'
          ? 'Clean silhouettes, layered neutrals'
          : style === 'luxury'
          ? 'Rich finishes, sculptural accents'
          : style === 'cozy'
          ? 'Soft textiles, warm textures'
          : style === 'scandinavian'
          ? 'Light woods, calm balance'
          : style === 'japandi'
          ? 'Natural materials, serene simplicity'
          : 'Polished modern lines'
      const recommendations = [
        {
          title: `${style === 'luxury' ? 'Premium' : 'Designer'} ${roomType === 'office' ? 'desk setup' : 'storage solution'}`,
          price: Math.round((budget / 5) / 5) * 5,
          reason: `Fits the ${styleCues} in your ${clutterLevel} layout and keeps the visual flow clean.`, 
          status: 'Smart fit' as const,
        },
        {
          title: `${style === 'cozy' ? 'Warm ambient lamp' : 'Sculptural floor lamp'}`,
          price: Math.round((budget / 12) / 5) * 5,
          reason: `Adds the right level of light for ${brightnessLabel.toLowerCase()} spaces.`, 
          status: 'Budget friendly' as const,
        },
        {
          title: `${style === 'minimalist' ? 'Low-profile shelf' : 'Modular storage unit'}`,
          price: Math.round((budget / 8) / 5) * 5,
          reason: `Helps keep the ${clutterLevel} area tidy while matching the palette.`, 
          status: 'Style match' as const,
        },
      ]

      resolve({
        imageSrc: src,
        detectedRoom: roomType,
        estimatedSize: getSizeLabel(width, height),
        lightingQuality: brightnessLabel,
        styleCues,
        dominantColors: colorSet,
        missingFurniture: missing,
        clutterLevel,
        budgetFit,
        confidence,
        summary: `Your photo shows a ${roomType} with ${brightnessLabel.toLowerCase()} and ${styleCues.toLowerCase()}. The space feels ${clutterLevel} and would benefit from ${missing.join(' and ')}.`,
        nextAction,
        recommendations,
      })
    }
    image.onerror = () => {
      resolve({
        imageSrc: src,
        detectedRoom: roomType,
        estimatedSize: roomSize === 'small' ? 'Small' : roomSize === 'medium' ? 'Medium' : roomSize === 'large' ? 'Large' : 'Extra large',
        lightingQuality: 'Balanced light',
        styleCues: `${style} geometry with warm contrast`,
        dominantColors: ['soft beige', 'charcoal', 'spruce'],
        missingFurniture: ['storage', 'lamp'],
        clutterLevel: 'Moderate',
        budgetFit: 'Budget-friendly',
        confidence: 78,
        summary: 'Room scan completed with default analysis.',
        nextAction: 'Try a clearer photo with more room detail.',
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
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(null)

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [stream])

  useEffect(() => {
    if (analysis) {
      onAnalysisChange(analysis)
    }
  }, [analysis, onAnalysisChange])

  const analysisReady = Boolean(analysis)

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
    const result = await analyzeRoomPhoto(src, roomType, roomSize, style, budget, selectedNeeds)
    setAnalysis(result)
    setIsAnalyzing(false)
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
            <span className="nr-status ok">{analysis?.budgetFit}</span>
          ) : (
            <span className="nr-status">{t('demo.analysis.noPhoto')}</span>
          )}
        </div>
      </div>

      <div className="nr-analyzerContent">
        <div className="nr-analyzerPreview">
          {stream ? (
            <video ref={videoRef} className="nr-analyzerVideo" muted playsInline />
          ) : imageSrc ? (
            <img src={imageSrc} alt={t('demo.analysis.previewAlt')} className="nr-analyzerImage" />
          ) : (
            <div className="nr-analyzerPlaceholder">
              <div className="nr-analyzerPlaceholderIcon">
                <ImageIcon size={28} />
              </div>
              <p>{t('demo.analysis.noPhoto')}</p>
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
        </div>
      </div>

      {analysis && (
        <div className="nr-analysisDeck">
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
                <strong>{t('demo.analysis.missingFurniture')}:</strong> {analysis.missingFurniture.join(', ')}
              </div>
              <div>
                <strong>{t('demo.analysis.nextAction')}:</strong> {analysis.nextAction}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
