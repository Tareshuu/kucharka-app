import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSmokingStore } from '../store/smokingStore'
import { useRecipeStore } from '../store/recipeStore'
import SmokingSessionModal from '../components/SmokingSessionModal'
import type { SmokingSession, SmokingResult } from '../types/smoking'

function StarRow({ value }: { value: SmokingResult }) {
  return (
    <span className="text-amber-400 tracking-tight text-sm">
      {'★'.repeat(value)}<span className="text-gray-200">{'★'.repeat(5 - value)}</span>
    </span>
  )
}

function weightLoss(before: number, after: number) {
  return (((before - after) / before) * 100).toFixed(1)
}

interface SessionCardProps {
  session: SmokingSession
  recipeExists: boolean
  onEdit: () => void
  onDelete: () => void
}

function SessionCard({ session, recipeExists, onEdit, onDelete }: SessionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)

  const dateFormatted = new Date(session.date).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const loss = session.weightAfterKg
    ? weightLoss(session.weightKg, session.weightAfterKg)
    : null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Hlavní řádek */}
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Datum badge */}
        <div className="shrink-0 bg-amber-50 rounded-xl px-3 py-2 text-center min-w-[56px]">
          <div className="text-xs text-amber-600 font-medium">
            {new Date(session.date).toLocaleDateString('cs-CZ', { month: 'short' }).replace('.', '')}
          </div>
          <div className="text-lg font-bold text-amber-800 leading-none">
            {new Date(session.date).getDate()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-gray-900 truncate">{session.recipeTitle}</div>
            <StarRow value={session.result} />
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
            <span>🌳 {session.wood}</span>
            <span>🌡️ {session.smokingTempC} °C</span>
            <span>⏱ {session.smokingDurationH} hod</span>
            <span>⚖️ {session.weightKg} kg{session.weightAfterKg ? ` → ${session.weightAfterKg} kg` : ''}</span>
            {loss && <span className="text-green-600 font-medium">−{loss} %</span>}
          </div>
          {session.notes && !expanded && (
            <p className="mt-1 text-xs text-gray-400 truncate">{session.notes}</p>
          )}
        </div>

        <div className={`shrink-0 text-gray-300 transition-transform text-base leading-none ${expanded ? '' : 'rotate-180'}`}>
          ▴
        </div>
      </button>

      {/* Rozbalené detaily */}
      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-3">
          {/* Statistiky */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Teplota', value: `${session.smokingTempC} °C` },
              { label: 'Uzení', value: `${session.smokingDurationH} hod` },
              { label: 'Hmotnost před', value: `${session.weightKg} kg` },
              session.weightAfterKg
                ? { label: 'Hmotnost po', value: `${session.weightAfterKg} kg (−${loss} %)` }
                : { label: 'Hmotnost po', value: '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-2.5">
                <div className="text-xs text-gray-400">{label}</div>
                <div className="text-sm font-semibold text-gray-800 mt-0.5">{value}</div>
              </div>
            ))}
          </div>

          {session.dryingDurationDays && (
            <div className="text-sm text-gray-600">
              Sušení: <span className="font-medium">{session.dryingDurationDays} dní</span>
            </div>
          )}

          {session.notes && (
            <div className="bg-amber-50 rounded-xl p-3">
              <div className="text-xs text-amber-700 font-medium mb-1">Poznámky</div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.notes}</p>
            </div>
          )}

          <div className="text-xs text-gray-400">{dateFormatted}</div>

          {/* Akce */}
          <div className="flex gap-2 pt-1 flex-wrap">
            {session.recipeId && recipeExists && (
              <Link
                to={`/recipe/${session.recipeId}`}
                className="text-xs border border-amber-200 text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                📖 Recept
              </Link>
            )}
            <button
              onClick={onEdit}
              className="text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              ✏️ Upravit
            </button>
            <div className="ml-auto flex gap-2">
              {pendingDelete ? (
                <>
                  <button
                    onClick={onDelete}
                    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ⚠️ Potvrdit
                  </button>
                  <button
                    onClick={() => setPendingDelete(false)}
                    className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Zrušit
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setPendingDelete(true)}
                  className="text-xs border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Smazat
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SmokingDiary() {
  const { sessions, addSession, updateSession, deleteSession } = useSmokingStore()
  const { recipes } = useRecipeStore()

  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<SmokingSession | null>(null)
  const [filterYear, setFilterYear] = useState<string>('všechny')
  const [filterWood, setFilterWood] = useState<string>('všechna')

  const recipeIds = new Set(recipes.map((r) => r.id))

  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date))

  const years = [...new Set(sessions.map((s) => s.date.slice(0, 4)))].sort().reverse()
  const woods = [...new Set(sessions.map((s) => s.wood))].sort()

  const filtered = sorted.filter((s) => {
    if (filterYear !== 'všechny' && !s.date.startsWith(filterYear)) return false
    if (filterWood !== 'všechna' && s.wood !== filterWood) return false
    return true
  })

  const avgResult = sessions.length
    ? (sessions.reduce((sum, s) => sum + s.result, 0) / sessions.length).toFixed(1)
    : null

  const avgLoss = sessions.filter((s) => s.weightAfterKg).length
    ? (
        sessions
          .filter((s) => s.weightAfterKg)
          .reduce((sum, s) => sum + parseFloat(weightLoss(s.weightKg, s.weightAfterKg!)), 0) /
        sessions.filter((s) => s.weightAfterKg).length
      ).toFixed(1)
    : null

  return (
    <div className="space-y-6">
      {/* Hlavička */}
      <div
        className="rounded-2xl p-6 flex items-center gap-4"
        style={{ background: 'linear-gradient(145deg, #4a3728, #2c1f15)' }}
      >
        <span className="text-5xl">🪵</span>
        <div>
          <h1 className="text-2xl font-bold text-white">Deník uzení</h1>
          <p className="text-white/70 text-sm mt-0.5">
            {sessions.length === 0
              ? 'Začněte prvním záznamem'
              : `${sessions.length} ${sessions.length === 1 ? 'záznam' : sessions.length <= 4 ? 'záznamy' : 'záznamů'}`}
          </p>
        </div>
      </div>

      {/* Statistiky */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: sessions.length.toString(), label: 'Celkem uzení', color: 'text-gray-800' },
            { value: avgResult ? `${avgResult} ★` : '—', label: 'Prům. hodnocení', color: 'text-amber-500' },
            { value: avgLoss ? `−${avgLoss} %` : '—', label: 'Prům. úbytek', color: 'text-green-600' },
          ].map(({ value, label, color }) => (
            <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
              <div className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Akce a filtry */}
      <div className="flex items-center gap-2 flex-wrap">
        {years.length > 1 && (
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-amber-400"
          >
            <option value="všechny">Všechny roky</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        {woods.length > 1 && (
          <select
            value={filterWood}
            onChange={(e) => setFilterWood(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-amber-400"
          >
            <option value="všechna">Všechna dřeva</option>
            {woods.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        )}
        <div className="flex-1" />
        <button
          onClick={() => setShowAdd(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm"
        >
          + Nový záznam
        </button>
      </div>

      {/* Seznam záznamů */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="text-6xl">{sessions.length === 0 ? '🪵' : '🔍'}</div>
          <h2 className="text-xl font-bold text-gray-700">
            {sessions.length === 0 ? 'Zatím žádné záznamy' : 'Nic neodpovídá filtru'}
          </h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            {sessions.length === 0
              ? 'Zaznamenávejte každé uzení — teploty, časy, výsledky a poznámky.'
              : 'Zkuste změnit nebo zrušit filtry.'}
          </p>
          {sessions.length === 0 && (
            <button
              onClick={() => setShowAdd(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              + Přidat první záznam
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              recipeExists={!!session.recipeId && recipeIds.has(session.recipeId)}
              onEdit={() => setEditing(session)}
              onDelete={() => deleteSession(session.id)}
            />
          ))}
        </div>
      )}

      {/* Modály */}
      {showAdd && (
        <SmokingSessionModal
          onSave={(data) => { addSession(data); setShowAdd(false) }}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editing && (
        <SmokingSessionModal
          initial={editing}
          onSave={(data) => { updateSession(editing.id, data); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
