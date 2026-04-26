import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTeam } from '@/hooks/useTeam'
import { Modal } from '@/components/ui/Modal'
import { RoleList } from '@/components/team/RoleList'
import { RoleForm } from '@/components/team/RoleForm'
import { MemberList } from '@/components/team/MemberList'
import { MemberForm } from '@/components/team/MemberForm'
import type { Role, TeamMember } from '@/types'

export function TeamView() {
  const {
    roles,
    members,
    createRole,
    updateRole,
    deleteRole,
    createMember,
    updateMember,
    deleteMember,
  } = useTeam()

  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [memberModalOpen, setMemberModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  const handleRoleSubmit = async (data: Omit<Role, 'id' | 'created_at'>) => {
    if (editingRole) {
      await updateRole(editingRole.id, data)
    } else {
      await createRole(data)
    }
  }

  const handleMemberSubmit = async (data: Omit<TeamMember, 'id' | 'created_at' | 'role'>) => {
    if (editingMember) {
      await updateMember(editingMember.id, data)
    } else {
      await createMember(data)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Team</h2>
        <p className="text-[var(--text-secondary)] mt-1">
          Gestione ruoli e membri del team
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Roles Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Ruoli
            </h3>
            <button
              onClick={() => {
                setEditingRole(null)
                setRoleModalOpen(true)
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Nuovo Ruolo
            </button>
          </div>

          <div className="card">
            <RoleList
              roles={roles}
              onEdit={(role) => {
                setEditingRole(role)
                setRoleModalOpen(true)
              }}
              onDelete={deleteRole}
            />
          </div>
        </div>

        {/* Members Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Membri ({members.length})
            </h3>
            <button
              onClick={() => {
                setEditingMember(null)
                setMemberModalOpen(true)
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Nuovo Membro
            </button>
          </div>

          <div className="card">
            <MemberList
              members={members}
              onEdit={(member) => {
                setEditingMember(member)
                setMemberModalOpen(true)
              }}
              onDelete={deleteMember}
            />
          </div>
        </div>
      </div>

      {/* Role Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false)
          setEditingRole(null)
        }}
        title={editingRole ? 'Modifica Ruolo' : 'Nuovo Ruolo'}
      >
        <RoleForm
          role={editingRole}
          onSubmit={handleRoleSubmit}
          onCancel={() => {
            setRoleModalOpen(false)
            setEditingRole(null)
          }}
        />
      </Modal>

      {/* Member Modal */}
      <Modal
        isOpen={memberModalOpen}
        onClose={() => {
          setMemberModalOpen(false)
          setEditingMember(null)
        }}
        title={editingMember ? 'Modifica Membro' : 'Nuovo Membro'}
      >
        <MemberForm
          member={editingMember}
          roles={roles}
          onSubmit={handleMemberSubmit}
          onCancel={() => {
            setMemberModalOpen(false)
            setEditingMember(null)
          }}
        />
      </Modal>
    </div>
  )
}
