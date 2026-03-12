import { useParams } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { AppLayout } from '@/components/layout/AppLayout'
import { Sidebar } from '@/components/layout/Sidebar'
import { SessionWizard } from './SessionWizard'
import { ClosedSessionView } from './ClosedSessionView'
import { Loader2 } from 'lucide-react'

export function SessionPageComponent() {
  const { id } = useParams<{ id: string }>()
  const { session } = useSession(id)

  if (!session) {
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
