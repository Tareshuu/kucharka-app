import { useState } from 'react'
import type { RecipePhoto } from '../types/recipe'

interface Props {
  photos: RecipePhoto[]
}

export default function PhotoGallery({ photos }: Props) {
  const [active, setActive] = useState<RecipePhoto | null>(null)

  if (photos.length === 0) return null

  const sorted = [...photos].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {sorted.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setActive(photo)}
            className="aspect-square rounded-xl overflow-hidden bg-amber-50 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <img
              src={photo.dataUrl}
              alt={photo.caption ?? ''}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={active.dataUrl}
              alt={active.caption ?? ''}
              className="w-full rounded-xl shadow-2xl max-h-[80vh] object-contain"
            />
            {active.caption && (
              <div className="mt-2 text-center text-white/80 text-sm">{active.caption}</div>
            )}
            <button
              onClick={() => setActive(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}
