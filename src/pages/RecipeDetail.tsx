import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useRecipeStore } from '../store/recipeStore'
import { BUILT_IN_CATEGORIES, DIFFICULTY_LABEL } from '../types/recipe'
import type { RecipeDifficulty } from '../types/recipe'
import IngredientCalculator from '../components/IngredientCalculator'
import ProcessSteps from '../components/ProcessSteps'
import PhotoGallery from '../components/PhotoGallery'

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getRecipeById, deleteRecipe, toggleStarred, customCategories } = useRecipeStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const recipe = getRecipeById(id!)
  if (!recipe) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Recept nenalezen</p>
        <Link to="/" className="text-amber-600 text-sm mt-2 block">← Zpět</Link>
      </div>
    )
  }

  const { meta, ingredients, process, notes, photos } = recipe
  const cat =
    BUILT_IN_CATEGORIES.find((c) => c.id === meta.category) ??
    customCategories.find((c) => c.id === meta.category)

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    deleteRecipe(recipe!.id)
    navigate('/')
  }

  function handlePrint() {
    window.print()
  }

  function handleExportJSON() {
    const blob = new Blob([JSON.stringify(recipe!, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recept-${recipe!.meta.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Fotka header */}
      {photos.length > 0 && (() => {
        const primary = photos.find((p) => p.isPrimary) ?? photos[0]
        return (
          <div className="recipe-photo aspect-[16/7] rounded-2xl overflow-hidden -mx-4 md:mx-0">
            <img src={primary.dataUrl} alt={meta.title} className="w-full h-full object-cover" />
          </div>
        )
      })()}

      {/* Metadata */}
      <div>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <span>{cat?.icon ?? '🍖'}</span>
              <span>{cat?.name ?? meta.category}</span>
              {meta.difficulty && (
                <>
                  <span>·</span>
                  <span>{DIFFICULTY_LABEL[meta.difficulty as RecipeDifficulty]}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{meta.title}</h1>
            {meta.description && (
              <p className="text-gray-500 mt-1">{meta.description}</p>
            )}
          </div>
          <button
            onClick={() => toggleStarred(recipe.id)}
            aria-label={meta.starred ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
            className={`no-print text-2xl shrink-0 transition-transform hover:scale-110 ${meta.starred ? 'text-amber-400' : 'text-gray-200'}`}
          >
            ★
          </button>
        </div>

        {/* Parametry uzení */}
        {(meta.smokingTemp || meta.smokingDuration || meta.baseWeight) && (
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-2 text-sm">
              <span>⚖️</span>
              <div>
                <div className="text-xs text-gray-400">Základ receptu</div>
                <div className="font-semibold">
                  {meta.baseWeight >= 1000
                    ? `${(meta.baseWeight / 1000).toFixed(1)} kg`
                    : `${meta.baseWeight} g`}
                </div>
              </div>
            </div>
            {meta.smokingTemp && (
              <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-2 text-sm">
                <span>🌡️</span>
                <div>
                  <div className="text-xs text-gray-400">Teplota uzení</div>
                  <div className="font-semibold">{meta.smokingTemp} °C</div>
                </div>
              </div>
            )}
            {meta.smokingDuration && (
              <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-2 text-sm">
                <span>⏱️</span>
                <div>
                  <div className="text-xs text-gray-400">Doba uzení</div>
                  <div className="font-semibold">
                    {meta.smokingDuration >= 60
                      ? `${Math.floor(meta.smokingDuration / 60)} h ${meta.smokingDuration % 60 > 0 ? `${meta.smokingDuration % 60} min` : ''}`
                      : `${meta.smokingDuration} min`}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tagy */}
        {meta.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            {meta.tags.map((tag) => (
              <span key={tag} className="bg-amber-50 text-amber-700 text-xs px-3 py-1 rounded-full border border-amber-100">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Kalkulátor surovin */}
      <IngredientCalculator ingredients={ingredients} baseWeight={meta.baseWeight} />

      {/* Postup výroby */}
      {process.length > 0 && (
        <section>
          <h2 className="font-bold text-lg text-gray-800 mb-4">Postup výroby</h2>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <ProcessSteps steps={process} />
          </div>
        </section>
      )}

      {/* Galerie fotografií */}
      {photos.length > 1 && (
        <section>
          <h2 className="font-bold text-lg text-gray-800 mb-4">Fotografie</h2>
          <PhotoGallery photos={photos} />
        </section>
      )}

      {/* Poznámky */}
      {notes && (
        <section>
          <h2 className="font-bold text-lg text-gray-800 mb-4">Poznámky</h2>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{notes}</p>
          </div>
        </section>
      )}

      {/* Akce */}
      <div className="flex gap-3 flex-wrap border-t pt-4 no-print">
        <Link
          to={`/recipe/${recipe.id}/edit`}
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          ✏️ Upravit
        </Link>
        <button
          onClick={handlePrint}
          className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          🖨️ Tisknout
        </button>
        <button
          onClick={handleExportJSON}
          className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          📤 Export JSON
        </button>
        <button
          onClick={handleDelete}
          className={`text-sm px-4 py-2.5 rounded-xl transition-colors font-medium ${
            confirmDelete
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'border border-red-200 text-red-500 hover:bg-red-50'
          }`}
        >
          {confirmDelete ? '⚠️ Potvrdit smazání' : '🗑️ Smazat'}
        </button>
        {confirmDelete && (
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-sm text-gray-400 hover:text-gray-600 px-4 py-2.5"
          >
            Zrušit
          </button>
        )}
      </div>

      {/* Datum */}
      <p className="text-xs text-gray-400">
        Vytvořeno {new Date(recipe.createdAt).toLocaleDateString('cs-CZ')}
        {recipe.updatedAt !== recipe.createdAt && (
          <> · Upraveno {new Date(recipe.updatedAt).toLocaleDateString('cs-CZ')}</>
        )}
        <span className="print-only hidden"> · Tisk {new Date().toLocaleDateString('cs-CZ')}</span>
      </p>
    </div>
  )
}
