import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Team, TeamMember, Profile } from '@/types/database'

export type TeamWithMemberCount = Team & { member_count: number; my_role: TeamMember['role'] }

export function useTeams() {
  const user = useAuthStore((s) => s.user)
  const [teams, setTeams] = useState<TeamWithMemberCount[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTeams = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // Get teams where the user is a member
      const { data: memberships, error: mErr } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id)

      if (mErr || !memberships?.length) {
        setTeams([])
        return
      }

      const teamIds = memberships.map((m) => m.team_id)

      const { data: teamsData, error: tErr } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds)

      if (tErr || !teamsData) {
        setTeams([])
        return
      }

      // Get member counts per team
      const { data: allMembers } = await supabase
        .from('team_members')
        .select('team_id')
        .in('team_id', teamIds)

      const countMap: Record<string, number> = {}
      allMembers?.forEach((m) => {
        countMap[m.team_id] = (countMap[m.team_id] || 0) + 1
      })

      const roleMap: Record<string, TeamMember['role']> = {}
      memberships.forEach((m) => {
        roleMap[m.team_id] = m.role as TeamMember['role']
      })

      setTeams(
        teamsData.map((t) => ({
          ...t,
          member_count: countMap[t.id] || 1,
          my_role: roleMap[t.id] || 'member',
        }))
      )
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const createTeam = async (name: string): Promise<Team | null> => {
    if (!user) return null

    const { data: team, error } = await supabase
      .from('teams')
      .insert({ name, owner_id: user.id })
      .select()
      .single()

    if (error || !team) {
      console.error('createTeam error:', error)
      return null
    }

    // Add the creator as owner member
    await supabase.from('team_members').insert({
      team_id: team.id,
      user_id: user.id,
      role: 'owner',
    })

    await fetchTeams()
    return team
  }

  const joinByCode = async (code: string): Promise<{ success: boolean; teamId?: string; error?: string }> => {
    if (!user) return { success: false, error: 'Non autenticato' }

    const { data: team, error } = await supabase
      .from('teams')
      .select('id')
      .eq('invite_code', code.trim())
      .single()

    if (error || !team) {
      return { success: false, error: 'Codice invito non valido' }
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', team.id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return { success: true, teamId: team.id, error: 'Fai già parte di questo team' }
    }

    const { error: insertErr } = await supabase.from('team_members').insert({
      team_id: team.id,
      user_id: user.id,
      role: 'member',
    })

    if (insertErr) {
      return { success: false, error: insertErr.message }
    }

    await fetchTeams()
    return { success: true, teamId: team.id }
  }

  const searchUsers = async (query: string, excludeTeamId?: string): Promise<Profile[]> => {
    if (!query.trim() || query.trim().length < 2) return []

    let userIdsToExclude: string[] = []
    if (excludeTeamId) {
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', excludeTeamId)
      userIdsToExclude = members?.map((m) => m.user_id) || []
    }

    let qb = supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10)

    if (userIdsToExclude.length > 0) {
      qb = qb.not('id', 'in', `(${userIdsToExclude.join(',')})`)
    }

    const { data } = await qb
    return data || []
  }

  const addMember = async (teamId: string, userId: string): Promise<boolean> => {
    const { error } = await supabase.from('team_members').insert({
      team_id: teamId,
      user_id: userId,
      role: 'member',
    })
    if (error) {
      console.error('addMember error:', error)
      return false
    }
    return true
  }

  const removeMember = async (teamId: string, userId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)
    if (error) {
      console.error('removeMember error:', error)
      return false
    }
    return true
  }

  const deleteTeam = async (teamId: string): Promise<boolean> => {
    const { error } = await supabase.from('teams').delete().eq('id', teamId)
    if (error) {
      console.error('deleteTeam error:', error)
      return false
    }
    await fetchTeams()
    return true
  }

  return {
    teams,
    loading,
    fetchTeams,
    createTeam,
    joinByCode,
    searchUsers,
    addMember,
    removeMember,
    deleteTeam,
  }
}
