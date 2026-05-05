import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Settings } from '@/types'

const DEFAULT_SETTINGS: Omit<Settings, 'id'> = {
  nrt_color: '#9333ea',
  ktlo_color: '#3b82f6',
  timeoff_color: '#f59e0b',
  capacity_color: '#3b82f6',
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch settings (singleton)
  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (error) {
        // Se non esiste, crea settings di default
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('settings')
            .insert([DEFAULT_SETTINGS])
            .select()
            .single()

          if (insertError) throw insertError
          setSettings(newData)
        } else {
          throw error
        }
      } else {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Errore caricamento impostazioni')
      // Fallback ai default
      setSettings({ ...DEFAULT_SETTINGS, id: '' } as Settings)
    } finally {
      setIsLoading(false)
    }
  }

  // Update settings
  const updateSettings = async (updates: Partial<Omit<Settings, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!settings) return

    try {
      const { error } = await supabase
        .from('settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', settings.id)

      if (error) throw error

      await fetchSettings()
      toast.success('Impostazioni aggiornate')
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Errore aggiornamento impostazioni')
      throw error
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings: settings || DEFAULT_SETTINGS,
    isLoading,
    updateSettings,
    refreshSettings: fetchSettings,
  }
}
