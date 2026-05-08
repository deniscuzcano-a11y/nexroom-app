import type {
  BudgetBreakdown,
  CommercialSummary,
  FurniturePackSet,
  RoomAnalysisClientContext,
  RoomAnalysisMockText,
  RoomAnalysisRecommendation,
  RoomAnalysisResult,
  VisualMockupPlan,
} from '../src/types/roomAnalysis.js'
import { mockRoomAnalysisContent } from './mockRoomAnalysisContent.js'

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

type ServerlessRequest = {
  method?: string
  body?: unknown
  on: (
    event: 'data' | 'end' | 'error',
    callback: (chunkOrError?: { toString: (encoding?: string) => string } | Error) => void,
  ) => void
}

type ServerlessResponse = {
  status: (code: number) => ServerlessResponse
  json: (body: JsonValue) => void
  setHeader?: (name: string, value: string) => void
}

type SerializedImage = {
  dataUrl?: string
  mimeType?: string
  name?: string
  size?: number
}

type AnalyzeRoomPayload = {
  image?: SerializedImage
  context?: RoomAnalysisClientContext
}

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024
const MAX_REQUEST_BODY_BYTES = 12 * 1024 * 1024
const SUPPORTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

type AiResponseBody = {
  output_text?: string
  output?: Array<{
    content?: Array<{
      text?: string
      refusal?: string
    }>
  }>
}

function getEnv() {
  return (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isSpanish(locale?: string) {
  return locale?.toLowerCase().startsWith('es') ?? false
}

function resolveLanguage(context: RoomAnalysisClientContext) {
  return context.language || context.locale || 'en'
}

function getMockText(context: RoomAnalysisClientContext): RoomAnalysisMockText {
  return isSpanish(resolveLanguage(context)) ? mockRoomAnalysisContent.es : mockRoomAnalysisContent.en
}

function fillTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{{${key}}}`, String(value)),
    template,
  )
}

function createMockProduct(params: {
  id: string
  name: string
  category: string
  price: number
  reason: string
  imageType: RoomAnalysisRecommendation['imageType']
  status: RoomAnalysisRecommendation['status']
  priority: RoomAnalysisRecommendation['priority']
  color: string
  widthCm: number
  depthCm: number
  heightCm: number
  storeName: string
  score: number
  text: RoomAnalysisMockText
}): RoomAnalysisRecommendation {
  return {
    id: params.id,
    name: params.name,
    title: params.name,
    category: params.category,
    price: params.price,
    quantity: 1,
    dimensions: {
      widthCm: params.widthCm,
      depthCm: params.depthCm,
      heightCm: params.heightCm,
      notes: params.text.labels.dimensionsNote,
    },
    store: {
      name: params.storeName,
      availability: 'unknown',
    },
    styleTags: ['clean-lined', 'budget-aware', 'small-room-ready'],
    color: params.color,
    reason: params.reason,
    priority: params.priority,
    status: params.status,
    fitScore: clamp(params.score + 1, 0, 100),
    styleScore: clamp(params.score - 2, 0, 100),
    budgetScore: clamp(params.score + 4, 0, 100),
    practicalityScore: clamp(params.score, 0, 100),
    overallScore: params.score,
    match: params.score,
    imageType: params.imageType,
    alternatives: [
      {
        type: 'cheaper',
        id: `${params.id}-budget`,
        name: `${params.name} - ${params.text.alternatives.cheaperSuffix}`,
        price: Math.round(params.price * 0.72),
        dimensions: { widthCm: params.widthCm, depthCm: params.depthCm, heightCm: params.heightCm },
        store: { name: params.text.labels.futureCatalog, availability: 'unknown' },
        reason: params.text.alternatives.cheaperReason,
      },
      {
        type: 'premium',
        id: `${params.id}-premium`,
        name: `${params.name} - ${params.text.alternatives.premiumSuffix}`,
        price: Math.round(params.price * 1.45),
        dimensions: { widthCm: params.widthCm, depthCm: params.depthCm, heightCm: params.heightCm },
        store: { name: params.text.labels.futureCatalog, availability: 'unknown' },
        reason: params.text.alternatives.premiumReason,
      },
      {
        type: 'otherStore',
        id: `${params.id}-store`,
        name: `${params.name} - ${params.text.alternatives.otherStoreSuffix}`,
        price: Math.round(params.price * 1.05),
        dimensions: { widthCm: params.widthCm, depthCm: params.depthCm, heightCm: params.heightCm },
        store: { name: params.text.labels.alternativeFutureStore, availability: 'unknown' },
        reason: params.text.alternatives.otherStoreReason,
      },
    ],
    placementAdvice: params.text.labels.placementAdvice,
  }
}

function createPackSet(products: RoomAnalysisRecommendation[], budget: number, text: RoomAnalysisMockText): FurniturePackSet {
  const basicIds = products.slice(0, 2).map((item) => item.id)
  const recommendedIds = products.map((item) => item.id)

  return {
    basic: {
      id: 'pack-basic',
      tier: 'basic',
      title: text.packs.basic.title,
      summary: text.packs.basic.summary,
      productIds: basicIds,
      totalPrice: products.slice(0, 2).reduce((sum, item) => sum + item.price, 0),
      pros: text.packs.basic.pros,
      cons: text.packs.basic.cons,
      visualTransformationLevel: 48,
      purchasePriority: basicIds,
    },
    recommended: {
      id: 'pack-recommended',
      tier: 'recommended',
      title: text.packs.recommended.title,
      summary: text.packs.recommended.summary,
      productIds: recommendedIds,
      totalPrice: products.reduce((sum, item) => sum + item.price, 0),
      pros: text.packs.recommended.pros,
      cons: text.packs.recommended.cons,
      visualTransformationLevel: 78,
      purchasePriority: recommendedIds,
    },
    premium: {
      id: 'pack-premium',
      tier: 'premium',
      title: text.packs.premium.title,
      summary: text.packs.premium.summary,
      productIds: recommendedIds,
      totalPrice: Math.round(budget * 1.12),
      pros: text.packs.premium.pros,
      cons: text.packs.premium.cons,
      visualTransformationLevel: 92,
      purchasePriority: recommendedIds,
    },
  }
}

function createBudgetBreakdown(products: RoomAnalysisRecommendation[], budget: number): BudgetBreakdown {
  const estimatedTotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const byStore = products.reduce<BudgetBreakdown['byStore']>((stores, item) => {
    const existing = stores.find((store) => store.store === item.store.name)
    if (existing) {
      existing.total += item.price * item.quantity
      existing.itemCount += item.quantity
      return stores
    }

    return [...stores, { store: item.store.name, total: item.price * item.quantity, itemCount: item.quantity }]
  }, [])

  return {
    currency: 'EUR',
    maxBudget: budget,
    estimatedTotal,
    budgetUsedPercent: Math.round((estimatedTotal / budget) * 100),
    remainingBudget: budget - estimatedTotal,
    byCategory: products.map((item) => ({ category: item.category, total: item.price * item.quantity })),
    byStore,
    overBudgetItems: products.filter((item) => item.price > budget).map((item) => item.id),
    estimatedSavings: Math.max(0, Math.round(budget * 0.12)),
  }
}

function createMockAnalysis(context: RoomAnalysisClientContext = { budget: 1200 }): RoomAnalysisResult {
  const text = getMockText(context)
  const budget = clamp(Math.round(context.budget || 1200), 150, 12000)
  const isPremium = budget >= 1800
  const isTight = budget < 650
  const estimateMin = Math.round((budget * (isTight ? 0.72 : 0.58)) / 5) * 5
  const estimateMax = Math.round((budget * (isPremium ? 0.92 : 0.86)) / 5) * 5
  const roomLabel = context.roomType || text.room.fallbackRoom
  const styleLabel = context.style || text.room.fallbackStyle
  const products = text.products.map((product) => createMockProduct({
    ...product,
    price: Math.round((budget * product.budgetRatio) / 5) * 5,
    storeName: text.labels.futureCatalog,
    text,
  }))
  const budgetBreakdown = createBudgetBreakdown(products, budget)
  const furniturePack = createPackSet(products, budget, text)
  const roomZones = [
    {
      id: 'zone-main-wall',
      label: text.zones.mainWallLabel,
      purpose: text.zones.mainWallPurpose,
      placementAdvice: text.zones.mainWallAdvice,
      approximateSize: { widthCm: 180, depthCm: 45, heightCm: 90 },
      confidence: 70,
    },
    {
      id: 'zone-circulation',
      label: text.zones.circulationLabel,
      purpose: text.zones.circulationPurpose,
      placementAdvice: text.zones.circulationAdvice,
      avoidFurniture: true,
      confidence: 68,
    },
  ]
  const visualMockupPlan: VisualMockupPlan = {
    roomZones,
    placementInstructions: [
      {
        productId: 'storage-low-001',
        zoneId: 'zone-main-wall',
        instruction: text.visualMockupPlan.storageInstruction,
        anchor: 'wall',
      },
      {
        productId: 'lamp-warm-001',
        zoneId: 'zone-main-wall',
        instruction: text.visualMockupPlan.lampInstruction,
        anchor: 'corner',
      },
    ],
    overlayLabels: [
      { label: text.visualMockupPlan.storageLabel, zoneId: 'zone-main-wall' },
      { label: text.visualMockupPlan.clearanceLabel, zoneId: 'zone-circulation' },
    ],
    beforeAfterPrompt: text.visualMockupPlan.beforeAfterPrompt,
  }
  const commercialSummary: CommercialSummary = {
    packTitle: text.commercialSummary.packTitle,
    readyRoomSummary: text.commercialSummary.readyRoomSummary,
    recommendedCta: text.commercialSummary.recommendedCta,
    essentialProductIds: ['storage-low-001'],
    optionalProductIds: ['desk-compact-001'],
    estimatedSavings: budgetBreakdown.estimatedSavings ?? 0,
    budgetUsedPercent: budgetBreakdown.budgetUsedPercent,
  }

  return {
    imageSrc: '',
    detectedRoom: roomLabel,
    estimatedSize: context.roomSize || text.room.fallbackSize,
    lightingQuality: text.room.lighting,
    styleCues: fillTemplate(text.room.styleCues, { style: styleLabel }),
    dominantColors: text.room.colors,
    emptySpaces: roomZones.filter((zone) => !zone.avoidFurniture).map((zone) => zone.label),
    spaceProblems: text.room.spaceProblems,
    missingFurniture: text.room.missingFurniture,
    clutterLevel: text.room.clutterLevel,
    budgetFit: isTight
      ? text.room.budgetFitTight
      : isPremium
        ? text.room.budgetFitPremium
        : text.room.budgetFitBalanced,
    budgetEstimate: {
      min: estimateMin,
      max: estimateMax,
      currency: 'EUR',
    },
    confidence: 82,
    summary: fillTemplate(text.room.summary, { room: roomLabel, style: styleLabel }),
    nextAction: text.room.nextAction,
    recommendations: products,
    source: 'mock',
    roomAnalysis: {
      inputType: context.inputType ?? 'photo',
      detectedRoomType: roomLabel,
      layoutSummary: text.room.layoutSummary,
      naturalLight: text.room.naturalLight,
      currentColors: text.room.colors,
      currentStyle: styleLabel,
      existingFurniture: [text.room.existingFurniture],
      emptyZones: roomZones.filter((zone) => !zone.avoidFurniture),
      obstacles: [
        {
          id: 'obstacle-window-001',
          type: 'window',
          label: text.obstacles.windowLabel,
          position: 'left wall',
          avoidPlacementRadiusCm: 40,
          confidence: 58,
        },
      ],
      measurements: {
        confidence: 42,
        notes: text.room.measurementNotes,
      },
      noPlacementZones: roomZones.filter((zone) => zone.avoidFurniture),
    },
    userPreferences: context,
    layoutSuggestions: [
      {
        id: 'layout-clearance-001',
        zoneId: 'zone-circulation',
        title: text.layoutSuggestion.title,
        description: text.layoutSuggestion.description,
        clearanceRequirementCm: 70,
        doNotPlaceNear: ['door', 'radiator', 'window'],
        relatedFurnitureIds: products.map((item) => item.id),
      },
    ],
    furniturePack,
    suggestedFurniture: products,
    budgetBreakdown,
    analysisSteps: [
      { id: 'step-room', label: text.analysisSteps.room, status: 'mock', confidence: 82 },
      { id: 'step-layout', label: text.analysisSteps.layout, status: 'mock', confidence: 68 },
      { id: 'step-pack', label: text.analysisSteps.pack, status: 'mock', confidence: 78 },
    ],
    visualMockupPlan,
    beforeAfterPrompt: visualMockupPlan.beforeAfterPrompt,
    warnings: [
      {
        id: 'warning-measurements',
        severity: 'warning',
        message: text.warnings.measurements,
        suggestedAction: text.warnings.measurementsAction,
      },
      {
        id: 'warning-light-color',
        severity: 'info',
        message: text.warnings.lightColor,
      },
    ],
    commercialSummary,
    nextActions: [
      text.nextActions.saveVersion,
      text.nextActions.comparePacks,
      text.nextActions.regenerateBudget,
    ],
    projectMemory: {
      projectId: context.projectId,
      roomVersionId: context.roomVersionId,
      canSaveRoom: true,
      comparableVersionIds: [],
      regenerationOptions: [
        {
          label: text.regeneration.lowerBudget,
          contextPatch: { budget: Math.max(150, Math.round(budget * 0.8)) },
        },
        {
          label: text.regeneration.upgradePremium,
          contextPatch: { budget: Math.round(budget * 1.25), desiredTier: 'premium' },
        },
      ],
    },
    videoAnalysis: {
      multipleFrames: false,
      roomAngles: [],
      detectedObjectsAcrossFrames: [],
      confidenceByFrame: [],
    },
  }
}

function normalizeContext(value: unknown): RoomAnalysisClientContext {
  if (!isRecord(value)) return { budget: 1200 }

  return {
    budget: typeof value.budget === 'number' ? value.budget : 1200,
    language: typeof value.language === 'string' ? value.language : undefined,
    locale: typeof value.locale === 'string' ? value.locale : undefined,
    roomSize: typeof value.roomSize === 'string' ? value.roomSize : undefined,
    roomType: typeof value.roomType === 'string' ? value.roomType : undefined,
    selectedNeeds: Array.isArray(value.selectedNeeds)
      ? value.selectedNeeds.filter((item): item is string => typeof item === 'string')
      : undefined,
    style: typeof value.style === 'string' ? value.style : undefined,
    colorPalette: typeof value.colorPalette === 'string' ? value.colorPalette : undefined,
    inputType: value.inputType === 'video' || value.inputType === 'multiFrame' ? value.inputType : 'photo',
  }
}

async function readJsonBody(request: ServerlessRequest): Promise<AnalyzeRoomPayload> {
  if (isRecord(request.body)) return request.body as AnalyzeRoomPayload
  if (typeof request.body === 'string') return JSON.parse(request.body) as AnalyzeRoomPayload

  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      if (chunk && !(chunk instanceof Error)) {
        body += chunk.toString('utf8')
        if (body.length > MAX_REQUEST_BODY_BYTES) {
          reject(new Error('Payload too large.'))
        }
      }
    })
    request.on('end', () => {
      try {
        resolve(body ? (JSON.parse(body) as AnalyzeRoomPayload) : {})
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Invalid JSON payload.'))
      }
    })
    request.on('error', (error) => {
      reject(error instanceof Error ? error : new Error('Could not read request body.'))
    })
  })
}

function isValidImagePayload(image: SerializedImage) {
  if (
    typeof image.dataUrl !== 'string' ||
    typeof image.mimeType !== 'string' ||
    typeof image.size !== 'number'
  ) {
    return false
  }

  if (!SUPPORTED_IMAGE_TYPES.has(image.mimeType)) return false
  if (image.size <= 0 || image.size > MAX_IMAGE_SIZE_BYTES) return false

  return image.dataUrl.startsWith(`data:${image.mimeType};base64,`)
}

function isRealAiEnabled(env: Record<string, string | undefined>) {
  return (
    env.NEXROOM_REAL_AI === 'true' ||
    env.NEXROOM_ENABLE_REAL_AI === 'true' ||
    env.ENABLE_REAL_AI === 'true'
  )
}

function logServerError(message: string, error?: unknown) {
  const detail = error instanceof Error ? error.message : undefined
  console.warn(`[NEXROOM analyze-room] ${message}${detail ? `: ${detail}` : ''}`)
}

function extractTextFromOpenAIResponse(value: unknown): string | null {
  if (!isRecord(value)) return null
  const response = value as AiResponseBody
  if (typeof response.output_text === 'string') return response.output_text

  const output = response.output
  if (!Array.isArray(output)) return null

  for (const item of output) {
    if (!Array.isArray(item.content)) continue
    for (const content of item.content) {
      if (typeof content.refusal === 'string') return null
      if (typeof content.text === 'string') {
        return content.text
      }
    }
  }

  return null
}

function hasUsableAiResult(value: Partial<RoomAnalysisResult>) {
  return (
    typeof value.detectedRoom === 'string' &&
    typeof value.summary === 'string' &&
    typeof value.nextAction === 'string' &&
    Array.isArray(value.recommendations) &&
    value.recommendations.length > 0
  )
}

function toNumber(value: unknown, fallback: number, min = 0, max = 100) {
  return typeof value === 'number' && Number.isFinite(value)
    ? clamp(value, min, max)
    : fallback
}

function mergeAiResult(parsed: Partial<RoomAnalysisResult>, fallback: RoomAnalysisResult): RoomAnalysisResult {
  const recommendations = Array.isArray(parsed.recommendations)
    ? parsed.recommendations.slice(0, 6).map((item, index) => ({
        ...fallback.recommendations[index % fallback.recommendations.length],
        ...item,
      }))
    : fallback.recommendations

  const suggestedFurniture = Array.isArray(parsed.suggestedFurniture)
    ? parsed.suggestedFurniture.slice(0, 6).map((item, index) => ({
        ...recommendations[index % recommendations.length],
        ...item,
      }))
    : recommendations

  return {
    ...fallback,
    detectedRoom: typeof parsed.detectedRoom === 'string' ? parsed.detectedRoom : fallback.detectedRoom,
    estimatedSize: typeof parsed.estimatedSize === 'string' ? parsed.estimatedSize : fallback.estimatedSize,
    lightingQuality: typeof parsed.lightingQuality === 'string' ? parsed.lightingQuality : fallback.lightingQuality,
    styleCues: typeof parsed.styleCues === 'string' ? parsed.styleCues : fallback.styleCues,
    dominantColors: isStringArray(parsed.dominantColors) ? parsed.dominantColors : fallback.dominantColors,
    emptySpaces: isStringArray(parsed.emptySpaces) ? parsed.emptySpaces : fallback.emptySpaces,
    spaceProblems: isStringArray(parsed.spaceProblems) ? parsed.spaceProblems : fallback.spaceProblems,
    missingFurniture: isStringArray(parsed.missingFurniture) ? parsed.missingFurniture : fallback.missingFurniture,
    clutterLevel: typeof parsed.clutterLevel === 'string' ? parsed.clutterLevel : fallback.clutterLevel,
    budgetFit: typeof parsed.budgetFit === 'string' ? parsed.budgetFit : fallback.budgetFit,
    budgetEstimate: {
      ...fallback.budgetEstimate,
      ...parsed.budgetEstimate,
      currency: 'EUR',
    },
    confidence: toNumber(parsed.confidence, fallback.confidence),
    summary: typeof parsed.summary === 'string' ? parsed.summary : fallback.summary,
    nextAction: typeof parsed.nextAction === 'string' ? parsed.nextAction : fallback.nextAction,
    recommendations,
    source: 'ai',
    roomAnalysis: {
      ...fallback.roomAnalysis,
      ...parsed.roomAnalysis,
      inputType: fallback.roomAnalysis.inputType,
      emptyZones: Array.isArray(parsed.roomAnalysis?.emptyZones)
        ? parsed.roomAnalysis.emptyZones
        : fallback.roomAnalysis.emptyZones,
      obstacles: Array.isArray(parsed.roomAnalysis?.obstacles)
        ? parsed.roomAnalysis.obstacles
        : fallback.roomAnalysis.obstacles,
      measurements: {
        ...fallback.roomAnalysis.measurements,
        ...parsed.roomAnalysis?.measurements,
        confidence: toNumber(
          parsed.roomAnalysis?.measurements?.confidence,
          fallback.roomAnalysis.measurements.confidence,
        ),
      },
      noPlacementZones: Array.isArray(parsed.roomAnalysis?.noPlacementZones)
        ? parsed.roomAnalysis.noPlacementZones
        : fallback.roomAnalysis.noPlacementZones,
    },
    userPreferences: fallback.userPreferences,
    layoutSuggestions: Array.isArray(parsed.layoutSuggestions)
      ? parsed.layoutSuggestions
      : fallback.layoutSuggestions,
    furniturePack: isRecord(parsed.furniturePack)
      ? { ...fallback.furniturePack, ...parsed.furniturePack }
      : fallback.furniturePack,
    suggestedFurniture,
    budgetBreakdown: isRecord(parsed.budgetBreakdown)
      ? { ...fallback.budgetBreakdown, ...parsed.budgetBreakdown, currency: 'EUR' }
      : fallback.budgetBreakdown,
    analysisSteps: Array.isArray(parsed.analysisSteps) ? parsed.analysisSteps : fallback.analysisSteps,
    visualMockupPlan: isRecord(parsed.visualMockupPlan)
      ? { ...fallback.visualMockupPlan, ...parsed.visualMockupPlan }
      : fallback.visualMockupPlan,
    beforeAfterPrompt: typeof parsed.beforeAfterPrompt === 'string'
      ? parsed.beforeAfterPrompt
      : fallback.beforeAfterPrompt,
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : fallback.warnings,
    commercialSummary: isRecord(parsed.commercialSummary)
      ? { ...fallback.commercialSummary, ...parsed.commercialSummary }
      : fallback.commercialSummary,
    nextActions: isStringArray(parsed.nextActions) ? parsed.nextActions : fallback.nextActions,
    projectMemory: fallback.projectMemory,
    videoAnalysis: fallback.videoAnalysis,
    imageSrc: '',
  }
}

function extractJsonCandidate(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1)
  }

  return null
}

function normalizeAIResponse(text: string, fallback: RoomAnalysisResult): RoomAnalysisResult {
  try {
    const candidate = extractJsonCandidate(text)
    if (!candidate) return fallback

    const parsed = JSON.parse(candidate) as Partial<RoomAnalysisResult>
    if (!hasUsableAiResult(parsed)) return fallback

    return mergeAiResult(parsed, fallback)
  } catch {
    return fallback
  }
}

function createRoomAnalysisJsonSchema() {
  const score = { type: 'number', minimum: 0, maximum: 100 }
  const textArray = { type: 'array', items: { type: 'string' } }
  const dimensions = {
    type: 'object',
    properties: {
      widthCm: { type: 'number' },
      depthCm: { type: 'number' },
      heightCm: { type: 'number' },
      diameterCm: { type: 'number' },
      notes: { type: 'string' },
    },
    additionalProperties: false,
  }
  const store = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      productUrl: { type: 'string' },
      availability: { type: 'string', enum: ['inStock', 'lowStock', 'outOfStock', 'unknown'] },
      estimatedDeliveryDays: { type: 'number' },
    },
    required: ['name', 'availability'],
    additionalProperties: false,
  }
  const alternative = {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['cheaper', 'premium', 'otherColor', 'smallSpace', 'otherStore'] },
      id: { type: 'string' },
      name: { type: 'string' },
      price: { type: 'number' },
      dimensions,
      store,
      imageUrl: { type: 'string' },
      color: { type: 'string' },
      reason: { type: 'string' },
    },
    required: ['type', 'id', 'name', 'price', 'dimensions', 'store', 'reason'],
    additionalProperties: false,
  }
  const recommendation = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      title: { type: 'string' },
      category: { type: 'string' },
      price: { type: 'number' },
      quantity: { type: 'number' },
      dimensions,
      store,
      productUrl: { type: 'string' },
      imageUrl: { type: 'string' },
      styleTags: textArray,
      color: { type: 'string' },
      reason: { type: 'string' },
      priority: { type: 'string', enum: ['essential', 'recommended', 'optional'] },
      status: { type: 'string', enum: ['budgetFriendly', 'smartFit', 'styleMatch'] },
      fitScore: score,
      styleScore: score,
      budgetScore: score,
      practicalityScore: score,
      overallScore: score,
      match: score,
      imageType: { type: 'string', enum: ['desk', 'lamp', 'storage'] },
      alternatives: { type: 'array', items: alternative },
      placementAdvice: { type: 'string' },
      budgetWarning: { type: 'string' },
    },
    required: [
      'id',
      'name',
      'title',
      'category',
      'price',
      'quantity',
      'dimensions',
      'store',
      'styleTags',
      'color',
      'reason',
      'priority',
      'status',
      'fitScore',
      'styleScore',
      'budgetScore',
      'practicalityScore',
      'overallScore',
      'match',
      'imageType',
      'alternatives',
    ],
    additionalProperties: false,
  }

  return {
    type: 'object',
    properties: {
      detectedRoom: { type: 'string' },
      estimatedSize: { type: 'string' },
      lightingQuality: { type: 'string' },
      styleCues: { type: 'string' },
      dominantColors: textArray,
      emptySpaces: textArray,
      spaceProblems: textArray,
      missingFurniture: textArray,
      clutterLevel: { type: 'string' },
      budgetFit: { type: 'string' },
      budgetEstimate: {
        type: 'object',
        properties: {
          min: { type: 'number' },
          max: { type: 'number' },
          currency: { type: 'string', enum: ['EUR'] },
        },
        required: ['min', 'max', 'currency'],
        additionalProperties: false,
      },
      confidence: score,
      summary: { type: 'string' },
      nextAction: { type: 'string' },
      recommendations: { type: 'array', minItems: 1, items: recommendation },
      roomAnalysis: {
        type: 'object',
        properties: {
          detectedRoomType: { type: 'string' },
          layoutSummary: { type: 'string' },
          naturalLight: { type: 'string' },
          currentColors: textArray,
          currentStyle: { type: 'string' },
          existingFurniture: textArray,
          measurements: {
            type: 'object',
            properties: {
              approximateAreaM2: { type: 'number' },
              widthCm: { type: 'number' },
              lengthCm: { type: 'number' },
              ceilingHeightCm: { type: 'number' },
              confidence: score,
              notes: { type: 'string' },
            },
            required: ['confidence'],
            additionalProperties: false,
          },
        },
        required: [
          'detectedRoomType',
          'layoutSummary',
          'naturalLight',
          'currentColors',
          'currentStyle',
          'existingFurniture',
          'measurements',
        ],
        additionalProperties: true,
      },
      layoutSuggestions: { type: 'array', items: { type: 'object', additionalProperties: true } },
      furniturePack: { type: 'object', additionalProperties: true },
      suggestedFurniture: { type: 'array', items: recommendation },
      budgetBreakdown: { type: 'object', additionalProperties: true },
      analysisSteps: { type: 'array', items: { type: 'object', additionalProperties: true } },
      visualMockupPlan: { type: 'object', additionalProperties: true },
      beforeAfterPrompt: { type: 'string' },
      warnings: { type: 'array', items: { type: 'object', additionalProperties: true } },
      commercialSummary: { type: 'object', additionalProperties: true },
      nextActions: textArray,
    },
    required: [
      'detectedRoom',
      'estimatedSize',
      'lightingQuality',
      'styleCues',
      'dominantColors',
      'emptySpaces',
      'spaceProblems',
      'missingFurniture',
      'clutterLevel',
      'budgetFit',
      'budgetEstimate',
      'confidence',
      'summary',
      'nextAction',
      'recommendations',
    ],
    additionalProperties: true,
  }
}

function createAiInstructions(context: RoomAnalysisClientContext, fallback: RoomAnalysisResult) {
  const language = isSpanish(resolveLanguage(context)) ? 'Spanish' : 'English'

  return [
    `Return visible customer-facing text in ${language}.`,
    'You are an expert in interior design, furniture ecommerce, room layout, visual composition, and premium shopping experiences.',
    'Analyze the real room image as an interior planning and shopping assistant.',
    'Focus on turning the room into a practical, attractive, budget-aware room pack.',
    'Detect room type, layout, lighting, current style, visible furniture, empty zones, obstacles, space problems, and improvement opportunities.',
    'Recommend color palette, materials, furniture categories, layout improvements, and shoppable room-pack priorities.',
    'Do not claim exact measurements unless they are clearly visible. Use cautious approximations when needed.',
    'Do not claim facts that cannot be verified from the image.',
    'Recommend furniture categories and product-like placeholders that can later be replaced by real catalog items.',
    'Do not invent real store links, real product URLs, or claims of live availability.',
    'Use the provided user preferences and budget when ranking recommendations.',
    'Keep all scores between 0 and 100.',
    'Return strict JSON only. Do not return markdown, comments, or prose outside JSON.',
    JSON.stringify({
      userPreferences: context,
      fallbackLabels: {
        basicPackTitle: fallback.furniturePack.basic.title,
        recommendedPackTitle: fallback.furniturePack.recommended.title,
        premiumPackTitle: fallback.furniturePack.premium.title,
      },
      requiredCommercialGoal: 'Help the user understand the best next room pack to buy or compare.',
    }),
  ].join('\n')
}

async function analyzeWithOpenAI(
  image: SerializedImage,
  context: RoomAnalysisClientContext,
  apiKey: string,
): Promise<RoomAnalysisResult> {
  const env = getEnv()
  const fallback = createMockAnalysis(context)
  if (!image.dataUrl) return fallback

  const model = env.OPENAI_MODEL || 'gpt-4.1-mini'
  const instructions = createAiInstructions(context, fallback)

  let response: Response
  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        text: {
          format: {
            type: 'json_schema',
            name: 'nexroom_room_analysis',
            strict: false,
            schema: createRoomAnalysisJsonSchema(),
          },
        },
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: instructions },
              {
                type: 'input_text',
                text: JSON.stringify({
                  context,
                  constraints: context.constraints,
                  currentFallback: {
                    detectedRoom: fallback.detectedRoom,
                    estimatedSize: fallback.estimatedSize,
                    lightingQuality: fallback.lightingQuality,
                    budgetFit: fallback.budgetFit,
                    recommendationCount: fallback.recommendations.length,
                  },
                  commerceRule: 'Use placeholders for store/productUrl/imageUrl until a real catalog is connected.',
                  expectedRecommendationFields: [
                    'id',
                    'name',
                    'category',
                    'price',
                    'dimensions',
                    'store',
                    'productUrl',
                    'imageUrl',
                    'styleTags',
                    'color',
                    'reason',
                    'priority',
                    'fitScore',
                    'styleScore',
                    'budgetScore',
                    'practicalityScore',
                    'overallScore',
                    'alternatives',
                  ],
                }),
              },
      { type: 'input_image', image_url: image.dataUrl, detail: 'high' },
            ],
          },
        ],
      }),
    })
  } catch (error) {
    logServerError('OpenAI request failed; using fallback', error)
    return fallback
  }

  if (!response.ok) {
    logServerError(`OpenAI returned ${response.status}; using fallback`)
    return fallback
  }

  const data = (await response.json().catch(() => null)) as unknown
  const text = extractTextFromOpenAIResponse(data)
  return text ? normalizeAIResponse(text, fallback) : fallback
}

export default async function handler(request: ServerlessRequest, response: ServerlessResponse) {
  response.setHeader?.('Cache-Control', 'no-store')

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const env = getEnv()
    const payload = await readJsonBody(request)
    const context = normalizeContext(payload.context)
    const image = isRecord(payload.image) ? payload.image : {}
    const apiKey = env.OPENAI_API_KEY || env.AI_API_KEY
    const realAiEnabled = isRealAiEnabled(env)

    if (!apiKey || !realAiEnabled || !isValidImagePayload(image)) {
      response.status(200).json(createMockAnalysis(context) as unknown as JsonValue)
      return
    }

    const result = await analyzeWithOpenAI(image, context, apiKey)
    response.status(200).json(result as unknown as JsonValue)
  } catch (error) {
    logServerError('Unexpected handler failure; using fallback', error)
    response.status(200).json(createMockAnalysis() as unknown as JsonValue)
  }
}
