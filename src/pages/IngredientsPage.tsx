import { useState } from 'react'
import { useRecipeStore } from '../store/recipeStore'
import { INGREDIENT_DB } from '../data/ingredientDB'
import type { IngredientDBEntry, IngredientGroup, IngredientUnit } from '../types/recipe'
import { GROUP_LABEL } from '../types/recipe'

const GROUPS: IngredientGroup[] = ['maso', 'solanky', 'koření', 'střívka', 'přísady', 'ostatní']
const UNITS: IngredientUnit[] = ['g', 'kg', 'ml', 'l', 'lžíce', 'lžička', 'ks', 'm', '%']

const GROUP_ICON: Record<IngredientGroup, string> = {
  maso:     '🥩',
  solanky:  '🧂',
  koření:   '🌿',
  střívka:  '🌀',
  přísady:  '🧪',
  ostatní:  '🫙',
}

interface EditState {
  name: string
  aliases: string
  defaultUnit: IngredientUnit
  group: IngredientGroup
}

function emptyEdit(ing: IngredientDBEntry): EditState {
  return {
    name: ing.name,
    aliases: ing.aliases.join(', '),
    defaultUnit: ing.defaultUnit,
    group: ing.group,
  }
}

function emptyNew(): EditState {
  return { name: '', aliases: '', defaultUnit: 'g', group: 'koření' }
}

export default function IngredientsPage() {
  const { customIngredients, addCustomIngredient, updateCustomIngredient, deleteCustomIngredient } = useRecipeStore()

  const [search, setSearch] = useState('')
  const [activeGroup, setActiveGroup] = useState<IngredientGroup | 'vse'>('vse')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>(emptyNew())
  const [showAddForm, setShowAddForm] = useState(false)
  const [addState, setAddState] = useState<EditState>(emptyNew())
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)

  const allIngredients: (IngredientDBEntry & { isCustom: boolean })[] = [
    ...INGREDIENT_DB.map((i) => ({ ...i, isCustom: false })),
    ...customIngredients.map((i) => ({ ...i, isCustom: true })),
  ]

  const q = search.toLowerCase()
  const filtered = allIngredients.filter((i) => {
    const matchGroup = activeGroup === 'vse' || i.group === activeGroup
    const matchSearch =
      !q ||
      i.name.toLowerCase().includes(q) ||
      i.aliases.some((a) => a.toLowerCase().includes(q))
    return matchGroup && matchSearch
  })

  // Group for display
  const grouped = GROUPS.reduce<Record<IngredientGroup, typeof filtered>>((acc, g) => {
    acc[g] = filtered.filter((i) => i.group === g)
    return acc
  }, {} as Record<IngredientGroup, typeof filtered>)

  function startEdit(ing: IngredientDBEntry) {
    setEditingId(ing.id)
    setEditState(emptyEdit(ing))
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function saveEdit(id: string) {
    updateCustomIngredient(id, {
      name: editState.name.trim(),
      aliases: editState.aliases.split(',').map((a) => a.trim()).filter(Boolean),
      defaultUnit: editState.defaultUnit,
      group: editState.group,
    })
    setEditingId(null)
  }

  function handleAdd() {
    if (!addState.name.trim()) return
    addCustomIngredient({
      name: addState.name.trim(),
      aliases: addState.aliases.split(',').map((a) => a.trim()).filter(Boolean),
      defaultUnit: addState.defaultUnit,
      group: addState.group,
    })
    const newIng = useRecipeStore.getState().customIngredients.at(-1)
    if (newIng) {
      setFlashId(newIng.id)
      setTimeout(() => setFlashId(null), 2000)
    }
    setAddState(emptyNew())
    setShowAddForm(false)
  }

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      deleteCustomIngredient(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
    }
  }

  const customCount = customIngredients.length
  const dbCount = INGREDIENT_DB.length

  return (
    <div className="space-y-6">
      {/* Záhlaví */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🧂 Suroviny</h1>
          <p className="text-sm text-gray-400 mt-1">
            {dbCount} vestavěných · {customCount} vlastních
          </p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setAddState(emptyNew()) }}
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm shrink-0"
        >
          + Přidat surovinu
        </button>
      </div>

      {/* Formulář přidání */}
      {showAddForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-amber-900">Nová surovina</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={addState.name}
              onChange={(e) => setAddState((s) => ({ ...s, name: e.target.value }))}
              placeholder="Název suroviny *"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400 col-span-full"
              autoFocus
            />
            <input
              type="text"
              value={addState.aliases}
              onChange={(e) => setAddState((s) => ({ ...s, aliases: e.target.value }))}
              placeholder="Aliasy — oddělené čárkou (volitelné)"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400 col-span-full"
            />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Výchozí jednotka</label>
              <select
                value={addState.defaultUnit}
                onChange={(e) => setAddState((s) => ({ ...s, defaultUnit: e.target.value as IngredientUnit }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Skupina</label>
              <select
                value={addState.group}
                onChange={(e) => setAddState((s) => ({ ...s, group: e.target.value as IngredientGroup }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              >
                {GROUPS.map((g) => <option key={g} value={g}>{GROUP_LABEL[g]}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={!addState.name.trim()}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors"
            >
              Přidat
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="border border-gray-200 text-gray-600 text-sm font-medium py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      {/* Vyhledávání + filtr skupin */}
      <div className="space-y-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hledat surovinu nebo alias…"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveGroup('vse')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeGroup === 'vse'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Vše ({allIngredients.filter(i => !search || i.name.toLowerCase().includes(q) || i.aliases.some(a => a.toLowerCase().includes(q))).length})
          </button>
          {GROUPS.map((g) => {
            const count = allIngredients.filter((i) => {
              const matchGroup = i.group === g
              const matchSearch = !q || i.name.toLowerCase().includes(q) || i.aliases.some((a) => a.toLowerCase().includes(q))
              return matchGroup && matchSearch
            }).length
            if (count === 0 && search) return null
            return (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  activeGroup === g
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {GROUP_ICON[g]} {GROUP_LABEL[g]} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Seznam */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {search ? `Žádná surovina neodpovídá „${search}"` : 'Žádné suroviny'}
        </div>
      ) : (
        <div className="space-y-6">
          {GROUPS.map((g) => {
            const items = grouped[g]
            if (!items.length) return null
            return (
              <section key={g}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>{GROUP_ICON[g]}</span>
                  <span>{GROUP_LABEL[g]}</span>
                  <span className="font-normal normal-case tracking-normal text-gray-400">({items.length})</span>
                </h2>
                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                  {items.map((ing) => (
                    <div key={ing.id}>
                      {editingId === ing.id ? (
                        /* Řádek pro editaci */
                        <div className="p-4 bg-amber-50 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={editState.name}
                              onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                              placeholder="Název *"
                              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400 col-span-full"
                              autoFocus
                            />
                            <input
                              type="text"
                              value={editState.aliases}
                              onChange={(e) => setEditState((s) => ({ ...s, aliases: e.target.value }))}
                              placeholder="Aliasy — oddělené čárkou"
                              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400 col-span-full"
                            />
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Jednotka</label>
                              <select
                                value={editState.defaultUnit}
                                onChange={(e) => setEditState((s) => ({ ...s, defaultUnit: e.target.value as IngredientUnit }))}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                              >
                                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Skupina</label>
                              <select
                                value={editState.group}
                                onChange={(e) => setEditState((s) => ({ ...s, group: e.target.value as IngredientGroup }))}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                              >
                                {GROUPS.map((g2) => <option key={g2} value={g2}>{GROUP_LABEL[g2]}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(ing.id)}
                              disabled={!editState.name.trim()}
                              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-sm font-medium py-1.5 px-4 rounded-xl transition-colors"
                            >
                              Uložit
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="border border-gray-200 text-gray-600 text-sm font-medium py-1.5 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                              Zrušit
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normální řádek */
                        <div className={`flex items-center gap-3 px-4 py-3 transition-colors duration-300 ${flashId === ing.id ? 'bg-amber-100' : ''}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-800">{ing.name}</span>
                              {!ing.isCustom && (
                                <span className="text-xs text-gray-300 bg-gray-50 border border-gray-100 rounded-full px-1.5 py-0.5 leading-none">DB</span>
                              )}
                              {ing.isCustom && (
                                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-1.5 py-0.5 leading-none">vlastní</span>
                              )}
                            </div>
                            {ing.aliases.length > 0 && (
                              <div className="text-xs text-gray-400 truncate mt-0.5">{ing.aliases.join(', ')}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-gray-500 font-mono bg-gray-50 rounded-lg px-2 py-1">{ing.defaultUnit}</span>
                            {ing.isCustom && (
                              <>
                                <button
                                  onClick={() => startEdit(ing)}
                                  className="text-xs text-gray-400 hover:text-amber-600 transition-colors px-2 py-1 rounded-lg hover:bg-amber-50"
                                  title="Upravit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete(ing.id)}
                                  className={`text-xs transition-colors px-2 py-1 rounded-lg ${
                                    deleteConfirm === ing.id
                                      ? 'text-white bg-red-500 hover:bg-red-600'
                                      : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
                                  }`}
                                  title={deleteConfirm === ing.id ? 'Klikni pro potvrzení' : 'Smazat'}
                                  onBlur={() => setDeleteConfirm(null)}
                                >
                                  {deleteConfirm === ing.id ? 'Smazat?' : '×'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
