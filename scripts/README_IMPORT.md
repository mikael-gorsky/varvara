# 1C Data Import Guide

## Prerequisites

1. ✅ Apply database migration (`supabase/migrations/20260219_create_margin_analytics_schema.sql`)
2. ✅ Have your 1C Excel files ready
3. ✅ Install dependencies: `npm install`

## Import Process

### Step 1: Import Single File (Test)

Start with one month to test:

```bash
node scripts/import-1c-data.js "/Users/mikaelgorsky/001MG/OFK/АП 2026-01 ПродажаСебестоимостьДопРасходы.xls"
```

Expected output:
```
📂 Reading file: ...
📊 Total rows: 1430
🔍 Parsing hierarchical data...
📅 Period: Январь 2026
  📁 Category: Конечные заказчики
  👤 Customer: Интернет Решения (1234567890)
...
✅ Parsed 42 customers and 1408 transactions
💾 Inserting customers into Supabase...
✅ Inserted/updated 42 customers
💾 Inserting 1408 transactions in batches of 1000...
  ✅ Inserted 1408 / 1408 transactions
🎉 Import complete!
```

### Step 2: Import All Historical Data

Once test succeeds, import all 25 months:

```bash
# 2024 (full year - 12 months)
node scripts/import-1c-data.js "/Users/mikaelgorsky/001MG/OFK/АП 2024 ПродажаСебестоимостьДопРасходы.xls"

# 2025 (full year - 12 months)
node scripts/import-1c-data.js "/Users/mikaelgorsky/001MG/OFK/АП 2025 ПродажаСебестоимостьДопРасходы.xls"

# 2026 January
node scripts/import-1c-data.js "/Users/mikaelgorsky/001MG/OFK/АП 2026-01 ПродажаСебестоимостьДопРасходы.xls"
```

**Note:** Files can be imported multiple times. Customers are upserted (updated if they exist), and transactions are appended.

### Step 3: Verify Data

Check Supabase Dashboard:
1. Go to **Table Editor** → `customers` (should have ~40-50 rows)
2. Go to **Table Editor** → `margin_analytics_data` (should have ~42,000 rows after all imports)
3. Go to **Table Editor** → `exchange_rates` (should have 14 months of rates)

### Step 4: Refresh Margins Dashboard

Visit https://varvara.netlify.app → FINANCE → MARGINS

The dashboard will now show real data from your 1C system!

## File Format Expected

The import script expects Excel files with this structure:

| Column | Field | Description |
|--------|-------|-------------|
| A | Hierarchy | Period → Category → Customer+INN → Product |
| F | Количество | Quantity (units) |
| G | Продажи руб | Sales Revenue (RUB) |
| H | Себестоимость руб | Cost of Goods Sold (RUB) |
| I | Доп расходы руб | Additional Expenses (RUB) |

Hierarchy levels (detected by indentation):
- Level 0 (no indent): Period (e.g., "Январь 2024")
- Level 1 (2 spaces): Category or Customer+INN
- Level 2 (4 spaces): Product name

## Troubleshooting

### "Missing Supabase credentials"
- Check `.env` file has `VITE_SUPABASE_URL` and `VITE_SUPABASE_SERVICE_ROLE_KEY`

### "Error reading Excel file"
- Verify file path is correct
- Check file is not corrupted
- Try opening in Excel first

### "Error inserting customers/transactions"
- Check migration was applied successfully
- Verify Supabase tables exist
- Check RLS policies allow inserts

### "Could not parse period"
- Script expects Russian month names: Январь, Февраль, Март, etc.
- Verify Excel file has standard 1C format

## Next Steps

After import:
1. ✅ Connect dashboard to Supabase (replace mock data)
2. ✅ Test filtering by period and category
3. ✅ Implement anomaly detection
4. ✅ Add exchange rate updates (CBR API)
