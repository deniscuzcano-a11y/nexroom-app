import type {
  BudgetBreakdown,
  CommercialSummary,
  FurniturePackSet,
  RoomAnalysisClientContext,
  RoomAnalysisMockText,
  RoomAnalysisRecommendation,
  RoomAnalysisResult,
  VisualMockupPlan,
} from '../types/roomAnalysis'
import i18n from '../i18n'
import enTranslations from '../locales/en.json'
import esTranslations from '../locales/es.json'

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024

type SerializedImage = {
  dataUrl: string
  mimeType: string
  name: string
  size: number
}

type LocaleResource = {
  aiMock: RoomAnalysisMockText
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function resolveLanguage(context: RoomAnalysisClientContext) {
  return context.language || context.locale || i18n.language || 'en'
}

function isSpanish(language?: string) {
  return language?.toLowerCase().startsWith('es') ?? false
}

function getMockText(context: RoomAnalysisClientContext): RoomAnalysisMockText {
  return ((isSpanish(resolveLanguage(context)) ? esTranslations : enTranslations) as LocaleResource).aiMock
}

function fillTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{{${key}}}`, String(value)),
    template,
  )
}

function readFileAsDataUrl(file: File, readFailureMessage: string) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error(readFailureMessage))
    reader.readAsDataURL(file)
  })
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
      productUrl: undefined,
      availability: 'unknown',
      estimatedDeliveryDays: undefined,
    },
    productUrl: undefined,
    imageUrl: undefined,
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
        type: 'smallSpace',
        id: `${params.id}-compact`,
        name: `${params.name} - ${params.text.alternatives.smallSpaceSuffix}`,
        price: Math.round(params.price * 0.9),
        dimensions: {
          widthCm: Math.round(params.widthCm * 0.82),
          depthCm: Math.round(params.depthCm * 0.82),
          heightCm: params.heightCm,
        },
        store: { name: params.text.labels.futureCatalog, availability: 'unknown' },
        reason: params.text.alternatives.smallSpaceReason,
      },
    ],
    placementAdvice: params.text.labels.placementAdvice,
  }
}

function createPackSet(products: RoomAnalysisRecommendation[], budget: number, text: RoomAnalysisMockText): FurniturePackSet {
  const basicIds = products.slice(0, 2).map((item) => item.id)
  const recommendedIds = products.map((item) => item.id)
  const premiumPrice = Math.round(budget * 1.12)

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
      totalPrice: premiumPrice,
      pros: text.packs.premium.pros,
      cons: text.packs.premium.cons,
      visualTransformationLevel: 92,
      purchasePriority: recommendedIds,
    },
  }
}

function createBudgetBreakdown(products: RoomAnalysisRecommendation[], budget: number): BudgetBreakdown {
  const estimatedTotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const byCategory = products.map((item) => ({ category: item.category, total: item.price * item.quantity }))
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
    byCategory,
    byStore,
    overBudgetItems: products.filter((item) => item.price > budget).map((item) => item.id),
    estimatedSavings: Math.max(0, Math.round(budget * 0.12)),
  }
}

function createFallbackRoomAnalysis(
  imageSrc: string,
  context: RoomAnalysisClientContext = { budget: 1200 },
): RoomAnalysisResult {
  const text = getMockText(context)
  const budget = clamp(Math.round(context.budget || 1200), 150, 12000)
  const isPremium = budget >= 1800
  const isTight = budget < 650
  const roomLabel = context.roomType || text.room.fallbackRoom
  const styleLabel = context.style || text.room.fallbackStyle
  const estimateMin = Math.round((budget * (isTight ? 0.72 : 0.58)) / 5) * 5
  const estimateMax = Math.round((budget * (isPremium ? 0.92 : 0.86)) / 5) * 5
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
    beforeAfterPrompt: '',
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
    imageSrc,
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
    source: 'ai',
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
        approximateAreaM2: undefined,
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
      { id: 'step-room', label: text.analysisSteps.room, status: 'partial', confidence: 82 },
      { id: 'step-layout', label: text.analysisSteps.layout, status: 'partial', confidence: 68 },
      { id: 'step-pack', label: text.analysisSteps.pack, status: 'partial', confidence: 78 },
    ],
    visualMockupPlan,
    beforeAfterPrompt: '',
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

export async function analyzeRoomImage(
  file: File,
  context: RoomAnalysisClientContext = { budget: 1200 },
): Promise<RoomAnalysisResult> {
  const text = getMockText(context)
  if (!file.type.startsWith('image/')) {
    throw new Error(text.errors.invalidImage)
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(text.errors.imageTooLarge)
  }

  const dataUrl = await readFileAsDataUrl(file, text.errors.readFailure)
  const image: SerializedImage = {
    dataUrl,
    mimeType: file.type,
    name: file.name,
    size: file.size,
  }

  try {
    const response = await fetch('/api/analyze-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, context }),
    })

    if (!response.ok) {
      return createFallbackRoomAnalysis(dataUrl, context)
    }

    const result = (await response.json()) as RoomAnalysisResult
    return {
      ...result,
      imageSrc: dataUrl,
    }
  } catch {
    return createFallbackRoomAnalysis(dataUrl, context)
  }
}
