import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { PROFESSIONAL_FAMILIES } from '@/lib/utils'

const TeamContext = createContext(null)
const STORAGE_KEY = 'sprint-analysis-team'

function createDefaultPeriod(id) {
  const members = {}
  PROFESSIONAL_FAMILIES.forEach(f => { members[f] = 0 })
  return {
    id,
    label: `Period ${id}`,
    fromSprint: null,
    toSprint: null,
    members,
  }
}

export function TeamProvider({ children }) {
  const [periods, setPeriods] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Migration: handle old format without costConfig
        if (Array.isArray(parsed)) return parsed
        return parsed.periods || [createDefaultPeriod(1)]
      }
    } catch (e) { /* ignore */ }
    return [createDefaultPeriod(1)]
  })

  const [costConfig, setCostConfig] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.costConfig) return parsed.costConfig
      }
    } catch (e) { /* ignore */ }
    return {
      costPerDay: 350,
      sprintDays: 10,
    }
  })

  // Persist everything together
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ periods, costConfig }))
    } catch (e) { /* ignore */ }
  }, [periods, costConfig])

  const addPeriod = useCallback(() => {
    setPeriods(prev => [...prev, createDefaultPeriod(Date.now())])
  }, [])

  const removePeriod = useCallback((id) => {
    setPeriods(prev => prev.filter(p => p.id !== id))
  }, [])

  const updatePeriod = useCallback((id, updates) => {
    setPeriods(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates } : p
    ))
  }, [])

  const updateMember = useCallback((periodId, family, count) => {
    setPeriods(prev => prev.map(p =>
      p.id === periodId
        ? { ...p, members: { ...p.members, [family]: Math.max(0, parseInt(count) || 0) } }
        : p
    ))
  }, [])

  const updateCostConfig = useCallback((updates) => {
    setCostConfig(prev => ({ ...prev, ...updates }))
  }, [])

  const getTeamForSprint = useCallback((sprintNum) => {
    if (!periods.length) return null
    for (const p of periods) {
      const from = p.fromSprint ?? -Infinity
      const to = p.toSprint ?? Infinity
      if (sprintNum >= from && sprintNum <= to) return p
    }
    return periods[0]
  }, [periods])

  const getTotalTeamSize = useCallback((period) => {
    if (!period?.members) return 0
    return Object.values(period.members).reduce((s, v) => s + v, 0)
  }, [])

  /**
   * Cost for one sprint given a team period.
   * cost = teamSize × sprintDays × costPerDay
   */
  const getSprintCost = useCallback((period) => {
    const teamSize = getTotalTeamSize(period)
    return teamSize * costConfig.sprintDays * costConfig.costPerDay
  }, [getTotalTeamSize, costConfig])

  return (
    <TeamContext.Provider value={{
      periods,
      addPeriod,
      removePeriod,
      updatePeriod,
      updateMember,
      getTeamForSprint,
      getTotalTeamSize,
      costConfig,
      updateCostConfig,
      getSprintCost,
    }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error('useTeam must be used within TeamProvider')
  return ctx
}
