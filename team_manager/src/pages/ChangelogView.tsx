import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useChangelog } from '@/hooks/useChangelog'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ChangelogEntry } from '@/components/changelog/ChangelogEntry'
import { ChangelogForm } from '@/components/changelog/ChangelogForm'
import type { Changelog } from '@/types'

export function ChangelogView() {
  const {
    changelogs,
    isLoading,
    latestVersion,
    getNextVersion,
    createChangelog,
    updateChangelog,
    deleteChangelog,
    refreshChangelogs,
  } = useChangelog()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingChangelog, setEditingChangelog] = useState<Changelog | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleSubmit = async (data: Omit<Changelog, 'id' | 'created_at' | 'version'> & { type: any }) => {
    if (editingChangelog) {
      await updateChangelog(editingChangelog.id, data)
    } else {
      await createChangelog(data)
    }
    setModalOpen(false)
    setEditingChangelog(null)
  }

  const handleEdit = (changelog: Changelog) => {
    setEditingChangelog(changelog)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await deleteChangelog(deletingId)
      setDeletingId(null)
    }
    setDeleteDialogOpen(false)
  }

  const getDeleteMessage = () => {
    const changelog = changelogs.find((c) => c.id === deletingId)
    return `Sei sicuro di voler eliminare la versione ${changelog?.version}? Questa azione non può essere annullata.`
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--text-secondary)]">Caricamento changelog...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Changelog</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Storico versioni e modifiche • Versione corrente:{' '}
            <span className="font-mono font-semibold text-[var(--accent-primary)]">
              v{latestVersion}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshChangelogs}
            className="btn btn-secondary"
          >
            Ricarica
          </button>
          <button
            onClick={() => {
              setEditingChangelog(null)
              setModalOpen(true)
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nuova Versione
          </button>
        </div>
      </div>

      {/* Changelog List */}
      {changelogs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)] mb-4">
            Nessuna versione nel changelog. Inizia creando la prima versione!
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Crea Prima Versione
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {changelogs.map((changelog) => (
            <ChangelogEntry
              key={changelog.id}
              changelog={changelog}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingChangelog(null)
        }}
        title={editingChangelog ? `Modifica v${editingChangelog.version}` : 'Nuova Versione'}
      >
        <ChangelogForm
          changelog={editingChangelog}
          nextVersion={getNextVersion}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false)
            setEditingChangelog(null)
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Conferma eliminazione"
        message={getDeleteMessage()}
        type="danger"
        confirmText="Elimina"
        cancelText="Annulla"
      />
    </div>
  )
}
