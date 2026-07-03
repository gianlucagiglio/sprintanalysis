import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { AppLayout } from '@/components/layout/AppLayout'
import { Sidebar } from '@/components/layout/Sidebar'
import { SessionWizard } from './SessionWizard'
import { ClosedSessionView } from './ClosedSessionView'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function SessionPageComponent() {
  const { id } = useParams<{ id: string }>()
  const { session } = useSession(id)
  const navigate = useNavigate()
  const [notFound, setNotFound] = useState(false)

  // After 3 seconds of loading, consider it not found
  useEffect(() => {
    if (!session) {
      const timer = setTimeout(() => {
        setNotFound(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [session])

  if (!session) {
    if (notFound) {
      return (
        <AppLayout>
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <AlertCircle size={48} className="text-red-500" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-retro-text mb-2">
                Retrospettiva non trovata
              </h2>
              <p className="text-sm text-retro-text-secondary mb-4">
                Questa retrospettiva potrebbe essere stata cancellata o non esiste.
              </p>
              <Button onClick={() => navigate('/retrospettive')}>
                Torna alle retrospettive
              </Button>
            </div>
          </div>
        </AppLayout>
      )
    }

    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-retro-primary" size={32} />
        </div>
      </AppLayout>
    )
  }

  // Closed session — show read-only summary
  if (session.current_step === 5) {
    return (
      <AppLayout>
        <ClosedSessionView sessionId={session.id} sessionTitle={session.title} />
      </AppLayout>
    )
  }

  return (
    <AppLayout sidebar={<Sidebar />}>
      <SessionWizard sessionId={session.id} />
    </AppLayout>
  )
}
