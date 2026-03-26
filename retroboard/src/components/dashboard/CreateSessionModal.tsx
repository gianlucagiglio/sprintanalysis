import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTeams } from '@/hooks/useTeams'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { quizThemes } from '@/data/quizThemes'
import { canCreate } from '@/config/permissions'

interface CreateSessionModalProps {
  open: boolean
  onClose: () => void
}

const DEFAULT_SECTIONS = [
  { name: 'Cosa è andato bene', sort_order: 0 },
  { name: 'Cosa migliorare', sort_order: 1 },
  { name: 'Idee e suggerimenti', sort_order: 2 },
]

export function CreateSessionModal({ open, onClose }: CreateSessionModalProps) {
  const [title, setTitle] = useState('')
  const [teamId, setTeamId] = useState<string>('')
  const [quizTheme, setQuizTheme] = useState('tech')
  const [loading, setLoading] = useState(false)
  const user = useAuthStore((s) => s.user)
  const { teams } = useTeams()
  const navigate = useNavigate()

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim() || !canCreate(user.email)) return
    setLoading(true)

    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          title: title.trim(),
          organizer_id: user.id,
          max_participants: 20,
          ...(teamId ? { team_id: teamId } : {}),
        })
        .select()
        .single()

      if (error) throw error
      if (!session) return

      // Add only the organizer as participant — team members join on their own
      await supabase.from('session_participants').insert({
        session_id: session.id,
        user_id: user.id,
        role: 'organizer',
      })

      // Create default sections
      await supabase.from('sections').insert(
        DEFAULT_SECTIONS.map((s) => ({
          session_id: session.id,
          ...s,
          requires_interaction: true,
        }))
      )

      // Create quiz questions from selected theme
      const theme = quizThemes.find((t) => t.id === quizTheme) ?? quizThemes[0]
      await supabase.from('quiz_questions').insert(
        theme.questions.map((q, i) => ({
          session_id: session.id,
          question: q.question,
          choices: JSON.stringify(q.choices),
          correct_choice: q.correct_choice,
          sort_order: i,
        }))
      )

      navigate(`/session/${session.id}`)
    } catch (err) {
      console.error('Error creating session:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuova Retrospettiva">
      <form onSubmit={handleCreate} className="space-y-5">
        <Input
          label="Titolo sessione"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Es. Sprint 42 - Retrospettiva di fine ciclo"
          required
          autoFocus
        />
        {teams.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-retro-text">
              Team (opzionale)
            </label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-retro-text text-sm transition-all duration-200 focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10"
            >
              <option value="">Nessun team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-retro-text">
            Tema quiz
          </label>
          <select
            value={quizTheme}
            onChange={(e) => setQuizTheme(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-retro-text text-sm transition-all duration-200 focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10"
          >
            {quizThemes.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-retro-text-secondary bg-retro-surface rounded-xl px-4 py-3">
          Sezioni predefinite: {DEFAULT_SECTIONS.map((s) => s.name).join(', ')}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          <Plus size={16} />
          {loading ? 'Creazione...' : 'Crea sessione'}
        </Button>
      </form>
    </Modal>
  )
}
