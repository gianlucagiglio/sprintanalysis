import { useState, useEffect } from 'react'
import type { Changelog, ChangelogType } from '@/types'

interface ChangelogFormProps {
  changelog?: Changelog | null
  nextVersion: (type: ChangelogType) => string
  onSubmit: (data: Omit<Changelog, 'id' | 'created_at' | 'version'> & { type: ChangelogType }) => Promise<void>
  onCancel: () => void
}

const TYPE_OPTIONS: { value: ChangelogType; label: string; color: string }[] = [
  { value: 'major', label: 'Major - Breaking changes', color: 'var(--danger)' },
  { value: 'minor', label: 'Minor - New features', color: 'var(--warning)' },
  { value: 'patch', label: 'Patch - Bug fixes', color: 'var(--success)' },
]

export function ChangelogForm({ changelog, nextVersion, onSubmit, onCancel }: ChangelogFormProps) {
  const [type, setType] = useState<ChangelogType>('minor')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (changelog) {
      setType(changelog.type)
      setTitle(changelog.title)
      setDescription(changelog.description)
      setReleaseDate(changelog.release_date)
    } else {
      setType('minor')
      setTitle('')
      setDescription('')
      setReleaseDate(new Date().toISOString().split('T')[0])
    }
  }, [changelog])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        type,
        title: title.trim(),
        description: description.trim(),
        release_date: releaseDate,
      })
      onCancel()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewVersion = changelog ? changelog.version : nextVersion(type)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Selection */}
      <div>
        <label className="label">Version type</label>
        <div className="space-y-2">
          {TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={type === option.value}
                onChange={(e) => setType(e.target.value as ChangelogType)}
                className="w-4 h-4"
                style={{ accentColor: option.color }}
                disabled={!!changelog}
              />
              <div className="flex-1">
                <div className="font-medium text-[var(--text-primary)]">{option.label}</div>
                {!changelog && (
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    Next version: <span className="font-mono font-semibold">{nextVersion(option.value)}</span>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Preview Version */}
      <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
        <div className="text-sm text-[var(--text-secondary)] mb-1">Version</div>
        <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
          v{previewVersion}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="label">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input w-full"
          placeholder="e.g. New Gantt view release"
          required
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="label">
          Changes (Markdown)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input w-full font-mono text-sm"
          rows={10}
          placeholder={`**Features:**\n- Added Gantt view\n- Advanced filters\n\n**Bug fixes:**\n- Fix capacity calculation\n- Fix date validation`}
          required
        />
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Use **text** for bold, - for lists
        </p>
      </div>

      {/* Release Date */}
      <div>
        <label htmlFor="releaseDate" className="label">
          Release date
        </label>
        <input
          id="releaseDate"
          type="date"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
          className="input w-full font-mono"
          required
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-[var(--border-primary)]">
        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !description.trim()}
          className="btn btn-primary flex-1"
        >
          {isSubmitting ? 'Saving...' : changelog ? 'Update' : 'Create Version'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
