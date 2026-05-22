import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecipeStore } from '../store/recipeStore'
import { BUILT_IN_CATEGORIES } from '../types/recipe'
import CategoryCard from '../components/CategoryCard'
import RecipeCard from '../components/RecipeCard'
import GlobalSearch from '../components/GlobalSearch'
import BackupModal from '../components/BackupModal'
import ImportModal from '../components/ImportModal'
import CategoryModal from '../components/CategoryModal'
import CustomIngredientsModal from '../components/CustomIngredientsModal'

export default function RecipeHub() {
  const { recipes, customCategories } = useRecipeStore()
  const [showBackup, setShowBackup] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [showCustomIngredients, setShowCustomIngredients] = useState(false)

  const allCategories = [
    ...BUILT_IN_CATEGORIES,
    ...customCategories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: ['#7D3C98', '#5B2C6F'] as [string, string] })),
  ]

  const recent = [...recipes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)

  const starred = recipes.filter((r) => r.meta.starred)

  return (
    <div className="space-y-8">
      {/* Vyhledávání */}
      <div className="max-w-xl mx-auto">
        <GlobalSearch prominent />
      </div>

      {/* Kategorie */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl text-gray-800">Kategorie</h2>
          <button
            onClick={() => setShowCategories(true)}
            className="text-xs text-amber-600 hover:text-amber-800 border border-amber-200 hover:border-amber-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            + Vlastní
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {allCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              id={cat.id}
              name={cat.name}
              icon={cat.icon}
              color={cat.color}
              count={recipes.filter((r) => r.meta.category === cat.id).length}
            />
          ))}
        </div>
      </section>

      {/* Oblíbené */}
      {starred.length > 0 && (
        <section>
          <h2 className="font-bold text-xl text-gray-800 mb-4">⭐ Oblíbené</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {starred.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </section>
      )}

      {/* Nedávné */}
      {recent.length > 0 && (
        <section>
          <h2 className="font-bold text-xl text-gray-800 mb-4">🕐 Nedávné</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </section>
      )}

      {/* Prázdný stav */}
      {recipes.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <div className="text-6xl">🔥</div>
          <h2 className="text-xl font-bold text-gray-700">Začněte přidáním receptu</h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Importujte recept z PDF nebo fotografie, nebo jej zadejte ručně pomocí tlačítek níže.
          </p>
        </div>
      )}

      {/* Akce */}
      <div className="flex gap-3 justify-center flex-wrap pt-2">
        <button
          onClick={() => setShowImport(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm"
        >
          📄 Import receptu
        </button>
        <Link
          to="/recipe/new"
          className="border border-amber-300 text-amber-700 hover:bg-amber-50 font-medium px-4 py-2 rounded-xl transition-colors text-sm"
        >
          ✏️ Nový recept
        </Link>
        <button
          onClick={() => setShowCustomIngredients(true)}
          className="border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium px-4 py-2 rounded-xl transition-colors text-sm"
        >
          🧂 Suroviny
        </button>
        <Link
          to="/denik"
          className="border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium px-4 py-2 rounded-xl transition-colors text-sm"
        >
          🪵 Deník uzení
        </Link>
        <Link
          to="/print"
          className="border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium px-4 py-2 rounded-xl transition-colors text-sm"
        >
          📚 Tisknout kuchařku
        </Link>
        <button
          onClick={() => setShowBackup(true)}
          className="border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium px-4 py-2 rounded-xl transition-colors text-sm"
        >
          💾 Záloha
        </button>
      </div>

      {showBackup && <BackupModal onClose={() => setShowBackup(false)} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      {showCategories && <CategoryModal onClose={() => setShowCategories(false)} />}
      {showCustomIngredients && <CustomIngredientsModal onClose={() => setShowCustomIngredients(false)} />}
    </div>
  )
}
