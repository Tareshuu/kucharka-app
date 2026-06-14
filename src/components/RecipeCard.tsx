import { Link } from 'react-router-dom'
import type { Recipe } from '../types/recipe'
import { BUILT_IN_CATEGORIES } from '../types/recipe'
import { useRecipeStore } from '../store/recipeStore'

interface Props {
  recipe: Recipe
}

const DIFFICULTY_DOT = ['', '●○○', '●●○', '●●●']

function fmtDuration(minutes: number) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h} h ${m} min` : `${h} h`
  }
  return `${minutes} min`
}

export default function RecipeCard({ recipe }: Props) {
  const { meta, photos, ingredients, process } = recipe
  const totalMinutes = process.reduce((sum, s) => sum + (s.duration ?? 0), 0)
  const customCategories = useRecipeStore((s) => s.customCategories)
  const primary = photos.find((p) => p.isPrimary) ?? photos[0]
  const cat =
    BUILT_IN_CATEGORIES.find((c) => c.id === meta.category) ??
    customCategories.find((c) => c.id === meta.category)
  const icon = cat?.icon ?? '🍖'

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
    >
      <div className="aspect-[16/9] bg-amber-50 flex items-center justify-center overflow-hidden">
        {primary ? (
          <img
            src={primary.dataUrl}
            alt={meta.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl opacity-30">{icon}</span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2">{meta.title}</h3>
          {meta.starred && <span className="text-amber-400 shrink-0">★</span>}
        </div>

        {meta.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{meta.description}</p>
        )}

        <div className="mt-auto pt-3 flex items-center gap-2 flex-wrap text-xs text-gray-400">
          <span className="truncate max-w-[120px]">{icon} {cat?.name ?? meta.category}</span>
          <span>·</span>
          <span className="whitespace-nowrap">
            {meta.baseWeight >= 1000
              ? `${(meta.baseWeight / 1000).toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} kg`
              : `${meta.baseWeight} g`}
          </span>
          <span>·</span>
          <span className="whitespace-nowrap">{ingredients.length} surovin</span>
          {totalMinutes > 0 && (
            <>
              <span>·</span>
              <span className="whitespace-nowrap">⏱ {fmtDuration(totalMinutes)}</span>
            </>
          )}
          {meta.difficulty && (
            <span className="ml-auto shrink-0 text-amber-500">{DIFFICULTY_DOT[meta.difficulty]}</span>
          )}
        </div>
        {meta.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {meta.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
                {tag}
              </span>
            ))}
            {meta.tags.length > 3 && (
              <span className="text-xs text-gray-400 self-center">+{meta.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
