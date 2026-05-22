import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecipeStore } from '../store/recipeStore'
import { BUILT_IN_CATEGORIES } from '../types/recipe'

interface Props {
  dark?: boolean
  prominent?: boolean
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    text.slice(0, idx) +
    `<mark class="bg-amber-200 rounded-sm">${text.slice(idx, idx + query.length)}</mark>` +
    text.slice(idx + query.length)
  )
}

export default function GlobalSearch({ dark, prominent }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const searchRecipes = useRecipeStore((s) => s.searchRecipes)
  const customCategories = useRecipeStore((s) => s.customCategories)

  const results = query.trim().length >= 1 ? searchRecipes(query).slice(0, 8) : []

  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      navigate(`/recipe/${results[selectedIdx].id}`)
      setOpen(false)
      setQuery('')
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const inputCls = dark
    ? 'bg-white/10 text-white placeholder-white/40 border-white/20 focus:border-white/40 focus:bg-white/15'
    : 'bg-white text-gray-900 placeholder-gray-400 border-gray-200 focus:border-amber-400'

  return (
    <div ref={wrapRef} className="relative w-full">
      <input
        type="search"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        placeholder="Hledat recepty…"
        className={`w-full rounded-xl border px-4 py-2 text-sm outline-none transition-all ${inputCls} ${prominent ? 'text-base py-3' : ''}`}
      />
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {results.map((r, i) => (
            <button
              key={r.id}
              onMouseDown={() => {
                navigate(`/recipe/${r.id}`)
                setOpen(false)
                setQuery('')
              }}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                i === selectedIdx ? 'bg-amber-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-lg shrink-0">
                {(BUILT_IN_CATEGORIES.find((c) => c.id === r.meta.category) ??
                  customCategories.find((c) => c.id === r.meta.category))?.icon ?? '🍖'}
              </span>
              <div className="min-w-0">
                <div
                  className="font-medium text-sm truncate"
                  dangerouslySetInnerHTML={{ __html: highlight(r.meta.title, query) }}
                />
                {r.meta.description && (
                  <div className="text-xs text-gray-400 truncate">{r.meta.description}</div>
                )}
              </div>
              {r.meta.starred && <span className="ml-auto shrink-0 text-amber-400">★</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
