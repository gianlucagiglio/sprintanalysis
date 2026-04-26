import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'
import type { Role, TeamMember } from '@/types'

export function useTeam() {
  const { roles, members, setRoles, setMembers } = useAppStore()

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name')

      if (error) throw error
      setRoles(data || [])
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Errore caricamento ruoli')
    }
  }

  // Fetch members with role join
  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          role:roles(*)
        `)
        .order('name')

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Errore caricamento membri')
    }
  }

  // Create role
  const createRole = async (role: Omit<Role, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert(role)
        .select()
        .single()

      if (error) throw error
      await fetchRoles()
      toast.success('Ruolo creato')
      return data
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error('Errore creazione ruolo')
      throw error
    }
  }

  // Update role
  const updateRole = async (id: string, updates: Partial<Role>) => {
    try {
      const { error } = await supabase
        .from('roles')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchRoles()
      await fetchMembers() // Refresh members to update joined role data
      toast.success('Ruolo aggiornato')
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Errore aggiornamento ruolo')
      throw error
    }
  }

  // Delete role
  const deleteRole = async (id: string) => {
    try {
      const { error } = await supabase.from('roles').delete().eq('id', id)

      if (error) throw error
      await fetchRoles()
      toast.success('Ruolo eliminato')
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error('Errore eliminazione ruolo')
      throw error
    }
  }

  // Create member
  const createMember = async (
    member: Omit<TeamMember, 'id' | 'created_at' | 'role'>
  ) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert(member)
        .select()
        .single()

      if (error) throw error
      await fetchMembers()
      toast.success('Membro aggiunto')
      return data
    } catch (error) {
      console.error('Error creating member:', error)
      toast.error('Errore aggiunta membro')
      throw error
    }
  }

  // Update member
  const updateMember = async (id: string, updates: Partial<TeamMember>) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchMembers()
      toast.success('Membro aggiornato')
    } catch (error) {
      console.error('Error updating member:', error)
      toast.error('Errore aggiornamento membro')
      throw error
    }
  }

  // Delete member
  const deleteMember = async (id: string) => {
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id)

      if (error) throw error
      await fetchMembers()
      toast.success('Membro eliminato')
    } catch (error) {
      console.error('Error deleting member:', error)
      toast.error('Errore eliminazione membro')
      throw error
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchRoles()
    fetchMembers()
  }, [])

  return {
    roles,
    members,
    createRole,
    updateRole,
    deleteRole,
    createMember,
    updateMember,
    deleteMember,
    refreshRoles: fetchRoles,
    refreshMembers: fetchMembers,
  }
}
