import * as XLSX from 'xlsx'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DEMO 4-SPRINT — Dataset di validazione deterministico
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 33 items: 4 Epics, 7 Features, 17 User Stories, 4 Bug, 1 Task
 * 4 sprints: S140–S143 (Q2 2025)
 * 3 incidents (tag "incident"/"emergency")
 * 1 anomalia classificazione (Epic 1003 → Strategic ereditato, Feature 2006 → KTLO)
 *
 * Vedi: tests/expected-outcomes-demo-4sprint.md per tutti i valori attesi.
 *
 * GERARCHIA:
 *   1000 Payments Redesign        → Strategic (tag)
 *     ├─ 2000 Payment Gateway     → Strategic (Epic wins)
 *     └─ 2001 Checkout Flow       → Strategic (Epic wins)
 *   1001 Infrastructure Upgrade   → KTLO (tag)
 *     ├─ 2002 DB Migration        → KTLO (Epic wins)
 *     └─ 2003 Monitoring Setup    → KTLO (Epic wins)
 *   1002 Mobile Improvements      → Small Change (tag)
 *     └─ 2004 Push Notifications  → Small Change (Epic wins)
 *   1003 Analytics Platform       → Strategic (ereditato da Feature 2005)
 *     ├─ 2005 Dashboard MVP       → Strategic (tag proprio, Epic era Unclassified)
 *     └─ 2006 Report Export       → KTLO (tag proprio) ← ANOMALIA
 *
 * SPRINT:
 *   S140: 5 items, 34 SP, 1 carry-over
 *   S141: 5 items, 32 SP, 1 carry-over, 1 incident
 *   S142: 6 items, 33 SP, 2 carry-over, 1 incident (P1)
 *   S143: 6 items, 27 SP, 0 carry-over, 1 incident
 */

const COLUMNS = [
  'ID', 'Work Item Type', 'Title', 'Iteration Path', 'Tags',
  'Created Date', 'Changed Date', 'Closed Date', 'Start Date', 'Finish Date',
  'Parent', 'State', 'Value Area', 'Area Path', 'Priority', 'Severity',
  'Effort', 'Effort Analysis', 'Effort Automation', 'Effort BE', 'Effort Design',
  'Effort FE', 'Effort Native', 'Effort Platform Eng', 'Effort QA',
]

const ROWS = [
  // ═══ EPICS ═══
  { 'ID': 1000, 'Work Item Type': 'Epic', 'Title': 'Payments Redesign', 'Iteration Path': 'Main', 'Tags': 'strategic', 'Created Date': '2025-03-01', 'Changed Date': '2025-04-15', 'State': 'Active', 'Value Area': 'Payments', 'Area Path': 'Main\\Teams\\Backend', 'Priority': 1 },
  { 'ID': 1001, 'Work Item Type': 'Epic', 'Title': 'Infrastructure Upgrade', 'Iteration Path': 'Main', 'Tags': 'ktlo', 'Created Date': '2025-03-01', 'Changed Date': '2025-04-15', 'State': 'Active', 'Value Area': 'Infrastructure', 'Area Path': 'Main\\Teams\\Platform', 'Priority': 2 },
  { 'ID': 1002, 'Work Item Type': 'Epic', 'Title': 'Mobile Improvements', 'Iteration Path': 'Main', 'Tags': 'small_change', 'Created Date': '2025-03-15', 'Changed Date': '2025-04-15', 'State': 'Active', 'Value Area': 'Mobile', 'Area Path': 'Main\\Teams\\Mobile', 'Priority': 3 },
  { 'ID': 1003, 'Work Item Type': 'Epic', 'Title': 'Analytics Platform', 'Iteration Path': 'Main', 'Created Date': '2025-03-20', 'Changed Date': '2025-04-29', 'State': 'Active', 'Value Area': 'Analytics', 'Area Path': 'Main\\Teams\\Data', 'Priority': 2 },

  // ═══ FEATURES ═══
  { 'ID': 2000, 'Work Item Type': 'Feature', 'Title': 'Payment Gateway', 'Iteration Path': 'Main', 'Parent': 1000, 'Tags': 'strategic', 'Created Date': '2025-03-05', 'Changed Date': '2025-04-15', 'State': 'Active', 'Value Area': 'Same as parent' },
  { 'ID': 2001, 'Work Item Type': 'Feature', 'Title': 'Checkout Flow', 'Iteration Path': 'Main', 'Parent': 1000, 'Tags': 'strategic', 'Created Date': '2025-03-05', 'Changed Date': '2025-04-29', 'State': 'Active', 'Value Area': 'Same as parent' },
  { 'ID': 2002, 'Work Item Type': 'Feature', 'Title': 'DB Migration', 'Iteration Path': 'Main', 'Parent': 1001, 'Tags': 'ktlo', 'Created Date': '2025-03-05', 'Changed Date': '2025-04-15', 'State': 'Active', 'Value Area': 'Same as parent' },
  { 'ID': 2003, 'Work Item Type': 'Feature', 'Title': 'Monitoring Setup', 'Iteration Path': 'Main', 'Parent': 1001, 'Tags': 'ktlo', 'Created Date': '2025-03-10', 'Changed Date': '2025-05-01', 'State': 'Active', 'Value Area': 'Same as parent' },
  { 'ID': 2004, 'Work Item Type': 'Feature', 'Title': 'Push Notifications', 'Iteration Path': 'Main', 'Parent': 1002, 'Tags': 'small_change', 'Created Date': '2025-03-15', 'Changed Date': '2025-04-17', 'State': 'Active', 'Value Area': 'Same as parent' },
  { 'ID': 2005, 'Work Item Type': 'Feature', 'Title': 'Dashboard MVP', 'Iteration Path': 'Main', 'Parent': 1003, 'Tags': 'strategic', 'Created Date': '2025-03-20', 'Changed Date': '2025-04-29', 'State': 'Active', 'Value Area': 'Same as parent', 'Effort': 1 },
  { 'ID': 2006, 'Work Item Type': 'Feature', 'Title': 'Report Export', 'Iteration Path': 'Main', 'Parent': 1003, 'Tags': 'ktlo', 'Created Date': '2025-03-20', 'Changed Date': '2025-05-14', 'State': 'Active', 'Value Area': 'Same as parent' },

  // ═══ S140 — 5 items, 34 SP ═══
  { 'ID': 3000, 'Work Item Type': 'User Story', 'Title': 'Stripe API Integration', 'Iteration Path': 'Main\\2025-Q2\\140', 'Parent': 2000, 'State': 'Closed', 'Start Date': '2025-04-15', 'Finish Date': '2025-04-22', 'Created Date': '2025-04-14', 'Closed Date': '2025-04-22', 'Effort BE': 5, 'Effort FE': 3, 'Effort QA': 2 },
  { 'ID': 3001, 'Work Item Type': 'User Story', 'Title': 'Payment Validation', 'Iteration Path': 'Main\\2025-Q2\\140', 'Parent': 2000, 'State': 'Closed', 'Start Date': '2025-04-16', 'Finish Date': '2025-04-24', 'Created Date': '2025-04-15', 'Closed Date': '2025-04-24', 'Effort BE': 3, 'Effort FE': 2, 'Effort QA': 1 },
  { 'ID': 3002, 'Work Item Type': 'User Story', 'Title': 'Schema Migration v1', 'Iteration Path': 'Main\\2025-Q2\\140', 'Parent': 2002, 'State': 'Closed', 'Start Date': '2025-04-15', 'Finish Date': '2025-04-20', 'Created Date': '2025-04-14', 'Closed Date': '2025-04-20', 'Effort BE': 5, 'Effort QA': 2 },
  { 'ID': 3003, 'Work Item Type': 'Bug', 'Title': 'iOS Crash on Launch', 'Iteration Path': 'Main\\2025-Q2\\140', 'Parent': 2004, 'State': 'Closed', 'Start Date': '2025-04-17', 'Finish Date': '2025-04-19', 'Created Date': '2025-04-17', 'Closed Date': '2025-04-19', 'Effort Native': 3, 'Effort QA': 1 },
  { 'ID': 3004, 'Work Item Type': 'User Story', 'Title': 'Cart Summary Page', 'Iteration Path': 'Main\\2025-Q2\\140', 'Parent': 2001, 'State': 'Active', 'Start Date': '2025-04-16', 'Created Date': '2025-04-15', 'Effort FE': 4, 'Effort Design': 2, 'Effort QA': 1 },

  // ═══ S141 — 5 items, 32 SP, 1 incident ═══
  { 'ID': 3005, 'Work Item Type': 'User Story', 'Title': 'Checkout Animations', 'Iteration Path': 'Main\\2025-Q2\\141', 'Parent': 2001, 'State': 'Closed', 'Start Date': '2025-04-29', 'Finish Date': '2025-05-06', 'Created Date': '2025-04-28', 'Closed Date': '2025-05-06', 'Effort FE': 5, 'Effort Design': 3, 'Effort QA': 1 },
  { 'ID': 3006, 'Work Item Type': 'User Story', 'Title': 'Data Validation Scripts', 'Iteration Path': 'Main\\2025-Q2\\141', 'Parent': 2002, 'State': 'Closed', 'Start Date': '2025-04-29', 'Finish Date': '2025-05-08', 'Created Date': '2025-04-28', 'Closed Date': '2025-05-08', 'Effort BE': 3, 'Effort QA': 2 },
  { 'ID': 3007, 'Work Item Type': 'Bug', 'Title': 'Migration Timeout', 'Iteration Path': 'Main\\2025-Q2\\141', 'Parent': 2002, 'Tags': 'incident', 'State': 'Closed', 'Severity': '2 \u2013 High', 'Start Date': '2025-04-30', 'Finish Date': '2025-05-03', 'Created Date': '2025-04-30', 'Closed Date': '2025-05-03', 'Effort BE': 4, 'Effort QA': 1 },
  { 'ID': 3008, 'Work Item Type': 'User Story', 'Title': 'Chart Components', 'Iteration Path': 'Main\\2025-Q2\\141', 'Parent': 2005, 'State': 'Closed', 'Start Date': '2025-04-29', 'Finish Date': '2025-05-07', 'Created Date': '2025-04-28', 'Closed Date': '2025-05-07', 'Effort FE': 5, 'Effort Design': 2, 'Effort QA': 1 },
  { 'ID': 3009, 'Work Item Type': 'User Story', 'Title': 'Grafana Dashboards', 'Iteration Path': 'Main\\2025-Q2\\141', 'Parent': 2003, 'State': 'Active', 'Start Date': '2025-05-01', 'Created Date': '2025-04-30', 'Effort BE': 2, 'Effort Platform Eng': 3 },

  // ═══ S142 — 6 items, 33 SP, 1 incident (P1) ═══
  { 'ID': 3010, 'Work Item Type': 'User Story', 'Title': 'Refund Flow', 'Iteration Path': 'Main\\2025-Q2\\142', 'Parent': 2000, 'State': 'Closed', 'Start Date': '2025-05-13', 'Finish Date': '2025-05-22', 'Created Date': '2025-05-12', 'Closed Date': '2025-05-22', 'Effort BE': 4, 'Effort FE': 3, 'Effort QA': 2 },
  { 'ID': 3011, 'Work Item Type': 'User Story', 'Title': 'API Endpoints', 'Iteration Path': 'Main\\2025-Q2\\142', 'Parent': 2005, 'State': 'Closed', 'Start Date': '2025-05-13', 'Finish Date': '2025-05-20', 'Created Date': '2025-05-12', 'Closed Date': '2025-05-20', 'Effort BE': 4, 'Effort QA': 1 },
  { 'ID': 3012, 'Work Item Type': 'User Story', 'Title': 'Notification Preferences', 'Iteration Path': 'Main\\2025-Q2\\142', 'Parent': 2004, 'State': 'Closed', 'Start Date': '2025-05-14', 'Finish Date': '2025-05-19', 'Created Date': '2025-05-13', 'Closed Date': '2025-05-19', 'Effort FE': 2, 'Effort Native': 2, 'Effort QA': 1 },
  { 'ID': 3013, 'Work Item Type': 'Bug', 'Title': 'Alert Storm', 'Iteration Path': 'Main\\2025-Q2\\142', 'Parent': 2003, 'Tags': 'incident; emergency', 'State': 'Closed', 'Severity': '1 \u2013 Critical', 'Start Date': '2025-05-15', 'Finish Date': '2025-05-18', 'Created Date': '2025-05-15', 'Closed Date': '2025-05-18', 'Effort BE': 3, 'Effort Platform Eng': 2 },
  { 'ID': 3014, 'Work Item Type': 'User Story', 'Title': 'PDF Export', 'Iteration Path': 'Main\\2025-Q2\\142', 'Parent': 2006, 'State': 'Active', 'Start Date': '2025-05-14', 'Created Date': '2025-05-13', 'Effort BE': 2, 'Effort FE': 2, 'Effort QA': 1 },
  { 'ID': 3015, 'Work Item Type': 'User Story', 'Title': 'Payment Confirmation', 'Iteration Path': 'Main\\2025-Q2\\142', 'Parent': 2001, 'State': 'New', 'Created Date': '2025-05-20', 'Effort FE': 3, 'Effort QA': 1 },

  // ═══ S143 — 6 items, 27 SP, 1 incident ═══
  { 'ID': 3016, 'Work Item Type': 'User Story', 'Title': 'Real-time Updates', 'Iteration Path': 'Main\\2025-Q2\\143', 'Parent': 2005, 'State': 'Closed', 'Start Date': '2025-05-27', 'Finish Date': '2025-06-04', 'Created Date': '2025-05-26', 'Closed Date': '2025-06-04', 'Effort BE': 3, 'Effort FE': 3, 'Effort QA': 1 },
  { 'ID': 3017, 'Work Item Type': 'User Story', 'Title': 'CSV Export', 'Iteration Path': 'Main\\2025-Q2\\143', 'Parent': 2006, 'State': 'Closed', 'Start Date': '2025-05-27', 'Finish Date': '2025-06-02', 'Created Date': '2025-05-26', 'Closed Date': '2025-06-02', 'Effort BE': 1, 'Effort FE': 1 },
  { 'ID': 3018, 'Work Item Type': 'User Story', 'Title': 'Alert Rules Config', 'Iteration Path': 'Main\\2025-Q2\\143', 'Parent': 2003, 'State': 'Closed', 'Start Date': '2025-05-28', 'Finish Date': '2025-06-05', 'Created Date': '2025-05-27', 'Closed Date': '2025-06-05', 'Effort BE': 1, 'Effort Platform Eng': 4 },
  { 'ID': 3019, 'Work Item Type': 'Bug', 'Title': 'Android Notification Bug', 'Iteration Path': 'Main\\2025-Q2\\143', 'Parent': 2004, 'State': 'Closed', 'Start Date': '2025-05-28', 'Finish Date': '2025-05-30', 'Created Date': '2025-05-28', 'Closed Date': '2025-05-30', 'Effort Native': 2, 'Effort QA': 1 },
  { 'ID': 3020, 'Work Item Type': 'Bug', 'Title': 'Payment Race Condition', 'Iteration Path': 'Main\\2025-Q2\\143', 'Parent': 2000, 'Tags': 'incident', 'State': 'Closed', 'Severity': '3 \u2013 Medium', 'Start Date': '2025-05-29', 'Finish Date': '2025-06-03', 'Created Date': '2025-05-29', 'Closed Date': '2025-06-03', 'Effort BE': 5, 'Effort QA': 2 },
  { 'ID': 3021, 'Work Item Type': 'Task', 'Title': 'DB Index Optimization', 'Iteration Path': 'Main\\2025-Q2\\143', 'Parent': 2002, 'State': 'Closed', 'Start Date': '2025-05-27', 'Finish Date': '2025-05-31', 'Created Date': '2025-05-26', 'Closed Date': '2025-05-31', 'Effort BE': 3 },
]

export function downloadDemo4Sprint() {
  const ws = XLSX.utils.json_to_sheet(ROWS, { header: COLUMNS })

  // Set column widths
  ws['!cols'] = COLUMNS.map(col => {
    if (col === 'Title') return { wch: 30 }
    if (col === 'Iteration Path') return { wch: 22 }
    if (col.startsWith('Effort')) return { wch: 10 }
    return { wch: 16 }
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Work Items')
  XLSX.writeFile(wb, 'demo-4sprint-validation.xlsx')
}
