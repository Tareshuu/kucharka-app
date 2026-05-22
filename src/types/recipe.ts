export type IngredientUnit = 'g' | 'kg' | 'ml' | 'l' | 'lžíce' | 'lžička' | 'ks' | 'm' | '%'

export type IngredientGroup = 'maso' | 'solanky' | 'koření' | 'střívka' | 'přísady' | 'ostatní'

export type RecipeCategory = 'klobasy' | 'maso' | 'susene' | 'salamy' | 'ostatni' | (string & Record<never, never>)

export type RecipeDifficulty = 1 | 2 | 3

export interface RecipeMeta {
  title: string
  category: RecipeCategory
  description: string
  baseWeight: number        // gramů — základ pro přepočet
  yieldWeight?: number      // gramů — výsledná hmotnost hotového výrobku
  tags: string[]
  starred: boolean
  difficulty?: RecipeDifficulty
  smokingTemp?: number      // °C
  smokingDuration?: number  // minuty
}

export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: IngredientUnit
  group: IngredientGroup
  dbId?: string             // odkaz na ingredientDB pokud matchováno
}

export interface ProcessStep {
  id: string
  order: number
  title?: string
  description: string
  duration?: number         // minuty
  temperature?: number      // °C
}

export interface RecipePhoto {
  id: string
  dataUrl: string           // Base64 JPEG
  caption?: string
  isPrimary: boolean
}

export interface Recipe {
  id: string
  meta: RecipeMeta
  ingredients: Ingredient[]
  process: ProcessStep[]
  notes: string
  photos: RecipePhoto[]
  sourceType: 'manual' | 'pdf' | 'photo'
  createdAt: string
  updatedAt: string
}

export interface CustomCategory {
  id: string
  name: string
  icon: string
}

export interface IngredientDBEntry {
  id: string
  name: string
  aliases: string[]
  defaultUnit: IngredientUnit
  group: IngredientGroup
}

export const BUILT_IN_CATEGORIES: {
  id: string
  name: string
  icon: string
  color: [string, string]
}[] = [
  { id: 'klobasy', name: 'Klobásy',          icon: '🌭', color: ['#c0392b', '#922b21'] },
  { id: 'maso',    name: 'Uzené maso',        icon: '🥩', color: ['#8B4513', '#5D2E0C'] },
  { id: 'susene',  name: 'Sušené výrobky',    icon: '🥓', color: ['#D4AC0D', '#9A7D0A'] },
  { id: 'salamy',  name: 'Salámy',            icon: '🍖', color: ['#7B1B2E', '#4A1020'] },
  { id: 'ostatni', name: 'Ostatní výrobky',   icon: '🫙', color: ['#4A6480', '#2C3D4F'] },
]

export const DIFFICULTY_LABEL: Record<RecipeDifficulty, string> = {
  1: 'Snadný',
  2: 'Střední',
  3: 'Pokročilý',
}

export const GROUP_LABEL: Record<IngredientGroup, string> = {
  maso:     'Maso',
  solanky:  'Solanky a sůl',
  koření:   'Koření',
  střívka:  'Střívka',
  přísady:  'Přísady',
  ostatní:  'Ostatní',
}
