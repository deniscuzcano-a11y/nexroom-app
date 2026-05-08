export type RoomAnalysisSource = 'mock' | 'ai'

export type CurrencyCode = 'EUR'

export type RoomInputType = 'photo' | 'video' | 'multiFrame'

export type FurniturePriority = 'essential' | 'recommended' | 'optional'

export type FurnitureAlternativeType =
  | 'cheaper'
  | 'premium'
  | 'otherColor'
  | 'smallSpace'
  | 'otherStore'

export type FurnitureAvailability = 'inStock' | 'lowStock' | 'outOfStock' | 'unknown'

export type FurniturePackTier = 'basic' | 'recommended' | 'premium'

export type UserRiskLevel = 'conservative' | 'balanced' | 'bold'

export type UserShoppingPriority = 'cheap' | 'beautiful' | 'functional' | 'premium'

export type RoomAnalysisRecommendationStatus =
  | 'budgetFriendly'
  | 'smartFit'
  | 'styleMatch'

export type RoomAnalysisRecommendationImageType = 'desk' | 'lamp' | 'storage'

export interface FurnitureDimensions {
  widthCm?: number
  depthCm?: number
  heightCm?: number
  diameterCm?: number
  notes?: string
}

export interface RoomMeasurements {
  approximateAreaM2?: number
  widthCm?: number
  lengthCm?: number
  ceilingHeightCm?: number
  confidence: number
  notes?: string
}

export interface RoomBoundaryElement {
  id: string
  type: 'door' | 'window' | 'radiator' | 'socket' | 'fixedFurniture' | 'unknown'
  label: string
  position?: string
  avoidPlacementRadiusCm?: number
  confidence: number
}

export interface RoomZone {
  id: string
  label: string
  purpose: string
  placementAdvice: string
  avoidFurniture?: boolean
  approximateSize?: FurnitureDimensions
  confidence: number
}

export interface RoomAnalysisDetails {
  inputType: RoomInputType
  detectedRoomType: string
  layoutSummary: string
  naturalLight: string
  currentColors: string[]
  currentStyle: string
  existingFurniture: string[]
  emptyZones: RoomZone[]
  obstacles: RoomBoundaryElement[]
  measurements: RoomMeasurements
  noPlacementZones: RoomZone[]
}

export interface RoomConstraintSet {
  maxBudget?: number
  maxFurnitureDimensions?: FurnitureDimensions
  forbiddenColors?: string[]
  preferredStores?: string[]
  avoidOversizedFurniture?: boolean
  needsStorage?: boolean
  needsDesk?: boolean
  smallRoomFriendly?: boolean
  rentalFriendlyNoDrilling?: boolean
  requiredClearanceCm?: number
}

export interface UserProfilePreferences {
  favoriteStyle?: string
  favoriteStores?: string[]
  usualBudget?: number
  preferredColors?: string[]
  riskLevel?: UserRiskLevel
  priority?: UserShoppingPriority
}

export interface RoomAnalysisClientContext {
  budget: number
  language?: string
  locale?: string
  roomSize?: string
  roomType?: string
  selectedNeeds?: string[]
  style?: string
  colorPalette?: string
  desiredTier?: FurniturePackTier
  constraints?: RoomConstraintSet
  userProfile?: UserProfilePreferences
  inputType?: RoomInputType
  projectId?: string
  roomVersionId?: string
}

export interface FurnitureStoreInfo {
  name: string
  productUrl?: string
  availability: FurnitureAvailability
  estimatedDeliveryDays?: number
}

export interface FurnitureAlternative {
  type: FurnitureAlternativeType
  id: string
  name: string
  price: number
  dimensions: FurnitureDimensions
  store: FurnitureStoreInfo
  imageUrl?: string
  color?: string
  reason: string
}

export interface RoomAnalysisRecommendation {
  id: string
  name: string
  title: string
  category: string
  price: number
  quantity: number
  dimensions: FurnitureDimensions
  store: FurnitureStoreInfo
  productUrl?: string
  imageUrl?: string
  styleTags: string[]
  color: string
  reason: string
  priority: FurniturePriority
  status: RoomAnalysisRecommendationStatus
  fitScore: number
  styleScore: number
  budgetScore: number
  practicalityScore: number
  overallScore: number
  match: number
  imageType: RoomAnalysisRecommendationImageType
  alternatives: FurnitureAlternative[]
  placementAdvice?: string
  budgetWarning?: string
}

export interface LayoutSuggestion {
  id: string
  zoneId?: string
  title: string
  description: string
  clearanceRequirementCm?: number
  doNotPlaceNear?: string[]
  relatedFurnitureIds: string[]
}

export interface BudgetBreakdown {
  currency: CurrencyCode
  maxBudget: number
  estimatedTotal: number
  budgetUsedPercent: number
  remainingBudget: number
  byCategory: Array<{
    category: string
    total: number
  }>
  byStore: Array<{
    store: string
    total: number
    itemCount: number
  }>
  overBudgetItems: string[]
  estimatedSavings?: number
}

export interface FurniturePack {
  id: string
  tier: FurniturePackTier
  title: string
  summary: string
  productIds: string[]
  totalPrice: number
  pros: string[]
  cons: string[]
  visualTransformationLevel: number
  purchasePriority: string[]
}

export interface FurniturePackSet {
  basic: FurniturePack
  recommended: FurniturePack
  premium: FurniturePack
}

export interface AnalysisStep {
  id: string
  label: string
  status: 'complete' | 'partial' | 'mock'
  confidence: number
}

export interface AnalysisWarning {
  id: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  relatedProductId?: string
  suggestedAction?: string
}

export interface VisualMockupPlan {
  roomZones: RoomZone[]
  placementInstructions: Array<{
    productId: string
    zoneId: string
    instruction: string
    anchor?: string
  }>
  overlayLabels: Array<{
    label: string
    zoneId?: string
    productId?: string
  }>
  beforeAfterPrompt: string
}

export interface CommercialSummary {
  packTitle: string
  readyRoomSummary: string
  recommendedCta: string
  essentialProductIds: string[]
  optionalProductIds: string[]
  estimatedSavings: number
  budgetUsedPercent: number
}

export interface RoomProjectMemory {
  projectId?: string
  roomVersionId?: string
  canSaveRoom: boolean
  comparableVersionIds: string[]
  regenerationOptions: Array<{
    label: string
    contextPatch: Partial<RoomAnalysisClientContext>
  }>
}

export interface VideoAnalysisPreparation {
  multipleFrames: boolean
  roomAngles: string[]
  detectedObjectsAcrossFrames: string[]
  confidenceByFrame: Array<{
    frameId: string
    confidence: number
  }>
}

export interface RoomAnalysisResult {
  imageSrc: string
  detectedRoom: string
  estimatedSize: string
  lightingQuality: string
  styleCues: string
  dominantColors: string[]
  emptySpaces: string[]
  spaceProblems: string[]
  missingFurniture: string[]
  clutterLevel: string
  budgetFit: string
  budgetEstimate: {
    min: number
    max: number
    currency: CurrencyCode
  }
  confidence: number
  summary: string
  nextAction: string
  recommendations: RoomAnalysisRecommendation[]
  source: RoomAnalysisSource
  roomAnalysis: RoomAnalysisDetails
  userPreferences: RoomAnalysisClientContext
  layoutSuggestions: LayoutSuggestion[]
  furniturePack: FurniturePackSet
  suggestedFurniture: RoomAnalysisRecommendation[]
  budgetBreakdown: BudgetBreakdown
  analysisSteps: AnalysisStep[]
  visualMockupPlan: VisualMockupPlan
  beforeAfterPrompt: string
  warnings: AnalysisWarning[]
  commercialSummary: CommercialSummary
  nextActions: string[]
  projectMemory: RoomProjectMemory
  videoAnalysis: VideoAnalysisPreparation
}

export interface RoomAnalysisMockText {
  labels: {
    futureCatalog: string
    alternativeFutureStore: string
    dimensionsNote: string
    productUrlPlaceholder?: string
    placementAdvice: string
  }
  errors: {
    invalidImage: string
    imageTooLarge: string
    readFailure: string
  }
  alternatives: {
    cheaperSuffix: string
    premiumSuffix: string
    smallSpaceSuffix: string
    otherStoreSuffix: string
    cheaperReason: string
    premiumReason: string
    smallSpaceReason: string
    otherStoreReason: string
  }
  products: Array<{
    id: string
    name: string
    category: string
    reason: string
    color: string
    imageType: RoomAnalysisRecommendationImageType
    status: RoomAnalysisRecommendationStatus
    priority: FurniturePriority
    widthCm: number
    depthCm: number
    heightCm: number
    budgetRatio: number
    score: number
  }>
  packs: Record<FurniturePackTier, {
    id: string
    title: string
    summary: string
    pros: string[]
    cons: string[]
  }>
  room: {
    fallbackRoom: string
    fallbackStyle: string
    fallbackSize: string
    lighting: string
    styleCues: string
    colors: string[]
    spaceProblems: string[]
    missingFurniture: string[]
    clutterLevel: string
    budgetFitTight: string
    budgetFitBalanced: string
    budgetFitPremium: string
    summary: string
    nextAction: string
    layoutSummary: string
    naturalLight: string
    existingFurniture: string
    measurementNotes: string
  }
  zones: {
    mainWallLabel: string
    mainWallPurpose: string
    mainWallAdvice: string
    circulationLabel: string
    circulationPurpose: string
    circulationAdvice: string
  }
  obstacles: {
    windowLabel: string
  }
  layoutSuggestion: {
    title: string
    description: string
  }
  visualMockupPlan: {
    storageInstruction: string
    lampInstruction: string
    storageLabel: string
    clearanceLabel: string
    beforeAfterPrompt: string
  }
  commercialSummary: {
    packTitle: string
    readyRoomSummary: string
    recommendedCta: string
  }
  warnings: {
    measurements: string
    measurementsAction: string
    lightColor: string
  }
  analysisSteps: {
    room: string
    layout: string
    pack: string
  }
  nextActions: {
    saveVersion: string
    comparePacks: string
    regenerateBudget: string
  }
  regeneration: {
    lowerBudget: string
    upgradePremium: string
  }
}
