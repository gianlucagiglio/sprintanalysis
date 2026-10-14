import { ReactNode, useEffect } from 'react'
import { Navbar } from './Navbar'
import { BadgeUnlockModal } from '@/components/gamification/BadgeUnlockModal'
import { OverdueActionsModal } from '@/components/actions/OverdueActionsModal'
import { useTeams } from '@/hooks/useTeams'
import { useTeamStore } from '@/stores/teamStore'

interface AppLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
}

export function AppLayout({ children, sidebar }: AppLayoutProps) {
  const { teams } = useTeams()
  const initialize = useTeamStore(s => s.initialize)

  // Inizializza teamStore quando i team sono caricati
  useEffect(() => {
    if (teams.length > 0) {
      initialize(teams)
    }
  }, [teams, initialize])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {sidebar}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">{children}</main>
      </div>

      {/* Notification modals */}
      <BadgeUnlockModal />
      <OverdueActionsModal />
    </div>
  )
}
