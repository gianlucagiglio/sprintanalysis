import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Changelog, ChangelogType } from '@/types'

export function useChangelog() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch changelogs (ordine decrescente per data)
  const fetchChangelogs = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('changelog')
        .select('*')
        .order('release_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      // Ordina anche lato client per semantic versioning
      const sorted = (data || []).sort((a, b) => {
        // Prima per data
        const dateCompare = new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        if (dateCompare !== 0) return dateCompare

        // Poi per versione semantica
        const [aMajor, aMinor, aPatch] = a.version.split('.').map(Number)
        const [bMajor, bMinor, bPatch] = b.version.split('.').map(Number)

        if (bMajor !== aMajor) return bMajor - aMajor
        if (bMinor !== aMinor) return bMinor - aMinor
        return bPatch - aPatch
      })

      setChangelogs(sorted)
    } catch (error) {
      console.error('Error fetching changelogs:', error)
      toast.error('Errore caricamento changelog')
    } finally {
      setIsLoading(false)
    }
  }

  // Get latest version
  const getLatestVersion = (): string => {
    if (changelogs.length === 0) return '0.0.0'
    return changelogs[0].version
  }

  // Calculate next version based on type
  const getNextVersion = (type: ChangelogType): string => {
    const latest = getLatestVersion()
    const [major, minor, patch] = latest.split('.').map(Number)

    switch (type) {
      case 'major':
        return `${major + 1}.0.0`
      case 'minor':
        return `${major}.${minor + 1}.0`
      case 'patch':
        return `${major}.${minor}.${patch + 1}`
      default:
        return latest
    }
  }

  // Create changelog entry
  const createChangelog = async (
    data: Omit<Changelog, 'id' | 'created_at' | 'version'> & { type: ChangelogType }
  ) => {
    try {
      const version = getNextVersion(data.type)

      const { error } = await supabase
        .from('changelog')
        .insert([{ ...data, version }])

      if (error) throw error

      await fetchChangelogs()
      toast.success(`Versione ${version} aggiunta al changelog`)
    } catch (error) {
      console.error('Error creating changelog:', error)
      toast.error('Errore creazione changelog')
      throw error
    }
  }

  // Update changelog entry
  const updateChangelog = async (
    id: string,
    data: Partial<Omit<Changelog, 'id' | 'created_at'>>
  ) => {
    try {
      const { error } = await supabase
        .from('changelog')
        .update(data)
        .eq('id', id)

      if (error) throw error

      await fetchChangelogs()
      toast.success('Changelog aggiornato')
    } catch (error) {
      console.error('Error updating changelog:', error)
      toast.error('Errore aggiornamento changelog')
      throw error
    }
  }

  // Delete changelog entry
  const deleteChangelog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('changelog')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchChangelogs()
      toast.success('Changelog eliminato')
    } catch (error) {
      console.error('Error deleting changelog:', error)
      toast.error('Errore eliminazione changelog')
      throw error
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchChangelogs()
  }, [])

  return {
    changelogs,
    isLoading,
    latestVersion: getLatestVersion(),
    getNextVersion,
    createChangelog,
    updateChangelog,
    deleteChangelog,
    refreshChangelogs: fetchChangelogs,
  }
}
