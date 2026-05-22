import { INGREDIENT_DB } from '../data/ingredientDB'
import type { IngredientDBEntry } from '../types/recipe'

export interface MatchResult {
  entry: IngredientDBEntry
  confidence: number
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

export function matchIngredient(
  rawName: string,
  customDB: IngredientDBEntry[] = []
): MatchResult[] {
  const norm = normalize(rawName)
  const allDB = [...customDB, ...INGREDIENT_DB]
  const results: MatchResult[] = []

  for (const entry of allDB) {
    const normName = normalize(entry.name)
    const normAliases = entry.aliases.map(normalize)

    let confidence = 0

    if (norm === normName) {
      confidence = 1.0
    } else if (normAliases.includes(norm)) {
      confidence = 0.92
    } else if (normName.startsWith(norm) || norm.startsWith(normName)) {
      confidence = 0.80
    } else if (normAliases.some((a) => a.startsWith(norm) || norm.startsWith(a))) {
      confidence = 0.72
    } else {
      // Token matching: significant words from rawName exactly match canonical name/alias
      const tokens = norm.split(/\s+/).filter((t) => t.length >= 4)
      if (tokens.length > 0 && tokens.includes(normName)) {
        confidence = 0.75
      } else if (tokens.length > 0 && tokens.some((t) => normAliases.includes(t))) {
        confidence = 0.68
      } else if (normName.includes(norm) || norm.includes(normName)) {
        confidence = 0.60
      } else if (normAliases.some((a) => a.includes(norm) || norm.includes(a))) {
        confidence = 0.52
      } else if (norm.length > 4) {
        const minDist = Math.min(
          levenshtein(norm, normName),
          ...normAliases.map((a) => levenshtein(norm, a))
        )
        if (minDist <= 2) {
          confidence = 0.35
        }
      }
    }

    if (confidence > 0) {
      results.push({ entry, confidence })
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
}
