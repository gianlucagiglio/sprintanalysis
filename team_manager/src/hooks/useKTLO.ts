import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'
import type { KTLOAllocation } from '@/types'

export function useKTLO() {
  const { ktloAllocations, setKTLOAllocations } = useAppStore()

  // Fetch KTLO allocations
  const fetchKTLOAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from('ktlo_allocations')
        .select('*')
        .order('week_start')

      if (error) throw error
      setKTLOAllocations(data || [])
    } catch (error) {
      console.error('Error fetching KTLO allocations:', error)
      toast.error('Errore caricamento allocazioni KTLO')
    }
  }

  // Upsert KTLO allocation
  const upsertKTLOAllocation = async (
    memberId: string,
    weekStart: string,
    days: number
  ) => {
    try {
      // Optimistic update
      const newAllocation: KTLOAllocation = {
        id: crypto.randomUUID(),
        member_id: memberId,
        week_start: weekStart,
        days,
      }

      const prevAllocations = ktloAllocations
      const existingIndex = ktloAllocations.findIndex(
        (a) => a.member_id === memberId && a.week_start === weekStart
      )

      let updatedAllocations: KTLOAllocation[]
      if (existingIndex >= 0) {
        updatedAllocations = [...ktloAllocations]
        updatedAllocations[existingIndex] = {
          ...updatedAllocations[existingIndex],
          days,
        }
      } else {
        updatedAllocations = [...ktloAllocations, newAllocation]
      }

      setKTLOAllocations(updatedAllocations)

      // Database update - salva sempre il valore (anche 0)
      const { error } = await supabase
        .from('ktlo_allocations')
        .upsert(
          {
            member_id: memberId,
            week_start: weekStart,
            days,
          },
          { onConflict: 'member_id,week_start' }
        )

      if (error) throw error
    } catch (error) {
      console.error('Error upserting KTLO allocation:', error)
      toast.error('Errore salvataggio allocazione KTLO')
      // Rollback on error
      await fetchKTLOAllocations()
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchKTLOAllocations()
  }, [])

  return {
    ktloAllocations,
    upsertKTLOAllocation,
    refreshKTLOAllocations: fetchKTLOAllocations,
  }
}
