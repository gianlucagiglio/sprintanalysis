const XLSX = require('xlsx');

// Check new Excel
try {
  const wb = XLSX.readFile('Sprint Analysis 2.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(ws);
  const filtered = rawRows.filter(r => r['ID'] !== 'ID' && r['Work Item Type']);

  console.log('=== Sprint Analysis 2.xlsx ===');
  console.log('Total rows:', rawRows.length);
  console.log('Filtered rows:', filtered.length);
  console.log('Columns:', Object.keys(filtered[0]));

  // Types
  const types = {};
  filtered.forEach(r => { types[r['Work Item Type']] = (types[r['Work Item Type']] || 0) + 1 });
  console.log('Types:', types);

  // Titles
  const emptyTitles = filtered.filter(r => !r['Title']);
  console.log('Empty titles:', emptyTitles.length, '/', filtered.length);

  // Effort
  const withEffort = filtered.filter(r => r['Effort'] > 0);
  console.log('With Effort > 0:', withEffort.length);

  // Iteration Path
  const withIP = filtered.filter(r => r['Iteration Path']);
  console.log('With Iteration Path:', withIP.length);
  if (withIP.length > 0) {
    const ips = [...new Set(withIP.map(r => r['Iteration Path']))];
    console.log('Unique IPs:', ips.slice(0, 10));
    // Test regex
    const regex = /Main\\(\d{4})-(Q\d)\\(\d+)/;
    ips.forEach(ip => {
      const m = ip.match(regex);
      console.log(`  "${ip}" => ${m ? `Y=${m[1]} Q=${m[2]} S=${m[3]}` : 'NO MATCH'}`);
    });
  }

  // Tags
  const withTags = filtered.filter(r => r['Tags'] && String(r['Tags']).trim());
  console.log('With Tags:', withTags.length);
  if (withTags.length > 0) {
    const sampleTags = withTags.slice(0, 8).map(r => `  [${r['Work Item Type']}] ID=${r['ID']} Tags="${r['Tags']}"`);
    sampleTags.forEach(t => console.log(t));
  }

  // Sample first 3 items
  console.log('\nSample items:');
  filtered.slice(0, 3).forEach(r => console.log(JSON.stringify(r, null, 2)));

} catch (e) {
  console.log('Error reading new Excel:', e.message);
}

// Check old Excel
try {
  const wb2 = XLSX.readFile('Sprint analysis.xlsx');
  const ws2 = wb2.Sheets[wb2.SheetNames[0]];
  const rawRows2 = XLSX.utils.sheet_to_json(ws2);
  const filtered2 = rawRows2.filter(r => r['ID'] !== 'ID' && r['Work Item Type']);

  console.log('\n=== Sprint analysis.xlsx (old) ===');
  console.log('Total rows:', rawRows2.length);
  console.log('Filtered rows:', filtered2.length);
  console.log('Columns:', Object.keys(rawRows2[0]));

  const types2 = {};
  filtered2.forEach(r => { types2[r['Work Item Type']] = (types2[r['Work Item Type']] || 0) + 1 });
  console.log('Types:', types2);

  const withIP2 = filtered2.filter(r => r['Iteration Path']);
  console.log('With Iteration Path:', withIP2.length);
  if (withIP2.length > 0) {
    const ips2 = [...new Set(withIP2.map(r => r['Iteration Path']))];
    console.log('Sample IPs:', ips2.slice(0, 5));
  }
} catch (e) {
  console.log('Old Excel not found:', e.message);
}
