import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import GlobalSearch from './GlobalSearch'

declare const __APP_VERSION__: string

function backTarget(pathname: string): { to: string; label: string } | null {
  if (pathname.startsWith('/denik')) return { to: '/', label: 'Kuchařka' }
  if (pathname.startsWith('/suroviny')) return { to: '/', label: 'Kuchařka' }
  if (pathname.startsWith('/normy')) return { to: '/', label: 'Kuchařka' }
  const editMatch = pathname.match(/^\/recipe\/([^/]+)\/edit$/)
  if (editMatch) return { to: `/recipe/${editMatch[1]}`, label: 'Recept' }
  // /recipe/:id — go back in history (může přijít z kategorie, hubu i searche)
  if (pathname.match(/^\/recipe\/[^/]+$/)) return null
  if (pathname.startsWith('/category/')) return { to: '/', label: 'Recepty' }
  return null
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isHub = location.pathname === '/'
  // Na /suroviny má stránka vlastní search — v headeru ho skryjeme
  const hideHeaderSearch = isHub || location.pathname === '/suroviny'
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-surface)' }}>
      <header
        className="px-4 sm:px-6 h-16 flex items-center gap-4 sticky top-0 z-30"
        style={{
          background: 'linear-gradient(135deg, #2d1f0f 0%, #3d2510 60%, #4a2f14 100%)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo — skryje se na mobilu při otevřeném searchi */}
        {!mobileSearchOpen && (
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl leading-none shadow-md group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(145deg, #c0392b, #7b241c)' }}
            >
              🔥
            </span>
            <span className="font-bold text-white tracking-tight text-xl hidden sm:inline">Kuchařka</span>
          </Link>
        )}

        {/* Search — na desktopu vždy, na mobilu jen mimo Hub nebo když je otevřený */}
        {(!hideHeaderSearch || mobileSearchOpen) && (
          <div className={`flex-1 max-w-sm ${mobileSearchOpen ? 'block' : 'hidden sm:block'}`}>
            <GlobalSearch dark />
          </div>
        )}

        <div className="flex-1 sm:flex-none" />

        {/* Mobilní search ikona (jen mimo Hub a mimo Suroviny) */}
        {!hideHeaderSearch && !mobileSearchOpen && (
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="sm:hidden text-white/70 hover:text-white p-2 transition-colors"
            aria-label="Hledat"
          >
            🔍
          </button>
        )}

        {/* Zavřít search na mobilu */}
        {mobileSearchOpen && (
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="text-white/70 hover:text-white text-sm shrink-0"
          >
            ✕
          </button>
        )}

        {/* Zpět */}
        {!isHub && !mobileSearchOpen && (() => {
          const isRecipeDetail = !!location.pathname.match(/^\/recipe\/[^/]+$/)
          if (isRecipeDetail) {
            return (
              <button
                onClick={() => navigate(-1)}
                className="text-sm text-amber-200/70 hover:text-white transition-colors shrink-0 flex items-center gap-1"
              >
                ←
              </button>
            )
          }
          const target = backTarget(location.pathname)
          if (!target) return null
          return (
            <Link
              to={target.to}
              className="text-sm text-amber-200/70 hover:text-white transition-colors shrink-0 flex items-center gap-1"
            >
              ← <span className="hidden sm:inline">{target.label}</span>
            </Link>
          )
        })()}
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
        {children}
      </main>

      <footer className="no-print text-center text-xs text-gray-400 py-4 border-t border-black/5">
        © Lukáš Praus {new Date().getFullYear()} · v{__APP_VERSION__}
      </footer>
    </div>
  )
}
