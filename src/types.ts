export type StyleKey = 'modern' | 'scandinavian' | 'japandi' | 'minimalist' | 'luxury' | 'cozy'
export type NeedKey = 'bed' | 'desk' | 'lamp' | 'storage'
export type RoomTypeKey = 'bedroom' | 'livingroom' | 'gaming' | 'office' | 'studio'
export type RoomSizeKey = 'small' | 'medium' | 'large' | 'xl'
export type ColorPaletteKey = 'neutral' | 'warm' | 'cool' | 'bold'
export type MoodKey = 'productive' | 'relaxing' | 'social' | 'creative' | 'minimal'
export type DemoStep = 1 | 2 | 3

export interface RoomAnalysis {
  imageSrc: string
  detectedRoom: string
  estimatedSize: string
  lightingQuality: string
  styleCues: string
  dominantColors: string[]
  missingFurniture: string[]
  clutterLevel: string
  budgetFit: string
  confidence: number
  summary: string
  nextAction: string
  recommendations: Array<{
    title: string
    price: number
    reason: string
    status: 'budgetFriendly' | 'smartFit' | 'styleMatch'
    match: number
    imageType: 'desk' | 'lamp' | 'storage'
  }>
}
