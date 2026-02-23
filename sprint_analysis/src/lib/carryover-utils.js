/**
 * Detect carry-over items: items that are Active or New in their assigned sprint
 * (they should have been Closed but weren't).
 */
export function detectCarryOver(items, sprintTimeline) {
  const workItems = items.filter(i =>
    i.sprintInfo && i.type !== 'Epic' && i.type !== 'Feature'
  )

  const perSprint = sprintTimeline.map(s => {
    const sprintItems = workItems.filter(i => i.sprintInfo.sprint === s.sprint)
    const carryOver = sprintItems.filter(i => i.state !== 'Closed')
    const closed = sprintItems.filter(i => i.state === 'Closed')
    const carryOverEffort = carryOver.reduce((sum, i) => sum + (i.totalEffort || 0), 0)
    const closedEffort = closed.reduce((sum, i) => sum + (i.totalEffort || 0), 0)
    const totalEffort = carryOverEffort + closedEffort

    return {
      sprint: s.sprint,
      label: s.fullLabel,
      total: sprintItems.length,
      carryOverCount: carryOver.length,
      closedCount: closed.length,
      carryOverPercent: sprintItems.length > 0
        ? Math.round(carryOver.length / sprintItems.length * 1000) / 10
        : 0,
      carryOverEffort: Math.round(carryOverEffort * 10) / 10,
      closedEffort: Math.round(closedEffort * 10) / 10,
      totalEffort: Math.round(totalEffort * 10) / 10,
      carryOverItems: carryOver,
    }
  })

  // Repeat offenders: items that appear as carry-over in multiple sprints
  // (Active items assigned to earlier sprints that remain open)
  const itemCarryCount = new Map()
  perSprint.forEach(s => {
    s.carryOverItems.forEach(item => {
      if (!itemCarryCount.has(item.id)) {
        itemCarryCount.set(item.id, {
          id: item.id,
          title: item.title,
          type: item.type,
          state: item.state,
          effort: item.totalEffort || 0,
          sprints: [],
        })
      }
      itemCarryCount.get(item.id).sprints.push(s.label)
    })
  })

  const repeatOffenders = Array.from(itemCarryCount.values())
    .filter(i => i.sprints.length >= 1)
    .sort((a, b) => b.effort - a.effort)

  // Summary
  const totalCarryOver = perSprint.reduce((sum, s) => sum + s.carryOverCount, 0)
  const avgCarryOverPercent = perSprint.length > 0
    ? Math.round(perSprint.reduce((sum, s) => sum + s.carryOverPercent, 0) / perSprint.length * 10) / 10
    : 0
  const totalCarryOverEffort = perSprint.reduce((sum, s) => sum + s.carryOverEffort, 0)

  return {
    perSprint,
    repeatOffenders,
    summary: {
      totalCarryOver,
      avgCarryOverPercent,
      repeatOffenderCount: repeatOffenders.length,
      totalCarryOverEffort: Math.round(totalCarryOverEffort * 10) / 10,
    },
  }
}
