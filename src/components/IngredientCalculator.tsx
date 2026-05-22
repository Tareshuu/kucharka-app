import { useState } from 'react'
import type { Ingredient } from '../types/recipe'
import { GROUP_LABEL } from '../types/recipe'
import { calculateIngredients, formatAmount } from '../modules/calculator'

interface Props {
  ingredients: Ingredient[]
  baseWeight: number
}

const PRESETS = [500, 1000, 2000, 5000, 10000]

export default function IngredientCalculator({ ingredients, baseWeight }: Props) {
  const [targetWeight, setTargetWeight] = useState(baseWeight)

  const calculated = calculateIngredients(ingredients, baseWeight, targetWeight)

  // Skupiny
  const groups = [...new Set(calculated.map((i) => i.group))]

  function copyToClipboard() {
    const lines = calculated.map(
      (i) => `${i.name}: ${formatAmount(i.displayAmount, i.displayUnit)}`
    )
    void navigator.clipboard.writeText(lines.join('\n'))
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
      {/* Kalkulátor hlavička — schovaná při tisku */}
      <div className="calculator-controls px-5 py-4 border-b border-amber-100 bg-amber-50/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Přepočet surovin</h2>
          <button
            onClick={copyToClipboard}
            className="text-xs text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-1"
          >
            📋 Kopírovat
          </button>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Cílové množství:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={100}
                max={50000}
                step={100}
                value={targetWeight}
                onChange={(e) => setTargetWeight(Math.max(100, parseInt(e.target.value) || 100))}
                className="w-20 text-right border border-amber-200 rounded-lg px-2 py-1 text-sm font-semibold focus:outline-none focus:border-amber-400"
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
            value={targetWeight}
            onChange={(e) => setTargetWeight(parseInt(e.target.value))}
            className="w-full accent-amber-600"
          />
        </div>

        {/* Rychlé předvolby */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setTargetWeight(p)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                targetWeight === p
                  ? 'bg-amber-600 border-amber-600 text-white'
                  : 'border-amber-200 text-amber-700 hover:bg-amber-50'
              }`}
            >
              {p >= 1000 ? `${p / 1000} kg` : `${p} g`}
            </button>
          ))}
        </div>

        {targetWeight !== baseWeight && (
          <div className="mt-2 text-xs text-gray-400">
            Základ receptu: {(baseWeight / 1000).toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} kg
            · Poměr: {(targetWeight / baseWeight).toFixed(2)}×
          </div>
        )}
      </div>

      {/* Print-only nadpis se zvoleným množstvím */}
      <div className="print-only hidden px-5 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-gray-800">
          Suroviny
          <span className="text-sm font-normal text-gray-500 ml-2">
            — {targetWeight >= 1000
              ? `${(targetWeight / 1000).toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} kg`
              : `${targetWeight} g`}
            {targetWeight !== baseWeight && (
              <span className="text-gray-400"> (základ {baseWeight >= 1000 ? `${baseWeight / 1000} kg` : `${baseWeight} g`}, poměr {(targetWeight / baseWeight).toFixed(2)}×)</span>
            )}
          </span>
        </h2>
      </div>

      {/* Tabulka surovin */}
      {ingredients.length === 0 ? (
        <div className="px-5 py-8 text-center text-gray-400 text-sm">Recept nemá žádné suroviny</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {groups.map((group) => {
            const groupItems = calculated.filter((i) => i.group === group)
            return (
              <div key={group}>
                <div className="px-5 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {GROUP_LABEL[group]}
                </div>
                {groupItems.map((ing) => (
                  <div
                    key={ing.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-amber-50/30 transition-colors"
                  >
                    <span className="text-sm text-gray-800">{ing.name}</span>
                    <div className="text-right">
                      <span className="font-semibold text-amber-800 tabular-nums">
                        {formatAmount(ing.displayAmount, ing.displayUnit)}
                      </span>
                      {ing.unit === '%' && (
                        <span className="text-xs text-gray-400 ml-1">({ing.amount}%)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
