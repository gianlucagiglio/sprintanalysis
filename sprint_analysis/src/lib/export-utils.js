export function exportToCSV(data, filename) {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h]
        if (val == null) return ''
        const str = String(val)
        // Escape quotes and wrap in quotes if contains comma/quote/newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }).join(',')
    ),
  ]

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportSprintData(sprintTimeline, filename = 'sprint-effort.csv') {
  exportToCSV(sprintTimeline.map(s => ({
    Sprint: s.sprint,
    Quarter: s.quarter,
    Year: s.year,
    Strategic: s.Strategic.toFixed(1),
    KTLO: s.KTLO.toFixed(1),
    'Small Change': s['Small Change'].toFixed(1),
    Other: s.Other.toFixed(1),
    Unclassified: s.Unclassified.toFixed(1),
    Total: s.total.toFixed(1),
  })), filename)
}

export function exportUnclassifiedFeatures(features, filename = 'unclassified-features.csv') {
  exportToCSV(features.map(f => ({
    ID: f.id,
    Title: f.title,
    Epic: f.epicTitle,
    'Child Count': f.childCount,
    'Total SP': f.childEffort.toFixed(1),
    Tags: f.tags || '',
  })), filename)
}
