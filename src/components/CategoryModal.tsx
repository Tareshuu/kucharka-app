import { useState } from 'react'
import { useRecipeStore } from '../store/recipeStore'

const EMOJI_OPTIONS = ['🏷️', '🌿', '🐟', '🥚', '🫙', '🍗', '🥩', '🧆', '🫕', '🥣', '🔥', '🍖', '🥘', '🍱']

interface Props {
  onClose: () => void
}

export default function CategoryModal({ onClose }: Props) {
  const { customCategories, addCustomCategory, deleteCustomCategory, recipes } = useRecipeStore()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🏷️')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  function handleAdd() {
    if (!name.trim()) return
    addCustomCategory(name.trim(), icon)
    setName('')
    setIcon('🏷️')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg">Vlastní kategorie</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Přidat novou */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Přidat kategorii</h3>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-colors ${icon === e ? 'bg-amber-100 ring-2 ring-amber-400' : 'bg-gray-50 hover:bg-amber-50'}`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Název kategorie…"
                maxLength={32}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleAdd}
                disabled={!name.trim()}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors"
              >
                Přidat
              </button>
            </div>
          </div>

          {/* Stávající vlastní */}
          {customCategories.length > 0 && (
            <div className="border-t pt-3 space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Vaše kategorie</h3>
              {customCategories.map((cat) => {
                const count = recipes.filter((r) => r.meta.category === cat.id).length
                return (
                  <div key={cat.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="flex-1 text-sm font-medium">{cat.name}</span>
                    <span className="text-xs text-gray-400">{count} {count === 1 ? 'recept' : count <= 4 ? 'recepty' : 'receptů'}</span>
                    <button
                      onClick={() => {
                        if (deleteConfirm === cat.id) {
                          deleteCustomCategory(cat.id)
                          setDeleteConfirm(null)
                        } else {
                          setDeleteConfirm(cat.id)
                        }
                      }}
                      onBlur={() => setTimeout(() => setDeleteConfirm(null), 150)}
                      className={`text-sm font-medium transition-colors px-2 py-0.5 rounded-lg ml-1 ${
                        deleteConfirm === cat.id
                          ? 'text-white bg-red-500 hover:bg-red-600'
                          : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
                      }`}
                      title={deleteConfirm === cat.id ? 'Klikni pro potvrzení' : 'Smazat kategorii'}
                    >
                      {deleteConfirm === cat.id ? 'Smazat?' : '×'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {customCategories.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Zatím žádné vlastní kategorie</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
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
