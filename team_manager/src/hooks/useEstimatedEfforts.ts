import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { FeatureEstimatedEffort } from '@/types'

export function useEstimatedEfforts(featureId?: string) {
  const [estimatedEfforts, setEstimatedEfforts] = useState<FeatureEstimatedEffort[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch estimated efforts for a feature
  const fetchEstimatedEfforts = async (fId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('feature_estimated_efforts')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('feature_id', fId)

      if (error) throw error
      setEstimatedEfforts(data || [])
    } catch (error) {
      console.error('Error fetching estimated efforts:', error)
      toast.error('Errore caricamento effort stimati')
    } finally {
      setLoading(false)
    }
  }

  // Upsert estimated effort
  const upsertEstimatedEffort = async (
    featureId: string,
    roleId: string,
    estimatedDays: number
  ) => {
    try {
      const { error } = await supabase
        .from('feature_estimated_efforts')
        .upsert(
          {
            feature_id: featureId,
            role_id: roleId,
            estimated_days: estimatedDays,
          },
          { onConflict: 'feature_id,role_id' }
        )

      if (error) throw error

      // Refresh data
      if (featureId) {
        await fetchEstimatedEfforts(featureId)
      }
    } catch (error) {
      console.error('Error upserting estimated effort:', error)
      toast.error('Errore salvataggio effort stimato')
      throw error
    }
  }

  // Batch upsert multiple estimated efforts
  const batchUpsertEstimatedEfforts = async (
    featureId: string,
    efforts: Array<{ roleId: string; estimatedDays: number }>
  ) => {
    try {
      // Filter out zero values
      const nonZeroEfforts = efforts.filter(e => e.estimatedDays > 0)

      if (nonZeroEfforts.length === 0) {
        // Delete all if everything is zero
        const { error } = await supabase
          .from('feature_estimated_efforts')
          .delete()
          .eq('feature_id', featureId)

        if (error) throw error
        return
      }

      // Upsert non-zero values
      const { error } = await supabase
        .from('feature_estimated_efforts')
        .upsert(
          nonZeroEfforts.map(e => ({
            feature_id: featureId,
            role_id: e.roleId,
            estimated_days: e.estimatedDays,
          })),
          { onConflict: 'feature_id,role_id' }
        )

      if (error) throw error

      // Delete zero values
      const zeroRoleIds = efforts
        .filter(e => e.estimatedDays === 0)
        .map(e => e.roleId)

      if (zeroRoleIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('feature_estimated_efforts')
          .delete()
          .eq('feature_id', featureId)
          .in('role_id', zeroRoleIds)

        if (deleteError) throw deleteError
      }

      toast.success('Effort stimati salvati')
    } catch (error) {
      console.error('Error batch upserting estimated efforts:', error)
      toast.error('Errore salvataggio effort stimati')
      throw error
    }
  }

  // Initial fetch
  useEffect(() => {
    if (featureId) {
      fetchEstimatedEfforts(featureId)
    }
  }, [featureId])

  return {
    estimatedEfforts,
    loading,
    fetchEstimatedEfforts,
    upsertEstimatedEffort,
    batchUpsertEstimatedEfforts,
  }
}
