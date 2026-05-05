import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'
import type { NRTAllocation } from '@/types'

export function useNRT() {
  const { nrtAllocations, setNRTAllocations } = useAppStore()

  // Fetch NRT allocations
  const fetchNRTAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from('nrt_allocations')
        .select('*')
        .order('week_start')

      if (error) throw error
      setNRTAllocations(data || [])
    } catch (error) {
      console.error('Error fetching NRT allocations:', error)
      toast.error('Errore caricamento allocazioni NRT')
    }
  }

  // Upsert NRT allocation
  const upsertNRTAllocation = async (
    memberId: string,
    weekStart: string,
    days: number
  ) => {
    try {
      // Optimistic update
      const newAllocation: NRTAllocation = {
        id: crypto.randomUUID(),
        member_id: memberId,
        week_start: weekStart,
        days,
      }

      const prevAllocations = nrtAllocations
      const existingIndex = nrtAllocations.findIndex(
        (a) => a.member_id === memberId && a.week_start === weekStart
      )

      let updatedAllocations: NRTAllocation[]
      if (existingIndex >= 0) {
        updatedAllocations = [...nrtAllocations]
        if (days === 0) {
          updatedAllocations.splice(existingIndex, 1)
        } else {
          updatedAllocations[existingIndex] = {
            ...updatedAllocations[existingIndex],
            days,
          }
        }
      } else if (days > 0) {
        updatedAllocations = [...nrtAllocations, newAllocation]
      } else {
        return
      }

      setNRTAllocations(updatedAllocations)

      // Database update
      if (days === 0) {
        const { error } = await supabase
          .from('nrt_allocations')
          .delete()
          .eq('member_id', memberId)
          .eq('week_start', weekStart)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('nrt_allocations')
          .upsert(
            {
              member_id: memberId,
              week_start: weekStart,
              days,
            },
            { onConflict: 'member_id,week_start' }
          )

        if (error) throw error
      }
    } catch (error) {
      console.error('Error upserting NRT allocation:', error)
      toast.error('Errore salvataggio allocazione NRT')
      // Rollback on error
      await fetchNRTAllocations()
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchNRTAllocations()
  }, [])

  return {
    nrtAllocations,
    upsertNRTAllocation,
    refreshNRTAllocations: fetchNRTAllocations,
  }
}
