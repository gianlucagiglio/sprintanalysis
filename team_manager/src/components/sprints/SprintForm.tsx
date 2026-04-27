import { useState, useEffect } from 'react'
import { addWeeks, format, differenceInWeeks, differenceInDays, addDays } from 'date-fns'
import type { Sprint } from '@/types'

interface SprintFormProps {
  sprint?: Sprint | null
  existingSprints?: Sprint[]
  onSubmit: (data: Omit<Sprint, 'id' | 'created_at'>) => Promise<void>
  onSubmitMultiple?: (sprints: Omit<Sprint, 'id' | 'created_at'>[]) => Promise<void>
  onSubmitAndUpdateFollowing?: (data: Omit<Sprint, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

export function SprintForm({ sprint, existingSprints = [], onSubmit, onSubmitMultiple, onSubmitAndUpdateFollowing, onCancel }: SprintFormProps) {
  // Mode: 'single' o 'auto'
  const [mode, setMode] = useState<'single' | 'auto'>('single')

  // Single sprint fields
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [durationWeeks, setDurationWeeks] = useState(2)
  const [updateFollowing, setUpdateFollowing] = useState(true)

  // Auto generation fields
  const [startNumber, setStartNumber] = useState(1)
  const [firstSprintDate, setFirstSprintDate] = useState('')
  const [sprintDuration, setSprintDuration] = useState(2) // settimane
  const [sprintCount, setSprintCount] = useState(4)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Helper: calcola la prima data disponibile e il prossimo numero sprint
  const getNextSprintDefaults = () => {
    if (existingSprints.length === 0) {
      return { nextDate: '', nextNumber: 1 }
    }

    // Trova l'ultimo sprint per data di fine
    const sortedSprints = [...existingSprints].sort(
      (a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
    )
    const lastSprint = sortedSprints[0]

    // Prossima data = giorno dopo la fine dell'ultimo sprint
    const lastEndDate = new Date(lastSprint.end_date)
    const nextDate = addDays(lastEndDate, 1)

    // Prossimo numero: estrai numero dall'ultimo sprint
    const match = lastSprint.name.match(/Sprint\s+(\d+)/i)
    const nextNumber = match ? parseInt(match[1]) + 1 : existingSprints.length + 1

    return {
      nextDate: format(nextDate, 'yyyy-MM-dd'),
      nextNumber,
    }
  }

  useEffect(() => {
    if (sprint) {
      // Se stiamo editando, forza modalità single
      setMode('single')
      setName(sprint.name)
      setStartDate(sprint.start_date)
      setEndDate(sprint.end_date)

      // Calcola durata in settimane
      const start = new Date(sprint.start_date)
      const end = new Date(sprint.end_date)
      const days = differenceInDays(end, start) + 1 // +1 per includere l'ultimo giorno
      const weeks = Math.round(days / 7)
      setDurationWeeks(weeks)
    } else {
      // Modalità creazione: usa valori predefiniti intelligenti
      const { nextDate, nextNumber } = getNextSprintDefaults()

      setName('')
      setStartDate(nextDate)
      setEndDate('')
      setDurationWeeks(2)
      setUpdateFollowing(true)
      setStartNumber(nextNumber)
      setFirstSprintDate(nextDate)
      setSprintDuration(2)
      setSprintCount(4)
    }
  }, [sprint, existingSprints])

  // Auto-calcola endDate quando startDate cambia (solo in modalità creazione)
  useEffect(() => {
    if (!sprint && startDate && !endDate) {
      const start = new Date(startDate)
      const end = addWeeks(start, durationWeeks)
      end.setDate(end.getDate() - 1)
      setEndDate(format(end, 'yyyy-MM-dd'))
    }
  }, [startDate, sprint])

  // Handler per cambio durata
  const handleDurationChange = (newDurationWeeks: number) => {
    setDurationWeeks(newDurationWeeks)
    if (startDate) {
      // Ricalcola end_date basandosi sulla nuova durata
      const start = new Date(startDate)
      const newEnd = addWeeks(start, newDurationWeeks)
      newEnd.setDate(newEnd.getDate() - 1) // Sottrai 1 giorno per avere l'ultimo giorno dello sprint
      setEndDate(format(newEnd, 'yyyy-MM-dd'))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (mode === 'single') {
        // Modalità singolo sprint
        if (!name.trim() || !startDate || !endDate) return
        if (new Date(endDate) < new Date(startDate)) {
          alert('La data di fine deve essere successiva alla data di inizio')
          return
        }

        const sprintData = {
          name: name.trim(),
          start_date: startDate,
          end_date: endDate,
        }

        // Se stiamo modificando e la checkbox è attiva, aggiorna anche le sprint successive
        if (sprint && updateFollowing && onSubmitAndUpdateFollowing) {
          await onSubmitAndUpdateFollowing(sprintData)
        } else {
          await onSubmit(sprintData)
        }
      } else {
        // Modalità auto-generation
        if (!firstSprintDate || sprintCount < 1) return

        const sprints: Omit<Sprint, 'id' | 'created_at'>[] = []
        let currentStartDate = new Date(firstSprintDate)

        for (let i = 0; i < sprintCount; i++) {
          const sprintEndDate = addWeeks(currentStartDate, sprintDuration)
          // Sottrai 1 giorno per avere l'ultimo giorno della sprint
          sprintEndDate.setDate(sprintEndDate.getDate() - 1)

          sprints.push({
            name: `Sprint ${startNumber + i}`,
            start_date: format(currentStartDate, 'yyyy-MM-dd'),
            end_date: format(sprintEndDate, 'yyyy-MM-dd'),
          })

          // Prossimo sprint inizia il giorno dopo la fine di questo
          currentStartDate = new Date(sprintEndDate)
          currentStartDate.setDate(currentStartDate.getDate() + 1)
        }

        if (onSubmitMultiple) {
          await onSubmitMultiple(sprints)
        }
      }

      onCancel()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Toggle modalità (solo in creazione) */}
      {!sprint && (
        <div className="flex gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === 'single'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            Singolo Sprint
          </button>
          <button
            type="button"
            onClick={() => setMode('auto')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === 'auto'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            Generazione Automatica
          </button>
        </div>
      )}

      {/* Form Singolo Sprint */}
      {mode === 'single' && (
        <>
          <div>
            <label htmlFor="sprint-name" className="label">
              Nome Sprint
            </label>
            <input
              id="sprint-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="es. Sprint 1 - Auth & Dashboard"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sprint-start" className="label">
                Data Inizio
              </label>
              <input
                id="sprint-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="sprint-end" className="label">
                Data Fine
              </label>
              <input
                id="sprint-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input w-full"
                required
              />
            </div>
          </div>

          {/* Durata in settimane - solo quando si modifica uno sprint */}
          {sprint && (
            <>
              <div>
                <label htmlFor="sprint-duration" className="label">
                  Durata (settimane)
                </label>
                <input
                  id="sprint-duration"
                  type="number"
                  value={durationWeeks}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value) || 2)}
                  className="input w-full"
                  min="1"
                  max="8"
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Modificando la durata, la data di fine verrà aggiornata automaticamente
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <input
                  id="update-following"
                  type="checkbox"
                  checked={updateFollowing}
                  onChange={(e) => setUpdateFollowing(e.target.checked)}
                  className="w-4 h-4 accent-[var(--accent-primary)]"
                />
                <label htmlFor="update-following" className="text-sm cursor-pointer">
                  <span className="font-medium text-[var(--text-primary)]">
                    Aggiorna sprint successive
                  </span>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    Le date di tutte le sprint successive verranno ricalcolate automaticamente
                  </p>
                </label>
              </div>
            </>
          )}
        </>
      )}

      {/* Form Generazione Automatica */}
      {mode === 'auto' && (
        <>
          <div>
            <label htmlFor="start-number" className="label">
              Numero di Partenza
            </label>
            <input
              id="start-number"
              type="number"
              value={startNumber}
              onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
              className="input w-full font-mono"
              placeholder="es. 160"
              autoFocus
              min="1"
              required
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Verrà generato: "Sprint {startNumber}", "Sprint {startNumber + 1}", ecc.
            </p>
          </div>

          <div>
            <label htmlFor="first-sprint-date" className="label">
              Data Inizio Primo Sprint
            </label>
            <input
              id="first-sprint-date"
              type="date"
              value={firstSprintDate}
              onChange={(e) => setFirstSprintDate(e.target.value)}
              className="input w-full"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sprint-duration" className="label">
                Durata Sprint (settimane)
              </label>
              <input
                id="sprint-duration"
                type="number"
                value={sprintDuration}
                onChange={(e) => setSprintDuration(parseInt(e.target.value))}
                className="input w-full"
                min="1"
                max="8"
                required
              />
            </div>

            <div>
              <label htmlFor="sprint-count" className="label">
                Numero Sprint da Creare
              </label>
              <input
                id="sprint-count"
                type="number"
                value={sprintCount}
                onChange={(e) => setSprintCount(parseInt(e.target.value))}
                className="input w-full"
                min="1"
                max="20"
                required
              />
            </div>
          </div>

          {/* Preview */}
          {firstSprintDate && (
            <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
              <p className="text-xs text-[var(--text-secondary)] mb-2">
                Anteprima sprint che verranno creati:
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Array.from({ length: Math.min(sprintCount, 5) }).map((_, i) => {
                  const startDate = addWeeks(new Date(firstSprintDate), i * sprintDuration)
                  const endDate = addWeeks(startDate, sprintDuration)
                  endDate.setDate(endDate.getDate() - 1)

                  return (
                    <div key={i} className="text-xs text-[var(--text-primary)] font-mono">
                      Sprint {startNumber + i}: {format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}
                    </div>
                  )
                })}
                {sprintCount > 5 && (
                  <div className="text-xs text-[var(--text-tertiary)]">
                    ... e altri {sprintCount - 5} sprint
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary flex-1"
        >
          {isSubmitting
            ? 'Creazione...'
            : sprint
            ? 'Aggiorna'
            : mode === 'auto'
            ? `Crea ${sprintCount} Sprint`
            : 'Crea Sprint'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Annulla
        </button>
      </div>
    </form>
  )
}
