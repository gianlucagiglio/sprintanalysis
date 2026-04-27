import { useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import type { Feature, FeatureMember } from '@/types'

export function useFeatures() {
  const { features, setFeatures, featureMembers, setFeatureMembers, members } = useAppStore()

  // Fetch features
  const fetchFeatures = async () => {
    const { data, error } = await supabase
      .from('features')
      .select('*, sprint:sprints(*)')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Errore nel caricamento delle feature')
      console.error(error)
      return
    }

    setFeatures(data || [])
  }

  // Fetch feature members
  const fetchFeatureMembers = async () => {
    const { data, error } = await supabase
      .from('feature_members')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      toast.error('Errore nel caricamento delle assegnazioni')
      console.error(error)
      return
    }

    setFeatureMembers(data || [])
  }

  // Create feature
  const createFeature = async (feature: Omit<Feature, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('features')
      .insert([feature])
      .select()
      .single()

    if (error) {
      toast.error('Errore nella creazione della feature')
      console.error(error)
      throw error
    }

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
      }
    }

    await fetchFeatures()
    await fetchFeatureMembers()
    toast.success('Feature creata con team assegnato')
    return data
  }

  // Update feature
  const updateFeature = async (id: string, updates: Partial<Feature>) => {
    const { error } = await supabase
      .from('features')
      .update(updates)
      .eq('id', id)

    if (error) {
      toast.error('Errore nell\'aggiornamento della feature')
      console.error(error)
      throw error
    }

    await fetchFeatures()
    toast.success('Feature aggiornata')
  }

  // Delete feature
  const deleteFeature = async (id: string) => {
    const { error } = await supabase
      .from('features')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Errore nell\'eliminazione della feature')
      console.error(error)
      throw error
    }

    await fetchFeatures()
    await fetchFeatureMembers()
    toast.success('Feature eliminata')
  }

  // Assign members to feature
  const assignMembers = async (featureId: string, memberIds: string[]) => {
    // Remove existing assignments
    const { error: deleteError } = await supabase
      .from('feature_members')
      .delete()
      .eq('feature_id', featureId)

    if (deleteError) {
      toast.error('Errore nell\'assegnazione membri')
      console.error(deleteError)
      throw deleteError
    }

    // Insert new assignments
    if (memberIds.length > 0) {
      const assignments = memberIds.map((memberId) => ({
        feature_id: featureId,
        member_id: memberId,
      }))

      const { error: insertError } = await supabase
        .from('feature_members')
        .insert(assignments)

      if (insertError) {
        toast.error('Errore nell\'assegnazione membri')
        console.error(insertError)
        throw insertError
      }
    }

    await fetchFeatureMembers()
    toast.success('Membri assegnati')
  }

  // Get members assigned to a feature
  const getFeatureMembers = (featureId: string) => {
    return featureMembers.filter((fm) => fm.feature_id === featureId)
  }

  // Load on mount
  useEffect(() => {
    fetchFeatures()
    fetchFeatureMembers()
  }, [])

  return {
    features,
    featureMembers,
    fetchFeatures,
    fetchFeatureMembers,
    createFeature,
    updateFeature,
    deleteFeature,
    assignMembers,
    getFeatureMembers,
  }
}
