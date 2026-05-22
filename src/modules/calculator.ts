import type { Ingredient, IngredientUnit } from '../types/recipe'

export interface CalculatedIngredient extends Ingredient {
  displayAmount: number
  displayUnit: IngredientUnit
}

function roundSmart(amount: number, unit: IngredientUnit): number {
  if (unit === 'lžíce' || unit === 'lžička') {
    return Math.round(amount * 2) / 2  // zaokrouhlení na 0.5
  }
  if (unit === 'ks' || unit === 'm') {
    return Math.round(amount * 10) / 10
  }
  if (unit === 'g' || unit === 'ml') {
    return Math.round(amount * 10) / 10
  }
  if (unit === 'kg' || unit === 'l') {
    return Math.round(amount * 100) / 100
  }
  return Math.round(amount * 10) / 10
}

export function calculateIngredients(
  ingredients: Ingredient[],
  baseWeight: number,
  targetWeight: number
): CalculatedIngredient[] {
  const ratio = targetWeight / baseWeight

  return ingredients.map((ing) => {
    let displayAmount: number
    let displayUnit: IngredientUnit = ing.unit

    if (ing.unit === '%') {
      // procento z baseWeight → přepočítáme na gramy z targetWeight
      displayAmount = roundSmart((ing.amount / 100) * targetWeight, 'g')
      displayUnit = 'g'
    } else {
      displayAmount = roundSmart(ing.amount * ratio, ing.unit)
    }

    return { ...ing, displayAmount, displayUnit }
  })
}

export function formatAmount(amount: number, unit: IngredientUnit): string {
  if (unit === '%') return `${amount} %`
  if (unit === 'g' && amount >= 1000) {
    return `${(amount / 1000).toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} kg`
  }
  if (unit === 'ml' && amount >= 1000) {
    return `${(amount / 1000).toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} l`
  }
  return `${amount.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} ${unit}`
}
