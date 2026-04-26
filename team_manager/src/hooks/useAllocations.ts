import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'
import type { Allocation, TimeOff } from '@/types'

export function useAllocations() {
  const { allocations, timeOffs, setAllocations, setTimeOffs } = useAppStore()

  // Fetch allocations
  const fetchAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from('allocations')
        .select('*')
        .order('week_start')

      if (error) throw error
      setAllocations(data || [])
    } catch (error) {
      console.error('Error fetching allocations:', error)
      toast.error('Errore caricamento allocazioni')
    }
  }

  // Fetch time offs
  const fetchTimeOffs = async () => {
    try {
      const { data, error } = await supabase
        .from('time_offs')
        .select('*')
        .order('week_start')

      if (error) throw error
      setTimeOffs(data || [])
    } catch (error) {
      console.error('Error fetching time offs:', error)
      toast.error('Errore caricamento ferie')
    }
  }

  // Upsert allocation (update or create)
  const upsertAllocation = async (
    featureId: string,
    memberId: string,
    weekStart: string,
    days: number
  ) => {
    try {
      // Se days = 0, elimina il record
      if (days === 0) {
        const { error } = await supabase
          .from('allocations')
          .delete()
          .match({ feature_id: featureId, member_id: memberId, week_start: weekStart })

        if (error) throw error

        // Aggiorna store locale
        setAllocations(
          allocations.filter(
            (a) =>
              !(
                a.feature_id === featureId &&
                a.member_id === memberId &&
                a.week_start === weekStart
              )
          )
        )
      } else {
        // Upsert
        const { data, error } = await supabase
          .from('allocations')
          .upsert(
            { feature_id: featureId, member_id: memberId, week_start: weekStart, days },
            { onConflict: 'feature_id,member_id,week_start' }
          )
          .select()
          .single()

        if (error) throw error

        // Aggiorna store locale
        const index = allocations.findIndex(
          (a) =>
            a.feature_id === featureId &&
            a.member_id === memberId &&
            a.week_start === weekStart
        )

        if (index >= 0) {
          const updated = [...allocations]
          updated[index] = data
          setAllocations(updated)
        } else {
          setAllocations([...allocations, data])
        }
      }
    } catch (error) {
      console.error('Error upserting allocation:', error)
      toast.error('Errore salvataggio allocazione')
      throw error
    }
  }

  // Upsert time off
  const upsertTimeOff = async (memberId: string, weekStart: string, days: number) => {
    try {
      // Se days = 0, elimina il record
      if (days === 0) {
        const { error } = await supabase
          .from('time_offs')
          .delete()
          .match({ member_id: memberId, week_start: weekStart })

        if (error) throw error

        // Aggiorna store locale
        setTimeOffs(
          timeOffs.filter(
            (t) => !(t.member_id === memberId && t.week_start === weekStart)
          )
        )
      } else {
        // Upsert
        const { data, error } = await supabase
          .from('time_offs')
          .upsert(
            { member_id: memberId, week_start: weekStart, days },
            { onConflict: 'member_id,week_start' }
          )
          .select()
          .single()

        if (error) throw error

        // Aggiorna store locale
        const index = timeOffs.findIndex(
          (t) => t.member_id === memberId && t.week_start === weekStart
        )

        if (index >= 0) {
          const updated = [...timeOffs]
          updated[index] = data
          setTimeOffs(updated)
        } else {
          setTimeOffs([...timeOffs, data])
        }
      }
    } catch (error) {
      console.error('Error upserting time off:', error)
      toast.error('Errore salvataggio ferie')
      throw error
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchAllocations()
    fetchTimeOffs()
  }, [])

  return {
    allocations,
    timeOffs,
    upsertAllocation,
    upsertTimeOff,
    refreshAllocations: fetchAllocations,
    refreshTimeOffs: fetchTimeOffs,
  }
}
