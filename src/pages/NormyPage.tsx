import { useState, useMemo } from 'react'
import { NORMY, NORM_CATEGORIES, BASE_WEIGHT_G } from '../data/normDB'
import type { MasnaVyrobkaNorma, NormIngredient } from '../data/normDB'
import type { Ingredient, IngredientUnit } from '../types/recipe'
import { calculateIngredients, formatAmount } from '../modules/calculator'
import { v4 as uuidv4 } from 'uuid'

const PRESETS_G = [1000, 2000, 5000, 10000, 20000]

const GROUP_LABEL: Record<NormIngredient['group'], string> = {
  suroviny: 'Suroviny',
  přísady: 'Přísady',
  obaly: 'Obaly',
}

function normIngToRecipeIng(ni: NormIngredient): Ingredient {
  const groupMap: Record<NormIngredient['group'], Ingredient['group']> = {
    suroviny: 'maso',
    přísady: 'přísady',
    obaly: 'střívka',
  }
  return {
    id: uuidv4(),
    name: ni.name,
    amount: ni.amount,
    unit: ni.unit as IngredientUnit,
    group: groupMap[ni.group],
  }
}

function NormCalculator({ norma }: { norma: MasnaVyrobkaNorma }) {
  const [targetWeight, setTargetWeight] = useState(5000)

  const withIngredients = norma.ingredients.filter(
    (i) => i.group === 'suroviny' || i.group === 'přísady'
  )
  const packaging = norma.ingredients.filter((i) => i.group === 'obaly')

  const recipeIngs = useMemo(
    () => withIngredients.map(normIngToRecipeIng),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [norma.id]
  )

  const calculated = useMemo(
    () => calculateIngredients(recipeIngs, BASE_WEIGHT_G, targetWeight),
    [recipeIngs, targetWeight]
  )

  function copyToClipboard() {
    const lines = [
      `${norma.name} — ${(targetWeight / 1000).toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} kg`,
      '',
      ...calculated.map((i) => `${i.name}: ${formatAmount(i.displayAmount, i.displayUnit)}`),
    ]
    void navigator.clipboard.writeText(lines.join('\n'))
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
      {/* Kalkulátor hlavička */}
      <div className="px-5 py-4 border-b border-amber-100 bg-amber-50/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Přepočet na množství</h3>
          {calculated.length > 0 && (
            <button
              onClick={copyToClipboard}
              className="text-xs text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-1"
            >
              📋 Kopírovat
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Cílové množství:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={100}
                max={200000}
                step={100}
                value={targetWeight}
                onChange={(e) =>
                  setTargetWeight(Math.max(100, parseInt(e.target.value) || 100))
                }
                className="w-24 text-right border border-amber-200 rounded-lg px-2 py-1 text-sm font-semibold focus:outline-none focus:border-amber-400"
              />
              <span className="text-gray-500 text-sm">g</span>
              <span className="text-sm font-medium text-amber-700">
                ({(targetWeight / 1000).toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} kg)
              </span>
            </div>
          </div>
          <input
            type="range"
            min={100}
            max={50000}
            step={100}
            value={Math.min(targetWeight, 50000)}
            onChange={(e) => setTargetWeight(parseInt(e.target.value))}
            className="w-full accent-amber-600"
          />
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          {PRESETS_G.map((g) => (
            <button
              key={g}
              onClick={() => setTargetWeight(g)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                targetWeight === g
                  ? 'bg-amber-600 border-amber-600 text-white'
                  : 'border-amber-200 text-amber-700 hover:bg-amber-50'
              }`}
            >
              {g >= 1000 ? `${g / 1000} kg` : `${g} g`}
            </button>
          ))}
        </div>

        <div className="mt-2 text-xs text-gray-400">
          Základ normy: 100 kg hotového výrobku · Poměr:{' '}
          {(targetWeight / BASE_WEIGHT_G).toFixed(4)}×
        </div>
      </div>

      {/* Tabulka surovin */}
      {calculated.length === 0 ? (
        <div className="px-5 py-8 text-center space-y-2">
          <p className="text-gray-400 text-sm">Data surovin pro tuto normu nejsou k dispozici.</p>
          {norma.pdfPage && (
            <p className="text-gray-400 text-xs">Viz PDF str. {norma.pdfPage}</p>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {(['suroviny', 'přísady'] as const).map((grp) => {
            const mappedGroup: Ingredient['group'] = grp === 'suroviny' ? 'maso' : 'přísady'
            const items = calculated.filter((item) => item.group === mappedGroup)
            if (items.length === 0) return null
            return (
              <div key={grp}>
                <div className="px-5 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {GROUP_LABEL[grp]}
                </div>
                {items.map((ing) => (
                  <div
                    key={ing.id}
                    className="flex items-center justify-between px-5 py-2.5 hover:bg-amber-50/30 transition-colors"
                  >
                    <span className="text-sm text-gray-800">{ing.name}</span>
                    <span className="font-semibold text-amber-800 tabular-nums text-sm">
                      {formatAmount(ing.displayAmount, ing.displayUnit)}
                    </span>
                  </div>
                ))}
              </div>
            )
          })}

          {/* Obaly — bez přepočtu, jen informativně */}
          {packaging.length > 0 && (
            <div>
              <div className="px-5 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Obaly (na 100 kg)
              </div>
              {packaging.map((pkg, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-2.5 text-gray-400"
                >
                  <span className="text-sm">{pkg.name}</span>
                  <span className="text-sm tabular-nums">
                    {pkg.amount} {pkg.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NormDetail({ norma }: { norma: MasnaVyrobkaNorma }) {
  return (
    <div className="space-y-4">
      {/* Hlavička normy */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                {norma.id}
              </span>
              <span>{NORM_CATEGORIES[norma.categoryId]}</span>
              {norma.csn && (
                <>
                  <span>·</span>
                  <span>ČSN {norma.csn}</span>
                </>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{norma.name}</h2>
            {norma.outputWeight && (
              <p className="text-sm text-gray-500 mt-1">Hmotnost výrobku: {norma.outputWeight}</p>
            )}
          </div>
          {!norma.verified && norma.ingredients.length > 0 && (
            <span className="shrink-0 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
              neověřeno
            </span>
          )}
        </div>
        {norma.procedure && (
          <p className="mt-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
            {norma.procedure}
          </p>
        )}
        {norma.pdfPage && (
          <p className="mt-2 text-xs text-gray-400">PDF str. {norma.pdfPage}</p>
        )}
      </div>

      {/* Kalkulátor */}
      <NormCalculator norma={norma} />
    </div>
  )
}

export default function NormyPage() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>('1.01')
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return NORMY.filter((n) => {
      if (activeCategory !== null && n.categoryId !== activeCategory) return false
      if (!q) return true
      return (
        n.name.toLowerCase().includes(q) ||
        n.id.includes(q) ||
        (n.csn || '').includes(q)
      )
    })
  }, [search, activeCategory])

  const selectedNorma = filtered.find((n) => n.id === selectedId) ?? filtered[0] ?? null

  const categoryCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    NORMY.forEach((n) => {
      counts[n.categoryId] = (counts[n.categoryId] ?? 0) + 1
    })
    return counts
  }, [])

  function selectNorma(id: string) {
    setSelectedId(id)
    setMobileView('detail')
  }

  return (
    <div className="space-y-4">
      {/* Hlavička stránky */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: 'linear-gradient(145deg, #7B1B2E, #4A1020)' }}
        >
          📋
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Spotřební normy</h1>
          <p className="text-sm text-gray-500">Masné výrobky 1993 · {NORMY.length} norem</p>
        </div>
      </div>

      <div className="flex gap-4 min-h-[calc(100vh-200px)]">
        {/* ── Levý panel: seznam ─────────────────────────────────── */}
        <div
          className={`w-full md:w-72 shrink-0 flex flex-col gap-2 ${
            mobileView === 'detail' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Vyhledávání */}
          <input
            type="search"
            placeholder="Hledat normu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
          />

          {/* Filtry kategorií */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveCategory(null)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                activeCategory === null
                  ? 'bg-amber-600 border-amber-600 text-white'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              Vše ({NORMY.length})
            </button>
            {Object.entries(NORM_CATEGORIES).map(([id]) => (
              <button
                key={id}
                onClick={() => setActiveCategory(activeCategory === Number(id) ? null : Number(id))}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  activeCategory === Number(id)
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {id}. ({categoryCounts[Number(id)] ?? 0})
              </button>
            ))}
          </div>

          {/* Seznam norem */}
          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">Nic nenalezeno</p>
            )}
            {Object.entries(NORM_CATEGORIES).map(([catId, catName]) => {
              const catNorms = filtered.filter((n) => n.categoryId === Number(catId))
              if (catNorms.length === 0) return null
              return (
                <div key={catId}>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-2 mt-2">
                    {catId}. {catName}
                  </div>
                  {catNorms.map((norma) => (
                    <button
                      key={norma.id}
                      onClick={() => selectNorma(norma.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between gap-2 ${
                        selectedId === norma.id
                          ? 'bg-amber-600 text-white'
                          : 'text-gray-700 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`font-mono text-xs shrink-0 ${
                            selectedId === norma.id ? 'text-amber-200' : 'text-gray-400'
                          }`}
                        >
                          {norma.id}
                        </span>
                        <span className="truncate">{norma.name}</span>
                      </div>
                      {norma.ingredients.filter((i) => i.group !== 'obaly').length > 0 && (
                        <span
                          className={`shrink-0 text-xs ${
                            selectedId === norma.id ? 'text-amber-200' : 'text-gray-300'
                          }`}
                          title="Má data pro kalkulátor"
                        >
                          ⚖️
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Pravý panel: detail ─────────────────────────────────── */}
        <div
          className={`flex-1 min-w-0 ${
            mobileView === 'list' ? 'hidden md:block' : 'block'
          }`}
        >
          {/* Mobilní tlačítko zpět */}
          <button
            onClick={() => setMobileView('list')}
            className="md:hidden mb-3 text-sm text-amber-600 flex items-center gap-1"
          >
            ← Zpět na seznam
          </button>

          {selectedNorma ? (
            <NormDetail norma={selectedNorma} />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Vyberte normu ze seznamu
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
