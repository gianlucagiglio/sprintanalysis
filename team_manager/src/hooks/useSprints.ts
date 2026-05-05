import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'
import type { Sprint, Feature } from '@/types'

export function useSprints() {
  const { sprints, features, members, featureMembers, setSprints, setFeatures, setFeatureMembers } = useAppStore()

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
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setFeatures(data || [])
    } catch (error) {
      console.error('Error fetching features:', error)
      toast.error('Errore caricamento feature')
    }
  }

  // Helper: Sposta in avanti le feature con display_order >= al valore target
  const shiftDisplayOrders = async (targetOrder: number, excludeId?: string) => {
    try {
      // Trova tutte le feature con display_order >= targetOrder (esclusa quella corrente)
      let query = supabase
        .from('features')
        .select('id, display_order')
        .gte('display_order', targetOrder)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data: affectedFeatures, error: fetchError } = await query

      if (fetchError) throw fetchError

      if (affectedFeatures && affectedFeatures.length > 0) {
        // IMPORTANTE: Ordina in ordine DECRESCENTE per evitare conflitti temporanei
        // Se ho A=2, B=3, C=4 e inserisco D=2, devo aggiornare C→B→A (dal più alto al più basso)
        // Altrimenti se aggiorno A→B→C, quando A diventa 3 crea conflitto con B che è già 3
        const sortedFeatures = affectedFeatures.sort((a, b) => b.display_order - a.display_order)

        // Incrementa di 1 tutte le feature trovate (dall'alto verso il basso)
        for (const feature of sortedFeatures) {
          const { error: updateError } = await supabase
            .from('features')
            .update({ display_order: feature.display_order + 1 })
            .eq('id', feature.id)

          if (updateError) throw updateError
        }
      }
    } catch (error) {
      console.error('Error shifting display orders:', error)
      throw error
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

  // Delete multiple sprints (bulk)
  const deleteSprints = async (ids: string[]) => {
    try {
      const { error } = await supabase.from('sprints').delete().in('id', ids)

      if (error) throw error
      await fetchSprints()
      toast.success(`${ids.length} sprint eliminati`)
    } catch (error) {
      console.error('Error deleting sprints:', error)
      toast.error('Errore eliminazione sprint')
      throw error
    }
  }

  // Create feature
  const createFeature = async (feature: Omit<Feature, 'id' | 'created_at' | 'sprint'>) => {
    try {
      // Prima di inserire, sposta le feature esistenti se necessario
      if (feature.display_order !== undefined && feature.display_order >= 0) {
        await shiftDisplayOrders(feature.display_order)
      }

      const { data, error } = await supabase
        .from('features')
        .insert(feature)
        .select()
        .single()

      if (error) throw error

      // Assegna automaticamente tutti i membri del team alla nuova feature
      if (data && members.length > 0) {
        const assignments = members.map((member) => ({
          feature_id: data.id,
          member_id: member.id,
        }))

        const { error: assignError } = await supabase
          .from('feature_members')
          .insert(assignments)

        if (assignError) {
          console.error('Errore nell\'assegnazione automatica membri:', assignError)
          // Non blocchiamo la creazione della feature per questo errore
        } else {
          // Aggiorna lo store con le nuove assegnazioni
          const newAssignments = assignments.map((a) => ({
            id: crypto.randomUUID(), // Temporaneo, verrà sovrascritto dal refresh
            ...a,
            created_at: new Date().toISOString(),
          }))
          setFeatureMembers([...featureMembers, ...newAssignments])
        }
      }

      await fetchFeatures()
      toast.success('Feature creata con team assegnato')
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
      // Se stiamo cambiando display_order, sposta le altre feature
      if (updates.display_order !== undefined && updates.display_order >= 0) {
        await shiftDisplayOrders(updates.display_order, id)
      }

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
    deleteSprints,
    createFeature,
    updateFeature,
    deleteFeature,
    refreshSprints: fetchSprints,
    refreshFeatures: fetchFeatures,
  }
}
