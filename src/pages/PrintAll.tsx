import React, { useEffect } from 'react'
import { useRecipeStore } from '../store/recipeStore'
import { BUILT_IN_CATEGORIES, GROUP_LABEL, DIFFICULTY_LABEL } from '../types/recipe'
import type { Recipe, RecipeDifficulty } from '../types/recipe'
import { calculateIngredients, formatAmount } from '../modules/calculator'

function dur(min: number) {
  return min >= 60
    ? `${Math.floor(min / 60)} h${min % 60 > 0 ? ` ${min % 60} min` : ''}`
    : `${min} min`
}

function RecipePrint({ recipe }: { recipe: Recipe }) {
  const { meta, ingredients, process, notes } = recipe
  const calculated = calculateIngredients(ingredients, meta.baseWeight, meta.baseWeight)
  const groups = [...new Set(calculated.map((i) => i.group))]
  const sorted = [...process].sort((a, b) => a.order - b.order)
  const totalMinutes = sorted.reduce((sum, s) => sum + (s.duration ?? 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 pb-2 mb-2 border-b-2 border-gray-300">
        <div className="flex-1">
          <h2 className="text-base font-bold text-gray-900 leading-tight">{meta.title}</h2>
          {meta.description && (
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{meta.description}</p>
          )}
        </div>
        <div className="shrink-0 text-right text-xs text-gray-500 space-y-0.5">
          {meta.baseWeight > 0 && (
            <div>⚖️ {meta.baseWeight >= 1000 ? `${(meta.baseWeight / 1000).toFixed(1)} kg` : `${meta.baseWeight} g`}</div>
          )}
          {meta.smokingTemp && <div>🌡️ {meta.smokingTemp} °C</div>}
          {meta.smokingDuration && <div>⏱️ {dur(meta.smokingDuration)}</div>}
          {meta.difficulty && <div>{DIFFICULTY_LABEL[meta.difficulty as RecipeDifficulty]}</div>}
        </div>
      </div>

      {meta.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {meta.tags.map((t) => (
            <span key={t} className="text-xs bg-amber-50 text-amber-700 px-1.5 py-px rounded-full border border-amber-100">{t}</span>
          ))}
        </div>
      )}

      {/* Two-column body */}
      <div className="print-2col grid grid-cols-1 sm:grid-cols-2 gap-4">

        {ingredients.length > 0 && (
          <div>
            <div className="font-semibold text-xs text-gray-400 uppercase tracking-wide mb-1">
              Suroviny — {meta.baseWeight >= 1000 ? `${(meta.baseWeight / 1000).toFixed(1)} kg` : `${meta.baseWeight} g`}
            </div>
            <table className="w-full">
              <tbody>
                {groups.map((group) => (
                  <React.Fragment key={group}>
                    {groups.length > 1 && (
                      <tr>
                        <td colSpan={2} className="text-xs font-semibold text-gray-400 uppercase pt-1.5 pb-px tracking-wide">
                          {GROUP_LABEL[group]}
                        </td>
                      </tr>
                    )}
                    {calculated.filter((i) => i.group === group).map((ing) => (
                      <tr key={ing.id} className="border-b border-gray-100">
                        <td className="py-px text-xs text-gray-800 pr-2 leading-snug">{ing.name}</td>
                        <td className="py-px text-right text-xs font-semibold text-amber-800 whitespace-nowrap leading-snug">
                          {formatAmount(ing.displayAmount, ing.displayUnit)}
                          {ing.unit === '%' && (
                            <span className="text-gray-400 ml-0.5">({ing.amount}%)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {sorted.length > 0 && (
          <div>
            <div className="font-semibold text-xs text-gray-400 uppercase tracking-wide mb-1">
              Postup
              {totalMinutes > 0 && (
                <span className="font-normal text-gray-400 ml-1 normal-case">({dur(totalMinutes)})</span>
              )}
            </div>
            <ol className="space-y-1.5">
              {sorted.map((step, i) => (
                <li key={step.id} className="process-step flex gap-2">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold leading-none">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    {step.title && (
                      <div className="font-semibold text-xs text-gray-800 leading-snug">{step.title}</div>
                    )}
                    <p className="text-xs text-gray-700 leading-snug whitespace-pre-line">{step.description}</p>
                    {(step.temperature !== undefined || (step.duration !== undefined && step.duration > 0)) && (
                      <div className="flex gap-2 text-xs text-gray-400">
                        {step.temperature !== undefined && <span>🌡️ {step.temperature} °C</span>}
                        {step.duration !== undefined && step.duration > 0 && (
                          <span>⏱️ {dur(step.duration)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {notes && (
        <div className="mt-2 pt-1.5 border-t border-gray-100">
          <div className="font-semibold text-xs text-gray-400 uppercase tracking-wide mb-0.5">Poznámky</div>
          <p className="text-xs text-gray-700 leading-snug whitespace-pre-line">{notes}</p>
        </div>
      )}
    </div>
  )
}

export default function PrintAll() {
  const { recipes, customCategories } = useRecipeStore()

  const allCategories = [
    ...BUILT_IN_CATEGORIES,
    ...customCategories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: ['#7D3C98', '#5B2C6F'] as [string, string],
    })),
  ]

  const sections = allCategories
    .map((cat) => ({ cat, catRecipes: recipes.filter((r) => r.meta.category === cat.id) }))
    .filter(({ catRecipes }) => catRecipes.length > 0)

  useEffect(() => {
    const t = setTimeout(() => window.print(), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div>
      {/* Screen-only action bar */}
      <div className="no-print mb-6 bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Připraveno k tisku: <strong className="text-gray-800">{recipes.length} receptů</strong>
          <span className="text-gray-400"> v {sections.length} kategoriích</span>
        </span>
        <button
          onClick={() => window.print()}
          className="ml-auto bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          🖨️ Tisknout vše
        </button>
      </div>

      {sections.map(({ cat, catRecipes }, catIdx) => (
        <div key={cat.id}>
          {/* Section cover */}
          <div
            className={`cat-section-divider -mx-4 md:-mx-6 flex items-center justify-center${catIdx > 0 ? ' print-cat-break' : ''}`}
            style={{
              background: `linear-gradient(135deg, ${cat.color[0]}, ${cat.color[1]})`,
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            } as React.CSSProperties}
          >
            <div className="text-center text-white py-20 px-8">
              <div className="text-8xl mb-6">{cat.icon}</div>
              <h1 className="text-5xl font-bold mb-3">{cat.name}</h1>
              <p className="text-xl opacity-75">
                {catRecipes.length}{' '}
                {catRecipes.length === 1 ? 'recept' : catRecipes.length < 5 ? 'recepty' : 'receptů'}
              </p>
            </div>
          </div>

          {/* Recipes */}
          {catRecipes.map((recipe) => (
            <div key={recipe.id} className="all-print-recipe py-6 border-b border-gray-100 last:border-0">
              <RecipePrint recipe={recipe} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
