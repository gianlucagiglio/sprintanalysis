import { Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import type { Changelog } from '@/types'

interface ChangelogEntryProps {
  changelog: Changelog
  onEdit: (changelog: Changelog) => void
  onDelete: (id: string) => void
}

const TYPE_CONFIG = {
  major: {
    label: 'MAJOR',
    color: 'var(--danger)',
    bgColor: 'var(--danger)20',
  },
  minor: {
    label: 'MINOR',
    color: 'var(--warning)',
    bgColor: 'var(--warning)20',
  },
  patch: {
    label: 'PATCH',
    color: 'var(--success)',
    bgColor: 'var(--success)20',
  },
}

export function ChangelogEntry({ changelog, onEdit, onDelete }: ChangelogEntryProps) {
  const config = TYPE_CONFIG[changelog.type]
  const releaseDate = format(new Date(changelog.release_date), 'd MMMM yyyy', { locale: it })

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* Timeline indicator */}
        <div className="flex flex-col items-center">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          <div className="w-0.5 flex-1 bg-[var(--border-primary)] mt-2" />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] font-mono">
                v{changelog.version}
              </h3>
              <span
                className="px-2 py-1 text-xs font-semibold rounded"
                style={{
                  color: config.color,
                  backgroundColor: config.bgColor,
                }}
              >
                {config.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(changelog)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                title="Modifica"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(changelog.id)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
                title="Elimina"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            {changelog.title}
          </h4>

          {/* Date */}
          <p className="text-sm text-[var(--text-tertiary)] mb-4">{releaseDate}</p>

          {/* Description (Markdown) */}
          <div className="prose prose-sm max-w-none text-[var(--text-secondary)]">
            <div
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(changelog.description) }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple markdown formatter (bold, lists)
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
}
