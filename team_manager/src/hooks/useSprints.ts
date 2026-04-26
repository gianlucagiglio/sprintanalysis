import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'
import type { Sprint, Feature } from '@/types'

export function useSprints() {
  const { sprints, features, setSprints, setFeatures } = useAppStore()

  // Fetch sprints
  const fetchSprints = async () => {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .order('start_date')

      if (error) throw error
      setSprints(data || [])
    } catch (error) {
      console.error('Error fetching sprints:', error)
      toast.error('Errore caricamento sprint')
    }
  }

  // Fetch features with sprint join
  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('features')
        .select(`
          *,
          sprint:sprints(*)
        `)
        .order('name')

      if (error) throw error
      setFeatures(data || [])
    } catch (error) {
      console.error('Error fetching features:', error)
      toast.error('Errore caricamento feature')
    }
  }

  // Create sprint
  const createSprint = async (sprint: Omit<Sprint, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .insert(sprint)
        .select()
        .single()

      if (error) throw error
      await fetchSprints()
      toast.success('Sprint creato')
      return data
    } catch (error) {
      console.error('Error creating sprint:', error)
      toast.error('Errore creazione sprint')
      throw error
    }
  }

  // Create multiple sprints
  const createMultipleSprints = async (sprints: Omit<Sprint, 'id' | 'created_at'>[]) => {
    try {
      const { error } = await supabase
        .from('sprints')
        .insert(sprints)
        .select()

      if (error) throw error
      await fetchSprints()
      toast.success(`${sprints.length} sprint creati con successo`)
    } catch (error) {
      console.error('Error creating multiple sprints:', error)
      toast.error('Errore creazione sprint multipli')
      throw error
    }
  }

  // Update sprint
  const updateSprint = async (id: string, updates: Partial<Sprint>) => {
    try {
      const { error } = await supabase
        .from('sprints')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchSprints()
      await fetchFeatures() // Refresh features to update joined sprint data
      toast.success('Sprint aggiornato')
    } catch (error) {
      console.error('Error updating sprint:', error)
      toast.error('Errore aggiornamento sprint')
      throw error
    }
  }

  // Delete sprint
  const deleteSprint = async (id: string) => {
    try {
      const { error } = await supabase.from('sprints').delete().eq('id', id)

      if (error) throw error
      await fetchSprints()
      toast.success('Sprint eliminato')
    } catch (error) {
      console.error('Error deleting sprint:', error)
      toast.error('Errore eliminazione sprint')
      throw error
    }
  }

  // Create feature
  const createFeature = async (feature: Omit<Feature, 'id' | 'created_at' | 'sprint'>) => {
    try {
      const { data, error } = await supabase
        .from('features')
        .insert(feature)
        .select()
        .single()

      if (error) throw error
      await fetchFeatures()
      toast.success('Feature creata')
      return data
    } catch (error) {
      console.error('Error creating feature:', error)
      toast.error('Errore creazione feature')
      throw error
    }
  }

  // Update feature
  const updateFeature = async (id: string, updates: Partial<Feature>) => {
    try {
      const { error } = await supabase
        .from('features')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchFeatures()
      toast.success('Feature aggiornata')
    } catch (error) {
      console.error('Error updating feature:', error)
      toast.error('Errore aggiornamento feature')
      throw error
    }
  }

  // Delete feature
  const deleteFeature = async (id: string) => {
    try {
      const { error } = await supabase.from('features').delete().eq('id', id)

      if (error) throw error
      await fetchFeatures()
      toast.success('Feature eliminata')
    } catch (error) {
      console.error('Error deleting feature:', error)
      toast.error('Errore eliminazione feature')
      throw error
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchSprints()
    fetchFeatures()
  }, [])

  return {
    sprints,
    features,
    createSprint,
    createMultipleSprints,
    updateSprint,
    deleteSprint,
    createFeature,
    updateFeature,
    deleteFeature,
    refreshSprints: fetchSprints,
    refreshFeatures: fetchFeatures,
  }
}
