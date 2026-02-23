// End-to-end test: parse Excel → mapRow → aggregateData pipeline
const XLSX = require('xlsx');

// ---- Inline parser (same as excel-parser.js) ----
const COLUMN_MAP = {
  'ID': 'id', 'Work Item Type': 'type', 'Title': 'title', 'State': 'state',
  'Effort': 'effort', 'Iteration Path': 'iterationPath', 'Parent': 'parent',
  'Business Value': 'businessValue', 'Value Area': 'valueArea', 'Tags': 'tags',
  'Area Path': 'areaPath', 'Product Area': 'productArea',
  'Created Date': 'createdDate', 'Changed Date': 'changedDate', 'Closed Date': 'closedDate',
  'Start Date': 'startDate', 'Finish Date': 'finishDate',
  'Severity': 'severity', 'Priority': 'priority', 'Frequence': 'frequence', 'Prevalence': 'prevalence',
  'Effort Analysis': 'effortAnalysis', 'Effort Automation': 'effortAutomation',
  'Effort BE': 'effortBE', 'Effort Design': 'effortDesign', 'Effort FE': 'effortFE',
  'Effort Native': 'effortNative', 'Effort Platform Eng': 'effortPlatformEng',
};

function mapRow(row) {
  const mapped = {};
  for (const [excelCol, internalKey] of Object.entries(COLUMN_MAP)) {
    let val = row[excelCol];
    if (val === 'null' || val === 'undefined' || val === undefined) val = null;
    mapped[internalKey] = val;
  }
  mapped.title = mapped.title ? String(mapped.title) : '';
  mapped.id = mapped.id != null ? Number(mapped.id) : null;
  mapped.parent = mapped.parent != null ? Number(mapped.parent) : null;
  if (isNaN(mapped.parent)) mapped.parent = null;
  mapped.effort = parseFloat(mapped.effort) || 0;
  mapped.businessValue = parseFloat(mapped.businessValue) || 0;
  mapped.priority = mapped.priority != null ? Number(mapped.priority) : null;
  mapped.effortAnalysis = parseFloat(mapped.effortAnalysis) || 0;
  mapped.effortAutomation = parseFloat(mapped.effortAutomation) || 0;
  mapped.effortBE = parseFloat(mapped.effortBE) || 0;
  mapped.effortDesign = parseFloat(mapped.effortDesign) || 0;
  mapped.effortFE = parseFloat(mapped.effortFE) || 0;
  mapped.effortNative = parseFloat(mapped.effortNative) || 0;
  mapped.effortPlatformEng = parseFloat(mapped.effortPlatformEng) || 0;
  return mapped;
}

// ---- Inline data-processor functions ----
const PROFESSIONAL_FAMILIES = ['BE', 'FE', 'Design', 'Analysis', 'Automation', 'Native', 'Platform Eng'];

function extractSprintInfo(iterationPath) {
  if (!iterationPath) return null;
  const match = iterationPath.match(/Main\\(\d{4})-(Q\d)\\(\d+)/);
  if (!match) return null;
  return { year: parseInt(match[1]), quarter: match[2], sprint: parseInt(match[3]),
    label: `S${match[3]}`, fullLabel: `${match[2]} S${match[3]}` };
}

function classifyByTags(tags) {
  if (!tags || typeof tags !== 'string' || tags.trim() === '') return 'Unclassified';
  const tagList = tags.split(';').map(t => t.trim().toLowerCase());
  for (const tag of tagList) {
    if (tag === 'strategic') return 'Strategic';
    if (tag === 'ktlo') return 'KTLO';
    if (tag === 'small change' || tag === 'small') return 'Small Change';
  }
  return 'Other';
}

function calculateEffort(item) {
  const familyTotal = (item.effortAnalysis || 0) + (item.effortAutomation || 0) +
    (item.effortBE || 0) + (item.effortDesign || 0) + (item.effortFE || 0) +
    (item.effortNative || 0) + (item.effortPlatformEng || 0);
  return familyTotal > 0 ? familyTotal : (item.effort || 0);
}

// ---- Test ----
const wb = XLSX.readFile('Sprint Analysis 2.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rawRows = XLSX.utils.sheet_to_json(ws);
const filtered = rawRows.filter(r => r['ID'] !== 'ID' && r['Work Item Type']);
const items = filtered.map(mapRow).filter(i => i.id != null);

console.log('=== PARSED ITEMS ===');
console.log('Total items:', items.length);

// Check titles
const noTitle = items.filter(i => !i.title);
console.log('Items with empty title:', noTitle.length);

// Check Epics
const epics = items.filter(i => i.type === 'Epic');
console.log('\n=== EPICS ===');
epics.forEach(e => console.log(`  ID=${e.id} title="${e.title}" tags="${e.tags}" effort=${e.effort}`));

// Check Features
const features = items.filter(i => i.type === 'Feature');
console.log('\n=== FEATURES (first 10) ===');
features.slice(0, 10).forEach(f => {
  console.log(`  ID=${f.id} parent=${f.parent} title="${f.title}" tags="${f.tags}" cls=${classifyByTags(f.tags)} effort=${f.effort}`);
});

// Check effort
console.log('\n=== EFFORT ===');
const totalEffort = items.reduce((s, i) => s + calculateEffort(i), 0);
console.log('Total effort:', totalEffort);
console.log('Items with effort > 0:', items.filter(i => calculateEffort(i) > 0).length);

// Check sprint info
console.log('\n=== SPRINT INFO ===');
const withSprint = items.filter(i => extractSprintInfo(i.iterationPath));
console.log('Items with sprint info:', withSprint.length);
const noSprint = items.filter(i => !extractSprintInfo(i.iterationPath));
console.log('Items without sprint info:', noSprint.length);
noSprint.forEach(i => console.log(`  ID=${i.id} type=${i.type} IP="${i.iterationPath}"`));

// Classification summary
console.log('\n=== CLASSIFICATION ===');
const cls = { Strategic: 0, KTLO: 0, 'Small Change': 0, Other: 0, Unclassified: 0 };
items.forEach(i => { cls[classifyByTags(i.tags)] = (cls[classifyByTags(i.tags)] || 0) + 1; });
console.log('By tags only:', cls);

// Check what processedData would look like
console.log('\n=== KEY INSIGHTS ===');
console.log('1. Effort:', totalEffort === 0 ? '*** ALL ZERO *** — Excel has no Effort column!' : 'OK');
console.log('2. Titles:', noTitle.length === 0 ? 'ALL OK' : `*** ${noTitle.length} MISSING ***`);
console.log('3. Sprint:', withSprint.length, 'valid,', noSprint.length, 'no match');
console.log('4. Tags:', items.filter(i => i.tags).length, '/', items.length, 'have tags');
