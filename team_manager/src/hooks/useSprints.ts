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

  // Update sprint and all following sprints
  const updateSprintAndFollowing = async (id: string, updates: Partial<Sprint>) => {
    try {
      // Get current sprint data
      const currentSprint = sprints.find(s => s.id === id)
      if (!currentSprint) throw new Error('Sprint non trovato')

      // Update current sprint
      const { error: updateError } = await supabase
        .from('sprints')
        .update(updates)
        .eq('id', id)

      if (updateError) throw updateError

      // Get new end date (from updates or current)
      const newEndDate = updates.end_date || currentSprint.end_date

      // Find all following sprints
      const followingSprints = sprints
        .filter(s => s.start_date > currentSprint.start_date)
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

      if (followingSprints.length > 0) {
        // Calculate new dates for all following sprints
        let previousEndDate = new Date(newEndDate)

        const sprintUpdates = followingSprints.map(sprint => {
          // Calculate original duration in days
          const originalStart = new Date(sprint.start_date)
          const originalEnd = new Date(sprint.end_date)
          const durationDays = Math.round(
            (originalEnd.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24)
          )

          // New start date is day after previous sprint ends
          const newStart = new Date(previousEndDate)
          newStart.setDate(newStart.getDate() + 1)

          // New end date maintains the same duration
          const newEnd = new Date(newStart)
          newEnd.setDate(newEnd.getDate() + durationDays)

          previousEndDate = newEnd

          return {
            id: sprint.id,
            start_date: newStart.toISOString().split('T')[0],
            end_date: newEnd.toISOString().split('T')[0],
          }
        })

        // Batch update all following sprints
        for (const update of sprintUpdates) {
          const { error } = await supabase
            .from('sprints')
            .update({
              start_date: update.start_date,
              end_date: update.end_date,
            })
            .eq('id', update.id)

          if (error) throw error
        }

        toast.success(`Sprint e ${followingSprints.length} sprint successive aggiornati`)
      } else {
        toast.success('Sprint aggiornato')
      }

      await fetchSprints()
      await fetchFeatures()
    } catch (error) {
      console.error('Error updating sprint and following:', error)
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
    updateSprintAndFollowing,
    deleteSprint,
    createFeature,
    updateFeature,
    deleteFeature,
    refreshSprints: fetchSprints,
    refreshFeatures: fetchFeatures,
  }
}
