#!/usr/bin/env node
import XLSX from 'xlsx';

const filePath = process.argv[2] || '/Users/mikaelgorsky/001MG/OFK/АП 2026-01 ПродажаСебестоимостьДопРасходы.xls';
const wb = XLSX.readFile(filePath, { codepage: 65001 });
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

console.log('Checking for extreme margins...\n');

for (let i = 10; i < data.length; i++) {
  const row = data[i];
  const revenue = parseFloat(row[6]) || 0;
  const cogs = parseFloat(row[7]) || 0;
  const addl = parseFloat(row[8]) || 0;

  if (revenue > 0) {
    const margin = revenue - (cogs + addl);
    const marginPct = (margin / revenue) * 100;

    if (Math.abs(marginPct) > 99999.99) {
      console.log(`Row ${i}: ${row[0]}`);
      console.log(`  Revenue: ${revenue}, COGS: ${cogs}, Additional: ${addl}`);
      console.log(`  Margin%: ${marginPct.toFixed(2)} ❌ OVERFLOW! (exceeds NUMERIC(7,2) limit)\n`);
    }
  }
}

console.log('Done.');
