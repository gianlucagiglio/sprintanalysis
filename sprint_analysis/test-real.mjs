// Test using the actual app modules
import { readFileSync } from 'fs';
import * as XLSX from 'xlsx';

// Inline the relevant functions exactly as they are in the codebase
function classifyByTags(tags) {
  if (!tags || typeof tags !== 'string' || tags.trim() === '') return 'Unclassified'
  const tagList = tags.split(';').map(t => t.trim().toLowerCase())
  for (const tag of tagList) {
    if (tag === 'strategic') return 'Strategic'
    if (tag === 'ktlo') return 'KTLO'
    if (tag === 'small change' || tag === 'small') return 'Small Change'
  }
  return 'Other'
}

// Test with the SAMPLE DATA format (old model with per-family effort)
const sampleFeature = { tags: 'strategic; Backend; Payments', effort: 0, effortBE: 5, effortFE: 3 };
console.log('Sample feature "strategic; Backend; Payments":', classifyByTags(sampleFeature.tags));

const sampleFeature2 = { tags: 'Small Change; Hardware' };
console.log('Sample feature "Small Change; Hardware":', classifyByTags(sampleFeature2.tags));

const sampleFeature3 = { tags: 'ktlo; Backend' };
console.log('Sample feature "ktlo; Backend":', classifyByTags(sampleFeature3.tags));

const sampleFeature4 = { tags: null };
console.log('Sample feature null tags:', classifyByTags(sampleFeature4.tags));

const sampleFeature5 = { tags: 'Backend; Security' };
console.log('Sample feature "Backend; Security" (no classification):', classifyByTags(sampleFeature5.tags));

// Test with the NEW Excel file
const buf = readFileSync('Sprint Analysis 2.xlsx');
const wb = XLSX.read(buf, { type: 'buffer' });
const ws = wb.Sheets[wb.SheetNames[0]];
const rawRows = XLSX.utils.sheet_to_json(ws);

// Apply parser filter
const filtered = rawRows.filter(r => r['ID'] !== 'ID' && r['Work Item Type']);
console.log('\n=== New Excel ===');
console.log('Filtered rows:', filtered.length);

// Also test with the OLD Excel file if it exists
try {
  const buf2 = readFileSync('Sprint analysis.xlsx');
  const wb2 = XLSX.read(buf2, { type: 'buffer' });
  const ws2 = wb2.Sheets[wb2.SheetNames[0]];
  const rawRows2 = XLSX.utils.sheet_to_json(ws2);
  const filtered2 = rawRows2.filter(r => r['ID'] !== 'ID' && r['Work Item Type']);
  console.log('\n=== Old Excel ===');
  console.log('Total rows:', rawRows2.length);
  console.log('Filtered rows:', filtered2.length);
  console.log('Columns:', Object.keys(rawRows2[0]));

  // Check classification of old features
  const oldFeatures = filtered2.filter(r => r['Work Item Type'] === 'Feature');
  console.log('Features:', oldFeatures.length);
  const oldClassifications = { strategic: 0, ktlo: 0, small: 0, other: 0, none: 0 };
  oldFeatures.forEach(f => {
    const cls = classifyByTags(f.Tags);
    if (cls === 'Strategic') oldClassifications.strategic++;
    else if (cls === 'KTLO') oldClassifications.ktlo++;
    else if (cls === 'Small Change') oldClassifications.small++;
    else if (cls === 'Other') oldClassifications.other++;
    else oldClassifications.none++;
  });
  console.log('Old file classifications:', oldClassifications);

  // Show features that are now "Other" (might have been classified before)
  const otherFeatures = oldFeatures.filter(f => classifyByTags(f.Tags) === 'Other');
  if (otherFeatures.length > 0) {
    console.log('\nFeatures classified as "Other" (potential regressions):');
    otherFeatures.forEach(f => {
      console.log(`  ID=${f.ID} Tags="${f.Tags}" → Other`);
    });
  }
} catch (e) {
  console.log('\nOld Excel file not found or error:', e.message);
}
