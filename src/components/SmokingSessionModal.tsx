import { useState } from 'react'
import { useRecipeStore } from '../store/recipeStore'
import type { SmokingSession, SmokingResult } from '../types/smoking'
import { WOOD_OPTIONS } from '../types/smoking'

interface Props {
  initial?: SmokingSession
  onSave: (data: Omit<SmokingSession, 'id' | 'createdAt'>) => void
  onClose: () => void
}

function Stars({ value, onChange }: { value: SmokingResult; onChange: (v: SmokingResult) => void }) {
  return (
    <div className="flex gap-1">
      {([1, 2, 3, 4, 5] as SmokingResult[]).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-2xl transition-transform hover:scale-110 ${n <= value ? 'text-amber-400' : 'text-gray-200'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function SmokingSessionModal({ initial, onSave, onClose }: Props) {
  const { recipes } = useRecipeStore()

  const today = new Date().toISOString().slice(0, 10)

  const [date, setDate] = useState(initial?.date ?? today)
  const [recipeId, setRecipeId] = useState(initial?.recipeId ?? '')
  const [recipeTitle, setRecipeTitle] = useState(initial?.recipeTitle ?? '')
  const isCustomWood = !!initial?.wood && !(WOOD_OPTIONS as readonly string[]).includes(initial.wood)
  const [wood, setWood] = useState(isCustomWood ? 'Jiné' : initial?.wood ?? 'Buk')
  const [customWood, setCustomWood] = useState(isCustomWood ? initial!.wood : '')
  const [weightKg, setWeightKg] = useState(initial?.weightKg?.toString() ?? '')
  const [weightAfterKg, setWeightAfterKg] = useState(initial?.weightAfterKg?.toString() ?? '')
  const [smokingTempC, setSmokingTempC] = useState(initial?.smokingTempC?.toString() ?? '')
  const [smokingDurationH, setSmokingDurationH] = useState(initial?.smokingDurationH?.toString() ?? '')
  const [dryingDurationDays, setDryingDurationDays] = useState(initial?.dryingDurationDays?.toString() ?? '')
  const [result, setResult] = useState<SmokingResult>(initial?.result ?? 3)
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const woodValue = wood === 'Jiné' ? customWood : wood

  function handleRecipeSelect(id: string) {
    setRecipeId(id)
    const r = recipes.find((r) => r.id === id)
    if (r) setRecipeTitle(r.meta.title)
    else setRecipeTitle('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!recipeTitle.trim() || !weightKg || !smokingTempC || !smokingDurationH) return
    onSave({
      date,
      recipeId: recipeId || undefined,
      recipeTitle: recipeTitle.trim(),
      wood: woodValue || 'Buk',
      weightKg: parseFloat(weightKg),
      weightAfterKg: weightAfterKg ? parseFloat(weightAfterKg) : undefined,
      smokingTempC: parseFloat(smokingTempC),
      smokingDurationH: parseFloat(smokingDurationH),
      dryingDurationDays: dryingDurationDays ? parseInt(dryingDurationDays) : undefined,
      result,
      notes,
    })
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400'
  const labelCls = 'text-xs font-medium text-gray-500 mb-1 block'

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hlavička */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-lg text-gray-900">
            {initial ? 'Upravit záznam' : 'Nový záznam uzení'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-5 space-y-4">
            {/* Datum */}
            <div>
              <label className={labelCls}>Datum uzení</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} required />
            </div>

            {/* Recept */}
            <div>
              <label className={labelCls}>Recept</label>
              <select
                value={recipeId}
                onChange={(e) => handleRecipeSelect(e.target.value)}
                className={inputCls}
              >
                <option value="">— Vybrat z kuchařky —</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>{r.meta.title}</option>
                ))}
              </select>
              <input
                type="text"
                value={recipeTitle}
                onChange={(e) => { setRecipeTitle(e.target.value); setRecipeId('') }}
                placeholder="nebo napsat vlastní název"
                className={`${inputCls} mt-2`}
                required
              />
            </div>

            {/* Dřevo */}
            <div>
              <label className={labelCls}>Dřevo</label>
              <select value={wood} onChange={(e) => setWood(e.target.value)} className={inputCls}>
                {WOOD_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
                <option value="Jiné">Jiné…</option>
              </select>
              {wood === 'Jiné' && (
                <input
                  type="text"
                  value={customWood}
                  onChange={(e) => setCustomWood(e.target.value)}
                  placeholder="Název dřeva"
                  className={`${inputCls} mt-2`}
                />
              )}
            </div>

            {/* Hmotnosti */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Hmotnost před (kg)</label>
                <input
                  type="number" step="0.1" min="0"
                  value={weightKg} onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="př. 4.5"
                  className={inputCls} required
                />
              </div>
              <div>
                <label className={labelCls}>Hmotnost po (kg, volitelné)</label>
                <input
                  type="number" step="0.1" min="0"
                  value={weightAfterKg} onChange={(e) => setWeightAfterKg(e.target.value)}
                  placeholder="př. 2.8"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Uzení */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Teplota uzení (°C)</label>
                <input
                  type="number" step="1" min="0"
                  value={smokingTempC} onChange={(e) => setSmokingTempC(e.target.value)}
                  placeholder="př. 75"
                  className={inputCls} required
                />
              </div>
              <div>
                <label className={labelCls}>Doba uzení (hod)</label>
                <input
                  type="number" step="0.5" min="0"
                  value={smokingDurationH} onChange={(e) => setSmokingDurationH(e.target.value)}
                  placeholder="př. 4"
                  className={inputCls} required
                />
              </div>
            </div>

            {/* Sušení */}
            <div>
              <label className={labelCls}>Doba sušení (dny, volitelné)</label>
              <input
                type="number" step="1" min="0"
                value={dryingDurationDays} onChange={(e) => setDryingDurationDays(e.target.value)}
                placeholder="př. 45"
                className={inputCls}
              />
            </div>

            {/* Hodnocení */}
            <div>
              <label className={labelCls}>Hodnocení výsledku</label>
              <Stars value={result} onChange={setResult} />
            </div>

            {/* Poznámky */}
            <div>
              <label className={labelCls}>Poznámky</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Co se povedlo, co příště změnit…"
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {/* Akce */}
          <div className="shrink-0 px-5 py-4 border-t border-gray-100 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Zrušit
            </button>
            <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">
              {initial ? 'Uložit změny' : 'Přidat záznam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
