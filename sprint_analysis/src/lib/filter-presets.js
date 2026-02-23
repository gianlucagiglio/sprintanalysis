const STORAGE_KEY = 'sprint-analysis-filter-presets'

export function loadPresets() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function savePreset(name, filters) {
  const presets = loadPresets()
  presets.push({
    id: Date.now().toString(36),
    name,
    filters: { ...filters },
    createdAt: new Date().toISOString(),
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

export function deletePreset(id) {
  const presets = loadPresets().filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}
