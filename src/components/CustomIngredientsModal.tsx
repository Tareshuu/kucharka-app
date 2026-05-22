import { useState } from 'react'
import { useRecipeStore } from '../store/recipeStore'
import type { IngredientGroup, IngredientUnit } from '../types/recipe'
import { GROUP_LABEL } from '../types/recipe'

interface Props {
  onClose: () => void
}

const GROUPS: IngredientGroup[] = ['maso', 'solanky', 'koření', 'střívka', 'přísady', 'ostatní']
const UNITS: IngredientUnit[] = ['g', 'kg', 'ml', 'l', 'lžíce', 'lžička', 'ks', 'm', '%']

export default function CustomIngredientsModal({ onClose }: Props) {
  const { customIngredients, addCustomIngredient, deleteCustomIngredient } = useRecipeStore()

  const [name, setName] = useState('')
  const [aliases, setAliases] = useState('')
  const [unit, setUnit] = useState<IngredientUnit>('g')
  const [group, setGroup] = useState<IngredientGroup>('koření')
  const [filter, setFilter] = useState('')

  function handleAdd() {
    if (!name.trim()) return
    addCustomIngredient({
      name: name.trim(),
      aliases: aliases.split(',').map((a) => a.trim()).filter(Boolean),
      defaultUnit: unit,
      group,
    })
    setName('')
    setAliases('')
    setUnit('g')
    setGroup('koření')
  }

  const displayed = customIngredients.filter((i) =>
    !filter || i.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
        {/* Hlavička */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Vlastní suroviny</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5 overflow-y-auto flex-1">
          {/* Přidat novou */}
          <div className="bg-amber-50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-amber-900">Přidat vlastní surovinu</h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Název suroviny *"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
            />
            <input
              type="text"
              value={aliases}
              onChange={(e) => setAliases(e.target.value)}
              placeholder="Aliasy (oddělené čárkou, volitelné)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as IngredientUnit)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value as IngredientGroup)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              >
                {GROUPS.map((g) => <option key={g} value={g}>{GROUP_LABEL[g]}</option>)}
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={!name.trim()}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-sm font-medium py-2 rounded-xl transition-colors"
            >
              + Přidat surovinu
            </button>
          </div>

          {/* Seznam custom surovin */}
          {customIngredients.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Zatím žádné vlastní suroviny
            </div>
          ) : (
            <>
              <input
                type="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filtrovat seznam…"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
              <div className="text-xs text-gray-400">
                {customIngredients.length} vlastních surovin
                {filter && ` · zobrazeno ${displayed.length}`}
              </div>
              <div className="divide-y divide-gray-50">
                {displayed.map((ing) => (
                  <div key={ing.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800">{ing.name}</div>
                      {ing.aliases.length > 0 && (
                        <div className="text-xs text-gray-400 truncate">{ing.aliases.join(', ')}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                        {GROUP_LABEL[ing.group].slice(0, 8)}
                      </span>
                      <span className="text-xs text-gray-400">{ing.defaultUnit}</span>
                      <button
                        onClick={() => deleteCustomIngredient(ing.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                        title="Smazat"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  )
}
