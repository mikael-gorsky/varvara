# Applying Database Migrations

## Option 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `oxjrbdiwdvnmlttwvdxh`
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy the contents of `migrations/20260219_create_margin_analytics_schema.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Verify tables were created in **Table Editor**

## Option 2: Command Line (if psql is available)

```bash
# Export your Supabase connection string
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.oxjrbdiwdvnmlttwvdxh.supabase.co:5432/postgres"

# Apply migration
psql $DATABASE_URL < supabase/migrations/20260219_create_margin_analytics_schema.sql
```

## What Gets Created

After running the migration, you'll have:

### Tables
- ✅ `customers` - Customer master data from 1C
- ✅ `exchange_rates` - USD/RUB conversion rates (includes sample data for 2024-2026)
- ✅ `margin_analytics_data` - Sales transactions with calculated margins
- ✅ `anomaly_alerts` - Automated margin drop alerts

### Sample Data
- 14 months of exchange rates (Jan 2024 - Jan 2026)

### Next Steps
After migration:
1. Run the Excel import service to load your 25 months of 1C data
2. Verify data in Supabase Dashboard
3. Refresh the Margins Dashboard to see real data
