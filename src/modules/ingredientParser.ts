import type { IngredientUnit, IngredientGroup, IngredientDBEntry } from '../types/recipe'
import { matchIngredient } from './ingredientMatcher'

export interface ParsedIngredient {
  rawName: string
  amount: number
  unit: IngredientUnit
  matched: IngredientDBEntry | null
  confidence: number
  group: IngredientGroup
}

const UNIT_MAP: Record<string, IngredientUnit> = {
  'g': 'g', 'gram': 'g', 'gramu': 'g', 'gramy': 'g', 'gramů': 'g',
  'kg': 'kg', 'kilogram': 'kg', 'kilogramy': 'kg', 'kilogramů': 'kg',
  'ml': 'ml', 'mililitr': 'ml', 'mililitry': 'ml', 'mililitrů': 'ml',
  'l': 'l', 'litr': 'l', 'litru': 'l', 'litry': 'l', 'litrů': 'l',
  'dl': 'ml',
  'lžíce': 'lžíce', 'lžic': 'lžíce', 'lžici': 'lžíce', 'lžíci': 'lžíce', 'polévková lžíce': 'lžíce',
  'lžička': 'lžička', 'lžičky': 'lžička', 'lžičku': 'lžička', 'lžičce': 'lžička', 'čajová lžička': 'lžička',
  'ks': 'ks', 'kus': 'ks', 'kusy': 'ks', 'kusů': 'ks', 'kousků': 'ks', 'stroužek': 'ks', 'stroužků': 'ks',
  'm': 'm', 'metr': 'm', 'metry': 'm', 'metrů': 'm', 'cm': 'm',
  '%': '%',
}

// Množitelé: dl → ml (×100), cm → m (×0.01)
const UNIT_MULTIPLIER: Partial<Record<string, number>> = { 'dl': 100, 'cm': 0.01 }

const UNIT_PATTERN = Object.keys(UNIT_MAP)
  .sort((a, b) => b.length - a.length)
  .map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|')

const LINE_RE = new RegExp(
  `^\\s*(\\d+[,.]?\\d*)\\s*(${UNIT_PATTERN})\\s+(.+)$|^(.+?)\\s+(\\d+[,.]?\\d*)\\s*(${UNIT_PATTERN})\\s*$`,
  'i'
)

function parseAmount(s: string): number {
  return parseFloat(s.replace(',', '.'))
}

// Předzpracování řádku před parsováním
function preprocessLine(line: string): string {
  let s = line.trim()
  // Odstranit úvodní odrážky: "- ", "• ", "* "
  s = s.replace(/^[-–•*]\s+/, '')
  // Závorky se stručnou poznámkou (max ~100 znaků) — "doporučuji 15g", "plec, krkovice..."
  s = s.replace(/\s*\([^)]{0,120}\)/g, '')
  // Tisíce oddělené mezerou: "7 400 g" → "7400 g"
  s = s.replace(/(\d{1,3})\s+(\d{3})(?=\s*(?:g|kg|ml|l|dl|ks|m|%)(\b|$))/gi, '$1$2')
  // Smíšené zlomky: "1 1/2" → "1.5"
  s = s.replace(/\b(\d+)\s+(\d+)\/(\d+)\b/g, (_, w, n, d) => {
    const val = Number(w) + Number(n) / Number(d)
    return String(Math.round(val * 100) / 100)
  })
  // Jednoduché zlomky: "1/2" → "0.5"
  s = s.replace(/\b(\d+)\/(\d+)\b/g, (_, n, d) => {
    const val = Number(n) / Number(d)
    return String(Math.round(val * 100) / 100)
  })
  return s.replace(/\s+/g, ' ').trim()
}

// Rozvinout české zkratky v názvu suroviny
function expandAbbreviations(name: string): string {
  return name
    .replace(/\bml\.\s*/gi, 'mletý ')       // ml. = mletý (drcený)
    .replace(/\bdrc\.\s*/gi, 'drcený ')     // Drc. = drcený
    .replace(/\bgran\.\s*/gi, 'granulovaný ')
    .replace(/\bsuš\.\s*/gi, 'sušený ')
    .replace(/\bmušk?\.\s*/gi, 'muškátový ')  // mušk. i muš.
    .replace(/\bhov\.\s*/gi, 'hovězí ')
    .replace(/\bvepř\.\s*/gi, 'vepřový ')
    .replace(/\bč\.\s*/gi, 'černý ')        // č. pepř = černý pepř
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseIngredientLine(
  line: string,
  customDB: IngredientDBEntry[] = []
): ParsedIngredient | null {
  const preprocessed = preprocessLine(line)
  if (!preprocessed) return null

  const m = LINE_RE.exec(preprocessed)
  if (!m) return null

  let amount: number
  let unitKey: string
  let rawName: string

  if (m[1] !== undefined) {
    // Formát: "100 g pepř černý"
    amount = parseAmount(m[1])
    unitKey = m[2].toLowerCase()
    rawName = m[3].trim()
  } else {
    // Formát: "pepř černý 100 g"
    rawName = m[4].trim()
    amount = parseAmount(m[5])
    unitKey = m[6].toLowerCase()
  }

  const unit: IngredientUnit = UNIT_MAP[unitKey] ?? 'g'
  const multiplier = UNIT_MULTIPLIER[unitKey]
  if (multiplier) amount = amount * multiplier

  rawName = expandAbbreviations(rawName)

  const matches = matchIngredient(rawName, customDB)
  const best = matches[0] ?? null

  return {
    rawName,
    amount,
    // % unit má semantický význam pro kalkulátor — zachovat vždy
    unit: (unit === '%' || !best) ? unit : best.entry.defaultUnit,
    matched: best?.entry ?? null,
    confidence: best?.confidence ?? 0,
    group: best?.entry.group ?? 'ostatní',
  }
}

export function parseIngredientText(
  text: string,
  customDB: IngredientDBEntry[] = []
): ParsedIngredient[] {
  return text
    .split('\n')
    .map((line) => parseIngredientLine(line, customDB))
    .filter((p): p is ParsedIngredient => p !== null)
}
