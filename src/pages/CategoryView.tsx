import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useRecipeStore } from '../store/recipeStore'
import { BUILT_IN_CATEGORIES } from '../types/recipe'
import type { RecipeCategory } from '../types/recipe'
import RecipeCard from '../components/RecipeCard'
import ImportModal from '../components/ImportModal'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Recipe } from '../types/recipe'

type SortKey = 'title' | 'createdAt' | 'updatedAt' | 'manual'

function SortableRecipeCard({ recipe }: { recipe: Recipe }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: recipe.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 bg-white/90 rounded-lg px-1.5 py-1 cursor-grab active:cursor-grabbing touch-none shadow-sm text-gray-400 hover:text-gray-600 select-none"
        title="Přetáhnout"
      >
        ⠿
      </div>
      <RecipeCard recipe={recipe} />
    </div>
  )
}

function applyOrder(order: string[], recipes: Recipe[]): Recipe[] {
  const ids = [...order]
  for (const r of recipes) {
    if (!ids.includes(r.id)) ids.push(r.id)
  }
  return [...recipes].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
}

export default function CategoryView() {
  const { id } = useParams<{ id: string }>()
  const { recipes, customCategories, categoryOrder, setCategoryOrder } = useRecipeStore()
  const [sort, setSort] = useState<SortKey>('updatedAt')
  const [onlyStarred, setOnlyStarred] = useState(false)
  const [difficulty, setDifficulty] = useState<'' | '1' | '2' | '3'>('')
  const [showImport, setShowImport] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const allCats = [
    ...BUILT_IN_CATEGORIES,
    ...customCategories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: ['#7D3C98', '#5B2C6F'] as [string, string] })),
  ]
  const cat = allCats.find((c) => c.id === id)

  // All recipes in this category, sorted
  let sorted: Recipe[] = recipes.filter((r) => r.meta.category === id)
  if (sort === 'manual') {
    const order = categoryOrder[id!] ?? sorted.map((r) => r.id)
    sorted = applyOrder(order, sorted)
  } else if (sort === 'title') {
    sorted = [...sorted].sort((a, b) => a.meta.title.localeCompare(b.meta.title, 'cs'))
  } else {
    sorted = [...sorted].sort((a, b) => new Date(b[sort]).getTime() - new Date(a[sort]).getTime())
  }

  // Filters applied on top of sort
  let filtered = sorted
  if (onlyStarred) filtered = filtered.filter((r) => r.meta.starred)
  if (difficulty) filtered = filtered.filter((r) => r.meta.difficulty?.toString() === difficulty)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const allInCategory = recipes.filter((r) => r.meta.category === id)
    const currentOrder = categoryOrder[id!] ?? allInCategory.map((r) => r.id)
    const fullOrder = applyOrder(currentOrder, allInCategory).map((r) => r.id)

    // Move within visible items; reconstruct full order
    const visibleIds = filtered.map((r) => r.id)
    const oldIdx = visibleIds.indexOf(active.id as string)
    const newIdx = visibleIds.indexOf(over.id as string)
    if (oldIdx === -1 || newIdx === -1) return
    const newVisibleIds = arrayMove(visibleIds, oldIdx, newIdx)

    // Replace visible items at their original positions in fullOrder
    const visiblePositions = visibleIds
      .map((vid) => fullOrder.indexOf(vid))
      .sort((a, b) => a - b)
    const newFullOrder = [...fullOrder]
    visiblePositions.forEach((pos, i) => { newFullOrder[pos] = newVisibleIds[i] })

    setCategoryOrder(id!, newFullOrder)
  }

  const filtersActive = onlyStarred || difficulty !== ''

  return (
    <div className="space-y-6">
      {/* Hlavička kategorie */}
      <div
        className="rounded-2xl p-6 flex items-center gap-4"
        style={{
          background: cat ? `linear-gradient(145deg, ${cat.color[0]}, ${cat.color[1]})` : '#888',
        }}
      >
        <span className="text-5xl">{cat?.icon ?? '🍖'}</span>
        <div>
          <h1 className="text-2xl font-bold text-white">{cat?.name ?? id}</h1>
          <p className="text-white/70 text-sm mt-0.5">
            {filtered.length}{' '}
            {filtered.length === 1 ? 'recept' : filtered.length <= 4 ? 'recepty' : 'receptů'}
            {filtersActive && ` (filtrováno z ${recipes.filter((r) => r.meta.category === id).length})`}
          </p>
        </div>
      </div>

      {/* Filtry a akce */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-amber-400"
        >
          <option value="updatedAt">Naposledy upravené</option>
          <option value="createdAt">Nejnovější</option>
          <option value="title">Název A–Z</option>
          <option value="manual">Vlastní pořadí</option>
        </select>

        <button
          onClick={() => setOnlyStarred((v) => !v)}
          className={`text-sm border rounded-xl px-3 py-2 transition-colors ${
            onlyStarred ? 'bg-amber-100 border-amber-300 text-amber-700' : 'border-gray-200 bg-white text-gray-500'
          }`}
        >
          ★ Oblíbené
        </button>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as '' | '1' | '2' | '3')}
          className={`text-sm border rounded-xl px-3 py-2 bg-white focus:outline-none transition-colors ${
            difficulty ? 'border-amber-300 text-amber-700' : 'border-gray-200 text-gray-500 focus:border-amber-400'
          }`}
        >
          <option value="">Obtížnost</option>
          <option value="1">Snadný</option>
          <option value="2">Střední</option>
          <option value="3">Pokročilý</option>
        </select>

        {filtersActive && (
          <button
            onClick={() => { setOnlyStarred(false); setDifficulty('') }}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-xl px-2.5 py-2 bg-white transition-colors"
            title="Zrušit filtry"
          >
            ✕ Zrušit filtry
          </button>
        )}

        <div className="flex-1" />

        <button
          onClick={() => setShowImport(true)}
          className="text-sm bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-xl transition-colors"
        >
          📄 Import
        </button>
        <Link
          to="/recipe/new"
          className="text-sm border border-amber-300 text-amber-700 hover:bg-amber-50 font-medium px-4 py-2 rounded-xl transition-colors"
        >
          ✏️ Nový
        </Link>
      </div>

      {/* Hint pro manuální pořadí */}
      {sort === 'manual' && filtered.length > 1 && (
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <span>⠿</span>
          <span>Přetažením karet změníte jejich pořadí v kategorii</span>
        </p>
      )}

      {/* Recepty */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="text-5xl opacity-30">{cat?.icon ?? '🍖'}</div>
          <p className="text-gray-400">
            {filtersActive ? 'Žádné recepty neodpovídají filtrům' : 'Zatím žádné recepty v této kategorii'}
          </p>
          {filtersActive ? (
            <button
              onClick={() => { setOnlyStarred(false); setDifficulty('') }}
              className="text-sm text-amber-600 border border-amber-200 px-4 py-1.5 rounded-xl hover:bg-amber-50 transition-colors"
            >
              Zrušit filtry
            </button>
          ) : (
            <button onClick={() => setShowImport(true)} className="text-sm text-amber-600 underline">
              Importovat recept
            </button>
          )}
        </div>
      ) : sort === 'manual' ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((r) => r.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => <SortableRecipeCard key={r.id} recipe={r} />)}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          defaultCategory={id as RecipeCategory}
        />
      )}
    </div>
  )
}
