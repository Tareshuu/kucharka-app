import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecipeStore } from '../store/recipeStore'
import { parseIngredientText } from '../modules/ingredientParser'
import type { ParsedIngredient } from '../modules/ingredientParser'
import { BUILT_IN_CATEGORIES } from '../types/recipe'
import type { RecipeCategory, IngredientUnit } from '../types/recipe'

type Step = 'choose' | 'text-review' | 'ingredient-review' | 'meta'

interface Props {
  onClose: () => void
  defaultCategory?: RecipeCategory
}

export default function ImportModal({ onClose, defaultCategory = 'klobasy' }: Props) {
  const navigate = useNavigate()
  const { createRecipe, addIngredient, customIngredients, customCategories } = useRecipeStore()

  const [step, setStep] = useState<Step>('choose')
  const [rawText, setRawText] = useState('')
  const [recipeTitle, setRecipeTitle] = useState('')
  const [category, setCategory] = useState<RecipeCategory>(defaultCategory)
  const [baseWeight, setBaseWeight] = useState(1000)
  const [parsed, setParsed] = useState<ParsedIngredient[]>([])
  const [confirmed, setConfirmed] = useState<boolean[]>([])
  const [loading, setLoading] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  async function handlePDF(file: File) {
    setLoading(true)
    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
      GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString()
      const buf = await file.arrayBuffer()
      const pdf = await getDocument({ data: buf }).promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map((item) => ('str' in item ? item.str : '')).join('\n') + '\n'
      }
      setRawText(text)
      setStep('text-review')
    } catch (e) {
      alert('Chyba při čtení PDF: ' + String(e))
    } finally {
      setLoading(false)
    }
  }

  async function handlePhoto(file: File) {
    setLoading(true)
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker(['ces', 'eng'])
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()
      setRawText(text)
      setStep('text-review')
    } catch (e) {
      alert('Chyba OCR: ' + String(e))
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.name.endsWith('.pdf')) {
      void handlePDF(file)
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    void handlePhoto(file)
  }

  function handleParseIngredients() {
    const results = parseIngredientText(rawText, customIngredients)
    setParsed(results)
    setConfirmed(results.map((r) => r.confidence >= 0.8))
    setStep('ingredient-review')
  }

  function handleCreateRecipe() {
    const recipe = createRecipe({
      title: recipeTitle || 'Nový recept',
      category,
      baseWeight,
      description: '',
    })
    const accepted = parsed.filter((_, i) => confirmed[i])
    for (const p of accepted) {
      addIngredient(recipe.id, {
        name: p.matched?.name ?? p.rawName,
        amount: p.amount,
        unit: p.unit as IngredientUnit,
        group: p.group,
        dbId: p.matched?.id,
      })
    }
    navigate(`/recipe/${recipe.id}/edit`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg">Import receptu</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Step 1: Výběr způsobu */}
          {step === 'choose' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Vyberte způsob importu:</p>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="w-full border-2 border-dashed border-amber-200 hover:border-amber-400 text-amber-800 font-medium py-4 rounded-xl transition-colors flex flex-col items-center gap-1"
              >
                <span className="text-2xl">📄</span>
                <span>Import z PDF</span>
              </button>
              <button
                onClick={() => imgRef.current?.click()}
                disabled={loading}
                className="w-full border-2 border-dashed border-amber-200 hover:border-amber-400 text-amber-800 font-medium py-4 rounded-xl transition-colors flex flex-col items-center gap-1"
              >
                <span className="text-2xl">📷</span>
                <span>Import z fotografie (OCR)</span>
              </button>
              <button
                onClick={() => setStep('text-review')}
                className="w-full border-2 border-dashed border-gray-200 hover:border-gray-300 text-gray-500 font-medium py-4 rounded-xl transition-colors"
              >
                ✏️ Vložit text ručně
              </button>
              {loading && (
                <div className="text-center text-amber-600 text-sm animate-pulse">
                  Zpracovávám…
                </div>
              )}
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
              <input ref={imgRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
            </div>
          )}

          {/* Step 2: Korektura textu */}
          {step === 'text-review' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Zkontrolujte/upravte rozpoznaný text. Suroviny ve formátu „100 g pepř černý" budou rozpoznány automaticky.
              </p>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={12}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm font-mono focus:outline-none focus:border-amber-400 resize-y"
                placeholder="Vložte text receptu…"
              />
              <div className="flex gap-2">
                <button onClick={() => setStep('choose')} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">← Zpět</button>
                <button
                  onClick={handleParseIngredients}
                  disabled={!rawText.trim()}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
                >
                  Rozpoznat suroviny →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review surovin */}
          {step === 'ingredient-review' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Zkontrolujte rozpoznané suroviny. ✅ = jistota ≥ 80 %, ⚠️ = potvrdit, ❌ = nenalezeno.
              </p>
              {parsed.length === 0 ? (
                <p className="text-center text-gray-400 py-4 text-sm">Žádné suroviny nebyly rozpoznány</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {parsed.map((p, i) => {
                    const icon = p.confidence >= 0.8 ? '✅' : p.confidence >= 0.5 ? '⚠️' : '❌'
                    return (
                      <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${confirmed[i] ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          checked={confirmed[i]}
                          onChange={(e) => setConfirmed((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
                          className="accent-amber-600"
                        />
                        <span className="text-base">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{p.matched?.name ?? p.rawName}</div>
                          {p.matched && p.rawName.toLowerCase() !== p.matched.name.toLowerCase() && (
                            <div className="text-xs text-gray-400 truncate">rozpoznáno z: „{p.rawName}"</div>
                          )}
                        </div>
                        <span className="text-sm tabular-nums shrink-0">{p.amount} {p.unit}</span>
                      </label>
                    )
                  })}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setStep('text-review')} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">← Zpět</button>
                <button onClick={() => setStep('meta')} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-xl text-sm">
                  Pokračovat →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Metadata receptu */}
          {step === 'meta' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Název receptu</label>
                <input
                  type="text"
                  value={recipeTitle}
                  onChange={(e) => setRecipeTitle(e.target.value)}
                  placeholder="např. Domácí debrecínka"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Kategorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RecipeCategory)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                >
                  {BUILT_IN_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                  {customCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Základní hmotnost (g)</label>
                <input
                  type="number"
                  value={baseWeight}
                  onChange={(e) => setBaseWeight(parseInt(e.target.value) || 1000)}
                  min={100}
                  step={100}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <p className="text-xs text-gray-400 mt-1">Na kolik gramů masa jsou zadané suroviny v receptu</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep('ingredient-review')} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">← Zpět</button>
                <button onClick={handleCreateRecipe} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-xl text-sm">
                  ✅ Vytvořit recept
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
