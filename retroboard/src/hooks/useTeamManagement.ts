import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Team } from '@/types/database'

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user_name: string
  user_email: string
}

export interface TeamWithMembers extends Team {
  members: TeamMember[]
}

export function useTeamManagement() {
  const [teams, setTeams] = useState<TeamWithMembers[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTeams = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('name')

      if (teamsError) throw teamsError

      // Fetch all team members with user info
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select(`
          id,
          team_id,
          user_id,
          role,
          joined_at,
          profiles!inner(name, email)
        `)
        .order('role', { ascending: true })

      if (membersError) throw membersError

      // Group members by team
      const teamsWithMembers: TeamWithMembers[] = (teamsData || []).map((team) => {
        const teamMembers = (membersData || [])
          .filter((m: any) => m.team_id === team.id)
          .map((m: any) => ({
            id: m.id,
            team_id: m.team_id,
            user_id: m.user_id,
            role: m.role,
            joined_at: m.joined_at,
            user_name: m.profiles.name,
            user_email: m.profiles.email,
          }))

        return {
          ...team,
          members: teamMembers,
        }
      })

      setTeams(teamsWithMembers)
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const updateMemberRole = async (
    memberId: string,
    newRole: 'owner' | 'admin' | 'member'
  ) => {
    const { error } = await supabase
      .from('team_members')
      .update({ role: newRole })
      .eq('id', memberId)

    if (error) throw error

    await fetchTeams()
  }

  const removeMember = async (memberId: string) => {
    // Check if member exists BEFORE delete
    const { data: beforeCheck } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .single()

    const { data, error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .select()

    if (error) {
      throw new Error(`Impossibile rimuovere il membro: ${error.message}`)
    }

    // Check if member still exists AFTER delete
    const { data: afterCheck } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .single()

    await fetchTeams()
  }

  return {
    teams,
    loading,
    updateMemberRole,
    removeMember,
    refetch: fetchTeams,
  }
}
