import type { ProcessStep } from '../types/recipe'

interface Props {
  steps: ProcessStep[]
}

export default function ProcessSteps({ steps }: Props) {
  if (steps.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-6">
        Postup výroby není zadán
      </div>
    )
  }

  const sorted = [...steps].sort((a, b) => a.order - b.order)
  const totalMinutes = sorted.reduce((sum, s) => sum + (s.duration ?? 0), 0)

  return (
    <>
      {totalMinutes > 0 && (
        <div className="mb-4 text-sm text-gray-500 flex items-center gap-1.5">
          <span>⏱️</span>
          <span>
            Celková doba:{' '}
            <strong className="text-gray-700">
              {totalMinutes >= 60
                ? `${Math.floor(totalMinutes / 60)} h${totalMinutes % 60 > 0 ? ` ${totalMinutes % 60} min` : ''}`
                : `${totalMinutes} min`}
            </strong>
          </span>
        </div>
      )}
      <ol className="space-y-4">
        {sorted.map((step, i) => (
          <li key={step.id} className="process-step flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-bold">
              {i + 1}
            </div>
            <div className="flex-1 pt-0.5">
              {step.title && (
                <div className="font-semibold text-gray-800 mb-1">{step.title}</div>
              )}
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {step.description}
              </p>
              {(step.temperature !== undefined || step.duration !== undefined) && (
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  {step.temperature !== undefined && (
                    <span>🌡️ {step.temperature} °C</span>
                  )}
                  {step.duration !== undefined && step.duration > 0 && (
                    <span>
                      ⏱️ {step.duration >= 60
                        ? `${Math.floor(step.duration / 60)} h ${step.duration % 60 > 0 ? `${step.duration % 60} min` : ''}`
                        : `${step.duration} min`}
                    </span>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}
