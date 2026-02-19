#!/usr/bin/env node
import XLSX from 'xlsx';

const filePath = process.argv[2] || '/Users/mikaelgorsky/001MG/OFK/АП 2026-01 ПродажаСебестоимостьДопРасходы.xls';

console.log(`Reading: ${filePath}\n`);

const buffer = XLSX.readFile(filePath, { codepage: 65001 });
const sheetName = buffer.SheetNames[0];
const sheet = buffer.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

console.log(`Total rows: ${data.length}`);
console.log('First 40 rows:\n');

for (let i = 0; i < Math.min(40, data.length); i++) {
  const row = data[i];
  const cellA = row[0];
  const cellF = row[5];
  const cellG = row[6];
  const cellH = row[7];
  const cellI = row[8];

  console.log(`Row ${i.toString().padStart(3, ' ')}: [A]="${cellA}" [F]=${cellF} [G]=${cellG} [H]=${cellH} [I]=${cellI}`);
}
