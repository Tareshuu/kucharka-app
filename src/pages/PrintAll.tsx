import React, { useEffect } from 'react'
import { useRecipeStore } from '../store/recipeStore'
import { BUILT_IN_CATEGORIES, GROUP_LABEL, DIFFICULTY_LABEL } from '../types/recipe'
import type { Recipe, RecipeDifficulty } from '../types/recipe'
import { calculateIngredients, formatAmount } from '../modules/calculator'

function RecipePrint({ recipe }: { recipe: Recipe }) {
  const { meta, ingredients, process, notes } = recipe
  const calculated = calculateIngredients(ingredients, meta.baseWeight, meta.baseWeight)
  const groups = [...new Set(calculated.map((i) => i.group))]
  const sorted = [...process].sort((a, b) => a.order - b.order)
  const totalMinutes = sorted.reduce((sum, s) => sum + (s.duration ?? 0), 0)

  return (
    <div>
      <div className="pb-3 border-b border-gray-200 mb-4">
        <h2 className="text-xl font-bold text-gray-900">{meta.title}</h2>
        {meta.description && (
          <p className="text-gray-500 text-sm mt-1">{meta.description}</p>
        )}
      </div>

      {(meta.baseWeight > 0 || meta.smokingTemp || meta.smokingDuration || meta.difficulty) && (
        <div className="flex gap-4 flex-wrap mb-4 text-sm text-gray-600">
          {meta.baseWeight > 0 && (
            <span>⚖️ <strong>{meta.baseWeight >= 1000 ? `${(meta.baseWeight / 1000).toFixed(1)} kg` : `${meta.baseWeight} g`}</strong></span>
          )}
          {meta.smokingTemp && (
            <span>🌡️ <strong>{meta.smokingTemp} °C</strong></span>
          )}
          {meta.smokingDuration && (
            <span>⏱️ <strong>{meta.smokingDuration >= 60 ? `${Math.floor(meta.smokingDuration / 60)} h${meta.smokingDuration % 60 > 0 ? ` ${meta.smokingDuration % 60} min` : ''}` : `${meta.smokingDuration} min`}</strong></span>
          )}
          {meta.difficulty && (
            <span>📊 <strong>{DIFFICULTY_LABEL[meta.difficulty as RecipeDifficulty]}</strong></span>
          )}
        </div>
      )}

      {meta.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {meta.tags.map((t) => (
            <span key={t} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">{t}</span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {ingredients.length > 0 && (
          <div>
            <h3 className="font-semibold text-xs text-gray-500 mb-2 uppercase tracking-wide">
              Suroviny — {meta.baseWeight >= 1000 ? `${(meta.baseWeight / 1000).toFixed(1)} kg` : `${meta.baseWeight} g`}
            </h3>
            <table className="w-full text-sm">
              <tbody>
                {groups.map((group) => (
                  <React.Fragment key={group}>
                    {groups.length > 1 && (
                      <tr>
                        <td colSpan={2} className="text-xs font-semibold text-gray-400 uppercase pt-2 pb-0.5 tracking-wide">{GROUP_LABEL[group]}</td>
                      </tr>
                    )}
                    {calculated.filter((i) => i.group === group).map((ing) => (
                      <tr key={ing.id} className="border-b border-gray-100">
                        <td className="py-1 text-gray-800">{ing.name}</td>
                        <td className="py-1 text-right font-semibold text-amber-800">
                          {formatAmount(ing.displayAmount, ing.displayUnit)}
                          {ing.unit === '%' && (
                            <span className="text-xs text-gray-400 ml-1">({ing.amount}%)</span>
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
            <h3 className="font-semibold text-xs text-gray-500 mb-2 uppercase tracking-wide">
              Postup výroby
              {totalMinutes > 0 && (
                <span className="font-normal text-gray-400 ml-2 normal-case">
                  ({totalMinutes >= 60
                    ? `${Math.floor(totalMinutes / 60)} h${totalMinutes % 60 > 0 ? ` ${totalMinutes % 60} min` : ''}`
                    : `${totalMinutes} min`})
                </span>
              )}
            </h3>
            <ol className="space-y-3">
              {sorted.map((step, i) => (
                <li key={step.id} className="process-step flex gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  <div className="flex-1">
                    {step.title && (
                      <div className="font-semibold text-gray-800 text-sm mb-0.5">{step.title}</div>
                    )}
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{step.description}</p>
                    {(step.temperature !== undefined || (step.duration !== undefined && step.duration > 0)) && (
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        {step.temperature !== undefined && <span>🌡️ {step.temperature} °C</span>}
                        {step.duration !== undefined && step.duration > 0 && (
                          <span>⏱️ {step.duration >= 60
                            ? `${Math.floor(step.duration / 60)} h ${step.duration % 60 > 0 ? `${step.duration % 60} min` : ''}`
                            : `${step.duration} min`}</span>
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
        <div className="mt-4 pt-3 border-t border-gray-100">
          <h3 className="font-semibold text-xs text-gray-500 mb-2 uppercase tracking-wide">Poznámky</h3>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{notes}</p>
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
          {/* Section cover page */}
          <div
            className={`cat-section-divider -mx-4 md:-mx-6 flex items-center justify-center${catIdx > 0 ? ' print-cat-break' : ''}`}
            style={{ background: `linear-gradient(135deg, ${cat.color[0]}, ${cat.color[1]})` }}
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

          {/* Individual recipes */}
          {catRecipes.map((recipe) => (
            <div key={recipe.id} className="all-print-recipe py-8 border-b border-gray-100 last:border-0">
              <RecipePrint recipe={recipe} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
