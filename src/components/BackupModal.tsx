import { useRef, useState, useEffect } from 'react'
import { useRecipeStore } from '../store/recipeStore'
import { useSmokingStore } from '../store/smokingStore'
import type { SmokingSession } from '../types/smoking'

interface Props {
  onClose: () => void
}

interface BackupData {
  version: 1 | 2
  exportedAt: string
  recipes: ReturnType<typeof useRecipeStore.getState>['recipes']
  customCategories: ReturnType<typeof useRecipeStore.getState>['customCategories']
  customIngredients: ReturnType<typeof useRecipeStore.getState>['customIngredients']
  categoryOrder?: ReturnType<typeof useRecipeStore.getState>['categoryOrder']
  smokingSessions?: SmokingSession[]
}

function isBackupData(data: unknown): data is BackupData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'version' in data &&
    ((data as BackupData).version === 1 || (data as BackupData).version === 2) &&
    'recipes' in data
  )
}

export default function BackupModal({ onClose }: Props) {
  const store = useRecipeStore()
  const smokingStore = useSmokingStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<BackupData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  function handleExport() {
    const data: BackupData = {
      version: 2 as const,
      exportedAt: new Date().toISOString(),
      recipes: store.recipes,
      customCategories: store.customCategories,
      customIngredients: store.customIngredients,
      categoryOrder: store.categoryOrder,
      smokingSessions: smokingStore.sessions,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kucharka-zaloha-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as unknown
        if (!isBackupData(data)) {
          setError('Neplatný formát zálohy')
          return
        }
        setPreview(data)
      } catch {
        setError('Soubor nelze přečíst')
      }
    }
    reader.readAsText(file)
  }

  function handleImport() {
    if (!preview) return
    localStorage.setItem(
      'kucharka-recipes',
      JSON.stringify({
        state: {
          recipes: preview.recipes,
          customCategories: preview.customCategories ?? [],
          customIngredients: preview.customIngredients ?? [],
          categoryOrder: preview.categoryOrder ?? {},
        },
        version: 0,
      })
    )
    if (preview.smokingSessions) {
      localStorage.setItem(
        'kucharka-denik',
        JSON.stringify({ state: { sessions: preview.smokingSessions }, version: 0 })
      )
    }
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg">Záloha a obnova</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl transition-colors">✕</button>
        </div>
        <div className="p-6">

        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            📥 Exportovat zálohu
          </button>

          <div className="border-t pt-3">
            <p className="text-sm text-gray-500 mb-2">Obnovit ze zálohy:</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 hover:border-amber-300 text-gray-500 font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              📂 Vybrat soubor zálohy
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          {preview && (
            <div className="bg-amber-50 rounded-xl p-4 text-sm space-y-1">
              <p className="font-medium text-amber-800">Záloha z {new Date(preview.exportedAt).toLocaleDateString('cs-CZ')}</p>
              <p className="text-gray-600">Receptů: {preview.recipes.length}</p>
              <p className="text-gray-600">Vlastních kategorií: {preview.customCategories?.length ?? 0}</p>
              {preview.smokingSessions ? (
                <p className="text-gray-600">Záznamů uzení: {preview.smokingSessions.length}</p>
              ) : (
                <p className="text-amber-600 text-xs">⚠️ Starší záloha (v1) — Deník uzení nebude obnoven</p>
              )}
              <button
                onClick={handleImport}
                className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-xl transition-colors"
              >
                ⚠️ Obnovit (přepíše vše)
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-400 hover:text-gray-600 text-sm transition-colors"
        >
          Zavřít
        </button>
        </div>
      </div>
    </div>
  )
}
