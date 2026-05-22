export type SmokingResult = 1 | 2 | 3 | 4 | 5

export interface SmokingSession {
  id: string
  date: string               // 'YYYY-MM-DD'
  recipeId?: string
  recipeTitle: string
  wood: string
  weightKg: number           // hmotnost před
  weightAfterKg?: number     // hmotnost po sušení
  smokingTempC: number       // teplota uzení (°C)
  smokingDurationH: number   // doba uzení (hodiny)
  dryingDurationDays?: number
  result: SmokingResult
  notes: string
  createdAt: string
}

export const WOOD_OPTIONS = [
  'Buk',
  'Dub',
  'Třešeň',
  'Jablko',
  'Švestka',
  'Hruška',
  'Olše',
  'Hickory',
  'Mesquite',
] as const
