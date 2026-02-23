import { sprintDateRange, toISO } from './date-utils'

// Seeded pseudo-random for deterministic sample data
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Sample data mimicking the Sprint analysis.xlsx structure
function makeItems() {
  const rng = mulberry32(42)
  const items = []
  let childId = 3000

  const epics = [
    { id: 1000, title: 'Payment Gateway Integration', valueArea: 'Payments' },
    { id: 1001, title: 'Cloud Migration Phase 2', valueArea: 'Infrastructure' },
    { id: 1002, title: 'POS System Modernization', valueArea: 'F&B POS' },
    { id: 1003, title: 'Mobile App Redesign', valueArea: 'Mobile' },
    { id: 1004, title: 'Security Compliance 2025', valueArea: 'Security' },
    { id: 1005, title: 'Reporting & Analytics Platform', valueArea: 'Analytics' },
    { id: 1006, title: 'API Gateway & Developer Portal', valueArea: 'Platform' },
    { id: 1007, title: 'Customer Loyalty Engine', valueArea: 'CRM' },
    { id: 1008, title: 'Infrastructure Monitoring', valueArea: 'Infrastructure' },
    { id: 1009, title: 'Accessibility & Localization', valueArea: 'UX' },
  ]

  epics.forEach(e => {
    items.push({
      id: e.id, type: 'Epic', title: e.title, state: 'Active',
      effort: 0, iterationPath: 'Main', parent: null, businessValue: 0,
      valueArea: e.valueArea, tags: null, startDate: null, finishDate: null,
      effortAnalysis: 0, effortAutomation: 0, effortBE: 0, effortDesign: 0,
      effortFE: 0, effortQA: 0, effortNative: 0, effortPlatformEng: 0,
    })
  })

  const features = [
    // Epic 1000 - Payment Gateway
    { id: 2000, parent: 1000, title: 'Stripe Integration', tags: 'strategic; Backend; Payments' },
    { id: 2001, parent: 1000, title: 'PayPal Checkout Flow', tags: 'strategic; Frontend' },
    { id: 2002, parent: 1000, title: 'Payment Reconciliation', tags: 'ktlo; Backend' },
    // Epic 1001 - Cloud Migration
    { id: 2003, parent: 1001, title: 'Database Migration to Aurora', tags: 'strategic; Cloud; Backend' },
    { id: 2004, parent: 1001, title: 'Legacy API Deprecation', tags: 'ktlo; Backend' },
    { id: 2005, parent: 1001, title: 'Container Orchestration Setup', tags: 'strategic; Platform' },
    // Epic 1002 - POS
    { id: 2006, parent: 1002, title: 'POS Receipt Printer Driver', tags: 'Small Change; Hardware' },
    { id: 2007, parent: 1002, title: 'POS Table Management UI', tags: 'strategic; Frontend; UX' },
    { id: 2008, parent: 1002, title: 'POS Offline Mode', tags: null },
    // Epic 1003 - Mobile
    { id: 2009, parent: 1003, title: 'Mobile Push Notifications', tags: 'Small Change; Mobile' },
    { id: 2010, parent: 1003, title: 'Mobile Biometric Auth', tags: 'strategic; Security; Native' },
    { id: 2011, parent: 1003, title: 'Mobile Order History', tags: null },
    // Epic 1004 - Security
    { id: 2012, parent: 1004, title: 'GDPR Data Retention Policy', tags: 'ktlo; Compliance' },
    { id: 2013, parent: 1004, title: 'Vulnerability Scanning Pipeline', tags: 'ktlo; DevOps' },
    { id: 2014, parent: 1004, title: 'SSO Integration', tags: 'strategic; Backend; Security' },
    // Epic 1005 - Reporting
    { id: 2015, parent: 1005, title: 'Dashboard Builder', tags: 'strategic; Frontend; Analytics' },
    { id: 2016, parent: 1005, title: 'Scheduled Report Export', tags: null },
    { id: 2017, parent: 1005, title: 'Data Warehouse ETL', tags: 'strategic; Backend; Data' },
    // Epic 1006 - API
    { id: 2018, parent: 1006, title: 'Rate Limiting & Throttling', tags: 'ktlo; Backend' },
    { id: 2019, parent: 1006, title: 'API Documentation Portal', tags: 'Small Change; Frontend' },
    { id: 2020, parent: 1006, title: 'Webhook Management', tags: null },
    // Epic 1007 - Loyalty
    { id: 2021, parent: 1007, title: 'Points Calculation Engine', tags: 'strategic; Backend' },
    { id: 2022, parent: 1007, title: 'Loyalty Tier System', tags: null },
    { id: 2023, parent: 1007, title: 'Referral Program', tags: 'Small Change; Marketing' },
    // Epic 1008 - Monitoring
    { id: 2024, parent: 1008, title: 'Alert Rule Engine', tags: 'ktlo; Platform' },
    { id: 2025, parent: 1008, title: 'Log Aggregation Pipeline', tags: null },
    { id: 2026, parent: 1008, title: 'Uptime Dashboard', tags: null },
    // Epic 1009 - A11y
    { id: 2027, parent: 1009, title: 'WCAG 2.1 AA Compliance', tags: 'ktlo; Frontend; A11y' },
    { id: 2028, parent: 1009, title: 'Multi-language Support', tags: null },
    { id: 2029, parent: 1009, title: 'RTL Layout Support', tags: 'Small Change; Frontend' },
  ]

  features.forEach(f => {
    items.push({
      id: f.id, type: 'Feature', title: f.title, state: 'Active',
      effort: 0, iterationPath: 'Main', parent: f.parent, businessValue: 0,
      valueArea: '', tags: f.tags, startDate: null, finishDate: null,
      effortAnalysis: 0, effortAutomation: 0, effortBE: 0, effortDesign: 0,
      effortFE: 0, effortQA: 0, effortNative: 0, effortPlatformEng: 0,
    })
  })

  // Child work items - generate ~4 per feature spread across sprints
  const types = ['User Story', 'Bug', 'Task', 'Tech Story']
  const states = ['Closed', 'Closed', 'Closed', 'Active', 'New']
  const sprints = []
  for (let q = 1; q <= 3; q++) {
    const base = q === 1 ? 133 : q === 2 ? 140 : 150
    for (let s = 0; s < 10; s++) {
      sprints.push({ quarter: `Q${q}`, num: base + s })
    }
  }

  const childTitles = [
    'Implement API endpoint', 'Add unit tests', 'Create UI component', 'Fix validation bug',
    'Update database schema', 'Add error handling', 'Write documentation', 'Performance optimization',
    'Add logging', 'Code review fixes', 'Integration test', 'Refactor service layer',
    'Update configuration', 'Add monitoring', 'Fix edge case', 'UI polish',
  ]

  let sprintIdx = 0
  features.forEach(f => {
    const numChildren = 3 + Math.floor(rng() * 4) // 3-6 children
    for (let i = 0; i < numChildren; i++) {
      const sprint = sprints[sprintIdx % sprints.length]
      sprintIdx++
      const titleBase = childTitles[(childId + i) % childTitles.length]

      // Distribute effort across families with BE being dominant
      const beFactor = 0.3 + rng() * 0.4
      const totalEff = 5 + Math.floor(rng() * 25)
      const effortBE = Math.round(totalEff * beFactor * 10) / 10
      const effortFE = Math.round(totalEff * (0.1 + rng() * 0.2) * 10) / 10
      const effortDesign = Math.round(totalEff * rng() * 0.12 * 10) / 10
      const effortAnalysis = Math.round(totalEff * rng() * 0.1 * 10) / 10
      const effortQA = Math.round(totalEff * (0.05 + rng() * 0.15) * 10) / 10
      const effortAutomation = Math.round(totalEff * rng() * 0.08 * 10) / 10
      const effortNative = f.parent === 1003 ? Math.round(totalEff * rng() * 0.15 * 10) / 10 : 0
      const effortPlatformEng = [1001, 1008].includes(f.parent) ? Math.round(totalEff * rng() * 0.15 * 10) / 10 : 0

      const itemState = states[Math.floor(rng() * states.length)]

      // Generate realistic dates based on sprint and state
      const { start: spStart } = sprintDateRange(sprint.num)
      let startDate = null
      let finishDate = null

      if (itemState === 'Closed') {
        // Started within the first 5 days of the sprint
        const startOffset = Math.floor(rng() * 5)
        const sd = new Date(spStart.getTime() + startOffset * 86400000)
        startDate = toISO(sd)
        // Finished 2-12 days after start
        const duration = 2 + Math.floor(rng() * 11)
        const fd = new Date(sd.getTime() + duration * 86400000)
        finishDate = toISO(fd)
      } else if (itemState === 'Active') {
        // Started but not finished
        const startOffset = Math.floor(rng() * 5)
        const sd = new Date(spStart.getTime() + startOffset * 86400000)
        startDate = toISO(sd)
        finishDate = null
      } else {
        // New: no dates
        startDate = null
        finishDate = null
      }

      const itemType = types[i % types.length]

      // Add severity tag for Bug items with realistic distribution
      let itemTags = f.tags
      if (itemType === 'Bug') {
        const sev = rng()
        const severity = sev < 0.10 ? 'P1' : sev < 0.35 ? 'P2' : sev < 0.75 ? 'P3' : 'P4'
        itemTags = itemTags ? `${itemTags}; ${severity}` : severity
      }

      items.push({
        id: childId,
        type: itemType,
        title: `${titleBase} for ${f.title}`,
        state: itemState,
        effort: totalEff,
        iterationPath: `Main\\2025-${sprint.quarter}\\${sprint.num}`,
        parent: f.id,
        businessValue: 0,
        valueArea: '',
        tags: itemTags,
        startDate,
        finishDate,
        effortAnalysis,
        effortAutomation,
        effortBE,
        effortDesign,
        effortFE,
        effortQA,
        effortNative,
        effortPlatformEng,
      })
      childId++
    }
  })

  return items
}

export const sampleData = makeItems()
