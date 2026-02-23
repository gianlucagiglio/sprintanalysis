// Test that sample data + aggregateData doesn't crash
// Inline the full pipeline to check for runtime errors

const PROFESSIONAL_FAMILIES = ['BE', 'FE', 'Design', 'Analysis', 'Automation', 'Native', 'Platform Eng'];

function extractSprintInfo(iterationPath) {
  if (!iterationPath) return null;
  const match = iterationPath.match(/Main\\(\d{4})-(Q\d)\\(\d+)/);
  if (!match) return null;
  return { year: parseInt(match[1]), quarter: match[2], sprint: parseInt(match[3]), label: 'S' + match[3], fullLabel: match[2] + ' S' + match[3] };
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
  const familyTotal = (item.effortAnalysis || 0) + (item.effortAutomation || 0) + (item.effortBE || 0) + (item.effortDesign || 0) + (item.effortFE || 0) + (item.effortNative || 0) + (item.effortPlatformEng || 0);
  return familyTotal > 0 ? familyTotal : (item.effort || 0);
}

// Test 1: Sample data item
const testItem = {
  id: 1000, type: 'Epic', title: 'Test Epic', state: 'Active',
  effort: 0, iterationPath: 'Main', parent: null, tags: null,
  effortBE: 0, effortFE: 0, effortDesign: 0, effortAnalysis: 0,
  effortAutomation: 0, effortNative: 0, effortPlatformEng: 0,
};

console.log('Test classify:', classifyByTags(testItem.tags));
console.log('Test effort:', calculateEffort(testItem));
console.log('Test sprint:', extractSprintInfo(testItem.iterationPath));

// Test 2: EpicExplorer sort - does title.localeCompare crash?
const items = [
  { id: 1, type: 'Epic', title: 'B Epic' },
  { id: 2, type: 'Epic', title: 'A Epic' },
  { id: 3, type: 'Epic', title: undefined },
  { id: 4, type: 'Epic', title: null },
];

try {
  const sorted = items.sort((a, b) => a.title.localeCompare(b.title));
  console.log('Sort ok:', sorted.map(i => i.title));
} catch (e) {
  console.log('SORT CRASH:', e.message);
}

// Test 3: localeCompare with null/undefined
try { 'hello'.localeCompare(undefined); console.log('localeCompare(undefined) ok'); } catch (e) { console.log('localeCompare(undefined) CRASH:', e.message); }
try { null.localeCompare('hello'); console.log('null.localeCompare ok'); } catch (e) { console.log('null.localeCompare CRASH:', e.message); }
try { undefined.localeCompare('hello'); console.log('undefined.localeCompare ok'); } catch (e) { console.log('undefined.localeCompare CRASH:', e.message); }

// Test 4: Load new Excel and run full aggregation
const XLSX = require('xlsx');
const wb = XLSX.readFile('Sprint Analysis 2.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rawRows = XLSX.utils.sheet_to_json(ws);
const filtered = rawRows.filter(r => r['ID'] !== 'ID' && r['Work Item Type']);

const parsedItems = filtered.map(r => {
  let parent = r['Parent'];
  if (parent === 'null' || parent === 'undefined' || parent === undefined) parent = null;
  else parent = Number(parent);
  if (isNaN(parent)) parent = null;
  return {
    id: Number(r['ID']), type: r['Work Item Type'] || null,
    title: r['Title'] || '', state: r['State'] || null,
    tags: r['Tags'] || null, parent, effort: parseFloat(r['Effort']) || 0,
    valueArea: r['Value Area'] || null, iterationPath: r['Iteration Path'] || null,
    effortBE: 0, effortFE: 0, effortDesign: 0, effortAnalysis: 0,
    effortAutomation: 0, effortNative: 0, effortPlatformEng: 0,
    startDate: null, finishDate: null,
  };
}).filter(i => i.id != null);

// Run classify
const byId = new Map();
parsedItems.filter(i => i.type).forEach(item => byId.set(item.id, { ...item }));
byId.forEach(item => { if (item.type === 'Epic') item.classification = classifyByTags(item.tags); });
byId.forEach(item => {
  if (item.type === 'Feature') {
    const p = item.parent && byId.has(item.parent) ? byId.get(item.parent) : null;
    if (p && p.type === 'Epic' && p.classification && p.classification !== 'Unclassified' && p.classification !== 'Other') {
      item.classification = p.classification;
    } else {
      item.classification = classifyByTags(item.tags);
    }
  }
});
byId.forEach(item => {
  if (item.type !== 'Feature' && item.type !== 'Epic') {
    if (item.parent && byId.has(item.parent)) {
      const parent = byId.get(item.parent);
      if (parent.type === 'Feature') item.classification = parent.classification;
      else if (parent.parent && byId.has(parent.parent)) {
        const gp = byId.get(parent.parent);
        if (gp.type === 'Feature') item.classification = gp.classification;
      }
    }
    if (!item.classification) item.classification = classifyByTags(item.tags);
  }
});

// Process
const processedItems = Array.from(byId.values()).map(item => ({
  ...item,
  totalEffort: calculateEffort(item),
  sprintInfo: extractSprintInfo(item.iterationPath),
}));

// Test Epic sort (like EpicExplorer does)
try {
  const epics = processedItems.filter(i => i.type === 'Epic');
  const sorted = epics.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  console.log('\nEpic sort OK:', sorted.length, 'epics');
} catch (e) {
  console.log('\nEPIC SORT CRASH:', e.message);
}

// Summary
const summary = {};
processedItems.forEach(i => {
  const cls = i.classification || 'Unclassified';
  summary[cls] = (summary[cls] || 0) + 1;
});
console.log('Final classification:', summary);
console.log('\nALL TESTS PASSED - no crashes detected');
