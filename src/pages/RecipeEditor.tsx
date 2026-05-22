import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useRecipeStore } from '../store/recipeStore'
import { BUILT_IN_CATEGORIES, GROUP_LABEL } from '../types/recipe'
import type { Ingredient, ProcessStep, RecipePhoto, IngredientGroup, IngredientUnit, RecipeCategory, RecipeDifficulty } from '../types/recipe'
import { matchIngredient } from '../modules/ingredientMatcher'
import type { IngredientDBEntry } from '../types/recipe'
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
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Tab = 'meta' | 'ingredients' | 'process' | 'photos' | 'notes'

function SortableIngredientRow({
  ing,
  isEditing,
  onStartEdit,
  children,
}: {
  ing: Ingredient
  isEditing: boolean
  onStartEdit: () => void
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ing.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  return (
    <div ref={setNodeRef} style={style} className="border-b border-gray-50 last:border-0">
      {isEditing ? (
        <>{children}</>
      ) : (
        <div
          className="flex items-center gap-2 px-3 py-3 cursor-pointer hover:bg-amber-50/40 transition-colors group"
          onClick={onStartEdit}
        >
          <span
            {...attributes}
            {...listeners}
            className="text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing px-1 shrink-0 touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            ⠿
          </span>
          <span className="flex-1 text-sm">{ing.name}</span>
          <span className="text-sm tabular-nums text-amber-800 font-medium">{ing.amount} {ing.unit}</span>
          <span className="text-xs text-gray-300 group-hover:text-gray-400 transition-colors ml-1">✎</span>
        </div>
      )}
    </div>
  )
}

function SortableStepRow({
  step,
  index,
  onRemove,
  children,
}: {
  step: ProcessStep
  index: number
  onRemove: () => void
  children?: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  return (
    <div ref={setNodeRef} style={style} className="flex gap-3">
      <span
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing mt-1 shrink-0 touch-none text-lg leading-none"
      >
        ⠿
      </span>
      <div className="shrink-0 w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold mt-0.5">
        {index + 1}
      </div>
      <div className="flex-1">
        {step.title && <div className="font-medium text-sm">{step.title}</div>}
        <div className="text-sm text-gray-600">{step.description}</div>
        {(step.temperature ?? step.duration) && (
          <div className="text-xs text-gray-400 mt-1">
            {step.temperature && `🌡️ ${step.temperature}°C`}
            {step.temperature && step.duration ? ' · ' : ''}
            {step.duration && `⏱️ ${step.duration} min`}
          </div>
        )}
        {children}
      </div>
      <button onClick={onRemove} className="text-gray-300 hover:text-red-400 text-xl leading-none shrink-0">×</button>
    </div>
  )
}

export default function RecipeEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const store = useRecipeStore()
  const customCategories = store.customCategories
  const isNew = !id || id === 'new'

  const existing = isNew ? null : store.getRecipeById(id!)
  const [tab, setTab] = useState<Tab>('meta')

  // Meta state
  const [title, setTitle] = useState(existing?.meta.title ?? '')
  const [category, setCategory] = useState<RecipeCategory>(existing?.meta.category ?? 'klobasy')
  const [description, setDescription] = useState(existing?.meta.description ?? '')
  const [baseWeight, setBaseWeight] = useState(existing?.meta.baseWeight ?? 1000)
  const [smokingTemp, setSmokingTemp] = useState(existing?.meta.smokingTemp?.toString() ?? '')
  const [smokingDuration, setSmokingDuration] = useState(existing?.meta.smokingDuration?.toString() ?? '')
  const [difficulty, setDifficulty] = useState<string>(existing?.meta.difficulty?.toString() ?? '')
  const [tags, setTags] = useState(existing?.meta.tags.join(', ') ?? '')
  const [starred, setStarred] = useState(existing?.meta.starred ?? false)

  // Ingredients state
  const [ingredients, setIngredients] = useState<Ingredient[]>(existing?.ingredients ?? [])
  const [newIngName, setNewIngName] = useState('')
  const [newIngAmount, setNewIngAmount] = useState('')
  const [newIngUnit, setNewIngUnit] = useState<IngredientUnit>('g')
  const [newIngGroup, setNewIngGroup] = useState<IngredientGroup>('maso')
  const [suggestions, setSuggestions] = useState<IngredientDBEntry[]>([])
  const [matchedDbId, setMatchedDbId] = useState<string | undefined>()

  // Inline edit state
  const [editingIngId, setEditingIngId] = useState<string | null>(null)
  const [editIngName, setEditIngName] = useState('')
  const [editIngAmount, setEditIngAmount] = useState('')
  const [editIngUnit, setEditIngUnit] = useState<IngredientUnit>('g')
  const [editIngGroup, setEditIngGroup] = useState<IngredientGroup>('maso')

  // Process state
  const [steps, setSteps] = useState<ProcessStep[]>(existing?.process ?? [])
  const [newStepTitle, setNewStepTitle] = useState('')
  const [newStepDesc, setNewStepDesc] = useState('')
  const [newStepTemp, setNewStepTemp] = useState('')
  const [newStepDur, setNewStepDur] = useState('')

  // Photos state
  const [photos, setPhotos] = useState<RecipePhoto[]>(existing?.photos ?? [])
  const [notes, setNotes] = useState(existing?.notes ?? '')

  const photoInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleIngDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setIngredients((prev) => {
      const oldIdx = prev.findIndex((i) => i.id === active.id)
      const newIdx = prev.findIndex((i) => i.id === over.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
  }

  function handleStepDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSteps((prev) => {
      const oldIdx = prev.findIndex((s) => s.id === active.id)
      const newIdx = prev.findIndex((s) => s.id === over.id)
      return arrayMove(prev, oldIdx, newIdx).map((s, i) => ({ ...s, order: i }))
    })
  }

  // Autocomplete pro název suroviny
  useEffect(() => {
    if (newIngName.length < 2) { setSuggestions([]); return }
    const matches = matchIngredient(newIngName, store.customIngredients)
    setSuggestions(matches.slice(0, 5).map((m) => m.entry))
  }, [newIngName, store.customIngredients])

  function selectSuggestion(entry: IngredientDBEntry) {
    setNewIngName(entry.name)
    setNewIngUnit(entry.defaultUnit)
    setNewIngGroup(entry.group)
    setMatchedDbId(entry.id)
    setSuggestions([])
  }

  function addIngredient() {
    if (!newIngName.trim() || !newIngAmount) return
    setIngredients((prev) => [
      ...prev,
      {
        id: uuidv4(),
        name: newIngName.trim(),
        amount: parseFloat(newIngAmount.replace(',', '.')),
        unit: newIngUnit,
        group: newIngGroup,
        dbId: matchedDbId,
      },
    ])
    setNewIngName('')
    setNewIngAmount('')
    setMatchedDbId(undefined)
    setSuggestions([])
  }

  function removeIngredient(ingId: string) {
    setIngredients((prev) => prev.filter((i) => i.id !== ingId))
  }

  function startEditIngredient(ing: Ingredient) {
    setEditingIngId(ing.id)
    setEditIngName(ing.name)
    setEditIngAmount(String(ing.amount))
    setEditIngUnit(ing.unit)
    setEditIngGroup(ing.group)
  }

  function saveEditIngredient(ingId: string) {
    if (!editIngName.trim() || !editIngAmount) return
    setIngredients((prev) =>
      prev.map((i) =>
        i.id === ingId
          ? { ...i, name: editIngName.trim(), amount: parseFloat(editIngAmount.replace(',', '.')), unit: editIngUnit, group: editIngGroup }
          : i
      )
    )
    setEditingIngId(null)
  }

  function addStep() {
    if (!newStepDesc.trim()) return
    setSteps((prev) => [
      ...prev,
      {
        id: uuidv4(),
        order: prev.length,
        title: newStepTitle.trim() || undefined,
        description: newStepDesc.trim(),
        temperature: newStepTemp ? parseFloat(newStepTemp) : undefined,
        duration: newStepDur ? parseInt(newStepDur) : undefined,
      },
    ])
    setNewStepTitle('')
    setNewStepDesc('')
    setNewStepTemp('')
    setNewStepDur('')
  }

  function removeStep(stepId: string) {
    setSteps((prev) => prev.filter((s) => s.id !== stepId).map((s, i) => ({ ...s, order: i })))
  }

  function addPhoto(file: File) {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const MAX_PX = 1400
      const MAX_BYTES = 900_000
      let { width, height } = img
      if (width > MAX_PX || height > MAX_PX) {
        const ratio = Math.min(MAX_PX / width, MAX_PX / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(objectUrl)

      let quality = 0.85
      let dataUrl = canvas.toDataURL('image/jpeg', quality)
      while (dataUrl.length > MAX_BYTES && quality > 0.4) {
        quality -= 0.1
        dataUrl = canvas.toDataURL('image/jpeg', quality)
      }

      setPhotos((prev) => {
        const isPrimary = prev.length === 0
        return [...prev, { id: uuidv4(), dataUrl, isPrimary, caption: '' }]
      })
    }
    img.src = objectUrl
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.forEach(addPhoto)
    e.target.value = ''
  }

  function handleSave() {
    const metaData = {
      title: title || 'Nový recept',
      category,
      description,
      baseWeight,
      smokingTemp: smokingTemp ? parseFloat(smokingTemp) : undefined,
      smokingDuration: smokingDuration ? parseInt(smokingDuration) : undefined,
      difficulty: difficulty ? (parseInt(difficulty) as RecipeDifficulty) : undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      starred,
    }

    if (isNew) {
      const recipe = store.createRecipe(metaData)
      // Přidat ingredience
      for (const ing of ingredients) {
        store.addIngredient(recipe.id, { name: ing.name, amount: ing.amount, unit: ing.unit, group: ing.group, dbId: ing.dbId })
      }
      for (const step of steps) {
        store.addStep(recipe.id, { title: step.title, description: step.description, duration: step.duration, temperature: step.temperature })
      }
      for (const photo of photos) {
        store.addPhoto(recipe.id, { dataUrl: photo.dataUrl, caption: photo.caption, isPrimary: photo.isPrimary })
      }
      store.updateNotes(recipe.id, notes)
      navigate(`/recipe/${recipe.id}`)
    } else {
      store.updateRecipeMeta(existing!.id, metaData)
      store.updateRecipe(existing!.id, { ingredients, process: steps.map((s, i) => ({ ...s, order: i })), notes })
      // Sync photos
      store.updateRecipe(existing!.id, { photos })
      navigate(`/recipe/${existing!.id}`)
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'meta', label: 'Základní info' },
    { key: 'ingredients', label: `Suroviny (${ingredients.length})` },
    { key: 'process', label: `Postup (${steps.length})` },
    { key: 'photos', label: `Fotky (${photos.length})` },
    { key: 'notes', label: 'Poznámky' },
  ]

  const groups: IngredientGroup[] = ['maso', 'solanky', 'koření', 'střívka', 'přísady', 'ostatní']
  const units: IngredientUnit[] = ['g', 'kg', 'ml', 'l', 'lžíce', 'lžička', 'ks', 'm', '%']

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900">
        {isNew ? 'Nový recept' : `Upravit: ${existing?.meta.title}`}
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.key
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-500 hover:bg-amber-50 border border-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Meta */}
      {tab === 'meta' && (
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Název receptu *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="např. Domácí debrecínka"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Kategorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RecipeCategory)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
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
              <label className="text-sm font-medium text-gray-700 block mb-1">Obtížnost</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
              >
                <option value="">— nevybráno —</option>
                <option value="1">Snadný</option>
                <option value="2">Střední</option>
                <option value="3">Pokročilý</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Popis</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Krátký popis receptu…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Základ (g) *</label>
              <input
                type="number"
                value={baseWeight}
                onChange={(e) => setBaseWeight(parseInt(e.target.value) || 1000)}
                min={100}
                step={100}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Teplota uzení (°C)</label>
              <input
                type="number"
                value={smokingTemp}
                onChange={(e) => setSmokingTemp(e.target.value)}
                placeholder="65"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Doba uzení (min)</label>
              <input
                type="number"
                value={smokingDuration}
                onChange={(e) => setSmokingDuration(e.target.value)}
                placeholder="180"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Tagy (oddělené čárkou)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="domácí, vepřové, debrecín"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={starred} onChange={(e) => setStarred(e.target.checked)} className="accent-amber-600" />
            <span className="text-sm text-gray-700">Přidat do oblíbených ★</span>
          </label>
        </div>
      )}

      {/* Tab: Suroviny */}
      {tab === 'ingredients' && (
        <div className="space-y-4">
          {/* Přidání suroviny */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-gray-800">Přidat surovinu</h3>
            <div className="relative">
              <input
                type="text"
                value={newIngName}
                onChange={(e) => { setNewIngName(e.target.value); setMatchedDbId(undefined) }}
                placeholder="Název suroviny (autocomplete z DB)…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl border border-gray-100 shadow-lg z-10 overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onMouseDown={() => selectSuggestion(s)}
                      className="w-full text-left px-4 py-2.5 hover:bg-amber-50 text-sm flex items-center gap-2"
                    >
                      <span className="text-xs text-gray-400 w-14 shrink-0">{GROUP_LABEL[s.group].slice(0, 6)}</span>
                      <span>{s.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{s.defaultUnit}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <input
                  type="number"
                  value={newIngAmount}
                  onChange={(e) => setNewIngAmount(e.target.value)}
                  placeholder="Množství"
                  step="0.1"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <select
                  value={newIngUnit}
                  onChange={(e) => setNewIngUnit(e.target.value as IngredientUnit)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                >
                  {units.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <select
                  value={newIngGroup}
                  onChange={(e) => setNewIngGroup(e.target.value as IngredientGroup)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                >
                  {groups.map((g) => <option key={g} value={g}>{GROUP_LABEL[g]}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={addIngredient}
              disabled={!newIngName.trim() || !newIngAmount}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              + Přidat surovinu
            </button>
          </div>

          {/* Seznam surovin s DnD */}
          {ingredients.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleIngDragEnd}>
                <SortableContext items={ingredients.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  {groups.map((group) => {
                    const groupItems = ingredients.filter((i) => i.group === group)
                    if (groupItems.length === 0) return null
                    return (
                      <div key={group}>
                        <div className="px-5 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {GROUP_LABEL[group]}
                        </div>
                        {groupItems.map((ing) => (
                          <SortableIngredientRow
                            key={ing.id}
                            ing={ing}
                            isEditing={editingIngId === ing.id}
                            onStartEdit={() => startEditIngredient(ing)}
                          >
                            {editingIngId === ing.id && (
                              <div className="px-4 py-3 bg-amber-50/60 space-y-2">
                                <input
                                  type="text"
                                  value={editIngName}
                                  onChange={(e) => setEditIngName(e.target.value)}
                                  className="w-full border border-amber-300 rounded-xl px-2.5 py-1.5 text-sm focus:outline-none focus:border-amber-500"
                                  autoFocus
                                />
                                <div className="grid grid-cols-3 gap-2">
                                  <input
                                    type="number"
                                    value={editIngAmount}
                                    onChange={(e) => setEditIngAmount(e.target.value)}
                                    step="0.1"
                                    className="border border-amber-300 rounded-xl px-2.5 py-1.5 text-sm focus:outline-none focus:border-amber-500"
                                  />
                                  <select
                                    value={editIngUnit}
                                    onChange={(e) => setEditIngUnit(e.target.value as IngredientUnit)}
                                    className="border border-amber-300 rounded-xl px-2 py-1.5 text-sm focus:outline-none focus:border-amber-500"
                                  >
                                    {units.map((u) => <option key={u} value={u}>{u}</option>)}
                                  </select>
                                  <select
                                    value={editIngGroup}
                                    onChange={(e) => setEditIngGroup(e.target.value as IngredientGroup)}
                                    className="border border-amber-300 rounded-xl px-2 py-1.5 text-sm focus:outline-none focus:border-amber-500"
                                  >
                                    {groups.map((g) => <option key={g} value={g}>{GROUP_LABEL[g]}</option>)}
                                  </select>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => saveEditIngredient(ing.id)}
                                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
                                  >
                                    ✓ Uložit
                                  </button>
                                  <button
                                    onClick={() => setEditingIngId(null)}
                                    className="flex-1 border border-gray-200 text-gray-500 text-xs py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    Zrušit
                                  </button>
                                  <button
                                    onClick={() => { removeIngredient(ing.id); setEditingIngId(null) }}
                                    className="border border-red-200 text-red-400 text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                  >
                                    🗑
                                  </button>
                                </div>
                              </div>
                            )}
                          </SortableIngredientRow>
                        ))}
                      </div>
                    )
                  })}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      )}

      {/* Tab: Postup */}
      {tab === 'process' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-gray-800">Přidat krok</h3>
            <input
              type="text"
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              placeholder="Název kroku (volitelné, např. Moření)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
            />
            <textarea
              value={newStepDesc}
              onChange={(e) => setNewStepDesc(e.target.value)}
              rows={3}
              placeholder="Popis postupu *"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400 resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={newStepTemp}
                onChange={(e) => setNewStepTemp(e.target.value)}
                placeholder="Teplota (°C)"
                className="border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
              />
              <input
                type="number"
                value={newStepDur}
                onChange={(e) => setNewStepDur(e.target.value)}
                placeholder="Doba (min)"
                className="border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              onClick={addStep}
              disabled={!newStepDesc.trim()}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              + Přidat krok
            </button>
          </div>

          {steps.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleStepDragEnd}>
                <SortableContext items={[...steps].sort((a, b) => a.order - b.order).map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  {[...steps].sort((a, b) => a.order - b.order).map((step, i) => (
                    <SortableStepRow key={step.id} step={step} index={i} onRemove={() => removeStep(step.id)} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      )}

      {/* Tab: Fotky */}
      {tab === 'photos' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <button
              onClick={() => photoInputRef.current?.click()}
              className="w-full border-2 border-dashed border-amber-200 hover:border-amber-400 text-amber-700 font-medium py-6 rounded-xl transition-colors flex flex-col items-center gap-2"
            >
              <span className="text-3xl">📷</span>
              <span>Přidat fotku</span>
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={handlePhotoChange} />
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, i) => (
                <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-amber-50">
                  <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" />
                  {photo.isPrimary && (
                    <div className="absolute top-1 left-1 bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">Hlavní</div>
                  )}
                  <div className="absolute top-1 right-1 flex gap-1">
                    {!photo.isPrimary && (
                      <button
                        onClick={() => setPhotos((prev) => prev.map((p, j) => ({ ...p, isPrimary: j === i })))}
                        className="bg-white/90 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-white shadow"
                        title="Nastavit jako hlavní"
                      >★</button>
                    )}
                    <button
                      onClick={() => setPhotos((prev) => {
                        const filtered = prev.filter((_, j) => j !== i)
                        if (photo.isPrimary && filtered.length > 0) filtered[0].isPrimary = true
                        return filtered
                      })}
                      className="bg-white/90 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-100 shadow text-red-500"
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Poznámky */}
      {tab === 'notes' && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <label className="text-sm font-medium text-gray-700 block mb-2">Poznámky k receptu</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
            placeholder="Tipy, zkušenosti, variace receptu…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400 resize-y text-sm"
          />
        </div>
      )}

      {/* Uložit */}
      <div className="flex gap-3 border-t pt-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {isNew ? '✅ Vytvořit recept' : '💾 Uložit změny'}
        </button>
        <button
          onClick={() => navigate(isNew ? '/' : `/recipe/${id}`)}
          className="border border-gray-200 text-gray-500 font-medium px-5 py-3 rounded-xl transition-colors hover:bg-gray-50"
        >
          Zrušit
        </button>
      </div>
    </div>
  )
}
