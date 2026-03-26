import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { CreateTeamModal } from '@/components/team/CreateTeamModal'
import { useTeams } from '@/hooks/useTeams'
import { Plus, Users, LogIn, Crown, Shield, User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { canCreate } from '@/config/permissions'

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
}

const roleLabels = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Membro',
}

export function TeamsPage() {
  const { teams, loading, joinByCode } = useTeams()
  const user = useAuthStore((s) => s.user)
  const [showCreate, setShowCreate] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinMessage, setJoinMessage] = useState<{ text: string; error: boolean } | null>(null)
  const navigate = useNavigate()

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) return
    setJoinLoading(true)
    setJoinMessage(null)

    const result = await joinByCode(inviteCode.trim())
    if (result.success && result.teamId) {
      setInviteCode('')
      if (result.error) {
        setJoinMessage({ text: result.error, error: false })
      }
      navigate(`/team/${result.teamId}`)
    } else {
      setJoinMessage({ text: result.error || 'Errore', error: true })
    }
    setJoinLoading(false)
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-retro-text">I miei Team</h1>
          {canCreate(user?.email) && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} />
              Crea team
            </Button>
          )}
        </div>

        {/* Join by invite code */}
        <Card>
          <form onSubmit={handleJoin} className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label="Unisciti con codice invito"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Incolla il codice invito..."
              />
            </div>
            <Button type="submit" disabled={joinLoading || !inviteCode.trim()}>
              <LogIn size={16} />
              {joinLoading ? 'Accesso...' : 'Unisciti'}
            </Button>
          </form>
          {joinMessage && (
            <p className={`mt-2 text-sm ${joinMessage.error ? 'text-red-500' : 'text-emerald-500'}`}>
              {joinMessage.text}
            </p>
          )}
        </Card>

        {/* Teams list */}
        {loading ? (
          <p className="text-retro-text-secondary text-center py-8">Caricamento...</p>
        ) : teams.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-retro-text-secondary">
              <div className="w-16 h-16 rounded-2xl bg-retro-primary-light mx-auto mb-4 flex items-center justify-center">
                <Users size={32} className="text-retro-primary" />
              </div>
              <p className="font-medium text-retro-text">Non fai parte di nessun team</p>
              <p className="text-sm mt-1">Crea un team o unisciti con un codice invito.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {teams.map((team) => {
              const RoleIcon = roleIcons[team.my_role]
              return (
                <Card
                  key={team.id}
                  hover
                  onClick={() => navigate(`/team/${team.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-retro-primary to-violet-500 flex items-center justify-center">
                        <Users size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-retro-text">{team.name}</h3>
                        <p className="text-sm text-retro-text-secondary">
                          {team.member_count} {team.member_count === 1 ? 'membro' : 'membri'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="primary">
                      <RoleIcon size={12} className="mr-1" />
                      {roleLabels[team.my_role]}
                    </Badge>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <CreateTeamModal open={showCreate} onClose={() => setShowCreate(false)} />
    </AppLayout>
  )
}
