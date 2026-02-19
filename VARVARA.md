# VARVARA - Business Intelligence Platform

## Project Overview

**Varvara** is a Business Intelligence platform for analyzing sales, margins, profitability, and cash flow. The system imports data from 1C accounting system (via Excel exports) and provides comprehensive analytics that 1C cannot deliver in a single integrated view.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS
- Backend: Supabase (PostgreSQL)
- Data Import: Excel files (xlsx library)
- Deployment: Netlify

---

## Application Structure

### Menu Navigation

**Dashboard (Home Page):**
- Default landing page when app starts
- Not a menu item
- Accessible by clicking "VARVARA" logo (desktop/mobile)
- Shows high-level KPIs and overview metrics

**Main Menu Items:**

1. **CUSTOMERS** (formerly CHANNELS)
   - Customer analytics by sales channel
   - Submenus: OZON, WILDBERRIES, COMUS, DNS, MERLION, EBURG, SARATOV
   - L3 subitems for OZON: COMPANIES, CATEGORIES, MARKETING

2. **MOTIVATION**
   - Team performance and incentives
   - No submenus

3. **FINANCE**
   - Financial analytics and reports
   - Submenus:
     - **MARGINS** - Gross margin analysis by customer
     - **PROFITS** - Profit calculation and reporting (coming soon)
     - **CALENDAR** - Payment calendar and cash flow planning (coming soon)

4. **PRODUCTS**
   - Product catalog and performance
   - Submenus: CATALOG, PERFORMANCE, CATEGORIES

5. **INVENTORY**
   - Inventory management (top-level module, formerly submenu of PRODUCTS)
   - No submenus

6. **TARGETS** (formerly PLAN)
   - Goal setting and planning
   - Submenus: SALES PLANS, BUDGET, TIMELINE

7. **IMPORT**
   - Data import from external sources
   - Submenus: IMPORT OZON REPORTS, IMPORT WB REPORTS, IMPORT YANDEX.MARKET REPORTS, IMPORT OUR PRICE-LIST

8. **SETTINGS**
   - Application configuration
   - Submenus: INTERFACE DESIGN, THEME, LANGUAGE, USERS

---

## Customer Requirements

### Priority 1: Gross Margin by Customer ⭐ START HERE

**Core Formula:**
```
Margin = Revenue - (Cost of Goods + Logistics + Bonuses/Retro-bonuses + Discounts)
+ Payment Terms (days tracking)
= Real Customer Contribution
```

**Required Analytics Views:**

1. **Margin Calculations:**
   - Margin per distributor (customer)
   - Margin by product categories within each customer
   - Additional metrics: Profitability ratios, Efficiency indicators

2. **Multi-dimensional Filtering:**
   - By customer categories
   - By managers (sales representatives)
   - By products/product categories
   - By time periods

3. **Time Comparisons:**
   - Month-over-month (MoM)
   - Quarter-over-quarter (QoQ)
   - Year-over-year (YoY)
   - Custom date ranges

**Pain Points with 1C:**
- Cannot compare multiple time periods in one view
- Cannot apply multiple filters simultaneously
- Profitability/efficiency calculations are incorrect
- No customer payment terms tracking

---

### Priority 2: Payment Calendar (Cash Flow Planning)

**Purpose:** Cash flow forecasting and liquidity management

**Incoming Cash Flows:**
- Customer payments based on: Shipment Date + Payment Terms (days)
- Expected payment dates

**Outgoing Cash Flows:**
- Supplier payments (based on order terms)
- Logistics costs
- Customs duties
- VAT payments
- Fixed mandatory payments:
  - Rent
  - Salaries
  - Taxes

**Required Views:**
- Weekly cash flow calendar
- Monthly cash flow calendar
- Cash position forecasting

**Dream Feature:**
- Use cash flow projections to evaluate ordering opportunities
- Scenario planning ("What if we order X from supplier Y?")

---

### Priority 3: Profit by Department/Customer Category

**Current Manual Process (Excel-based, Quarterly):**
```
Profit = Shipments - Direct Costs - Commercial Expenses - Allocated Administrative Expenses
```

**Proposed Enhancement:**
- Automated profit calculation by customer categories
- Cost allocation based on:
  - Payment register (actual payments made)
  - Customer marginality data
- Replace manual Excel calculations with automated reports

**Open Question:** Customer is uncertain if they want profit by customer categories or keep department-based view. Needs clarification.

---

## Data Sources & Structure

### Current Data: 1C "Sales Analysis" Export

**File Format:** Excel (.xls)
- **Naming Convention:** `АП [Year/Period] ПродажаСебестоимостьДопРасходы.xls`
- **Translation:** "AP [Year/Period] Sales-Cost-AdditionalExpenses.xls"

> **⚠️ IMPORTANT NOTE ON DATA FORMAT:**
>
> The current 1C export format described below is what we are using **NOW** for initial implementation. However, this format **will be changing** in the future with strong input from our side to better support the analytics requirements. The system architecture should be flexible enough to accommodate format changes without major refactoring.
>
> Current format serves as baseline/MVP data structure. Enhanced format will include:
> - Separate columns for expense breakdown (logistics, bonuses, discounts)
> - Payment terms data
> - Manager assignments
> - Additional dimensions as requirements evolve

**Available Historical Data:**
- ✅ **2024 Full Year:** 12 months (Jan-Dec 2024) - 21,549 rows
- ✅ **2025 Full Year:** 12 months (Jan-Dec 2025) - 20,981 rows
- ✅ **2026 January:** Single month (Jan 2026) - 1,430 rows

**File Structure Patterns:**
- **Yearly files** contain all 12 months in one file
- **Monthly files** contain a single month
- All files have **identical column structure**
- Each file has "Итого" (Total) row at the end

**Data Structure:**

```
📅 Period (Month)
  ├─ 📁 Customer Category (e.g., "Конечные заказчики" = End Customers)
  │   ├─ 👤 Customer Name + INN (Tax ID)
  │   │   ├─ 📦 Product 1 (Quantity, Sales, Cost, Additional Expenses)
  │   │   ├─ 📦 Product 2
  │   │   └─ 📦 Product 3
  │   └─ 👤 Next Customer...
  └─ 📁 Next Category...
```

**Available Columns:**

| Column | Field | Description |
|--------|-------|-------------|
| A | Hierarchy | Period → Activity → Customer+INN → Product Name |
| F | Количество | Quantity (units) |
| G | Продажи руб | **Sales Revenue (RUB)** |
| H | Себестоимость руб | **Cost of Goods Sold (RUB)** |
| I | Доп расходы руб | **Additional Expenses (RUB)** |

**Historical Data Summary:**

**2024 (Full Year):**
- Total Quantity: 396,180 units
- Total Sales: ₽738,759,706
- Average Monthly Sales: ₽61.6M
- Range: ₽37.1M (Jan) to ₽89.4M (Dec)

**2025 (Full Year):**
- Total Quantity: 493,213 units
- Total Sales: ₽679,467,629
- Average Monthly Sales: ₽56.6M
- Range: ₽41.7M (May) to ₽88.4M (Mar)

**2026 (January only):**
- Quantity: 27,031 units
- Sales: ₽28,487,599
- COGS: ₽15,365,733
- Additional Expenses: ₽3,061,036

**Key Observations:**
- 2024 sales growth trend (₽37M → ₽89M, Jan to Dec)
- 2025 total sales lower than 2024 despite higher quantity
- Consistent data structure across all periods enables time-series analysis

---

## Design Decisions

### 1. Expense Breakdown Strategy

**Current Approach:**
- **Additional Expenses (Доп расходы):** Received as bulk sum from 1C
- **Discounts:** Assumed to be included in Sales figure

**Future Flexibility:**
- Keep option to break down Additional Expenses into:
  - Logistics
  - Bonuses/Retro-bonuses
  - Other operational costs
- Keep option to separate discounts from gross sales

**Implementation:** Design database schema and UI to support both aggregate and detailed views

### 2. Payment Terms Tracking

**Current Status:** Not available in 1C export

**Design Decision:**
- Include Payment Terms fields in database schema
- Add Payment Terms to UI/forms
- Display placeholder: **"Data is needed"** where payment terms would show
- Prepare for future data integration when source is determined

### 3. Customer Categories

**Current Approach:**
- Use categories as they appear in 1C export (e.g., "Конечные заказчики")
- Categories are hierarchical groupings in the data

**Future Enhancement:**
- May add custom categorization (by region, size, industry, etc.)
- Support for multiple categorization schemes

### 4. Time Period Comparisons

**Data Availability:**
- Single file = single month of data
- Historic files to be provided later

**Implementation Plan:**
- Import multiple monthly files
- Build time-series database
- Enable MoM, QoQ, YoY comparison views

### 5. Manager Dimension

**Status:** Under consideration by customer
- Manager info mentioned in 1C filter but not in data columns
- May need separate data source or enhanced export

### 6. Data Format Evolution Strategy

**Critical Design Principle:** The current 1C export format is **TEMPORARY** and will evolve.

**Current State (MVP):**
- Using existing 1C "Sales Analysis" export format
- Limited columns: Sales, COGS, Additional Expenses (bulk)
- No payment terms, manager assignments, or expense breakdowns

**Future State:**
- Enhanced export format designed collaboratively with strong input from our side
- Separate columns for expense components (logistics, bonuses, discounts)
- Additional dimensions (managers, payment terms, custom categories)
- Possibly different file structure or additional data sources

**Architectural Implications:**
1. **Flexible Import Pipeline:**
   - Support multiple file format versions
   - Version detection/migration capability
   - Easy to add new column mappings

2. **Extensible Database Schema:**
   - Core tables can accommodate new fields without breaking changes
   - Use JSON columns for variable/optional data
   - Separate tables for optional dimensions

3. **Adapter Pattern:**
   - Create format adapters/parsers for each file version
   - New format = new adapter, old data remains compatible
   - Example: `1CFormatV1Parser`, `1CFormatV2Parser`

4. **UI Flexibility:**
   - Show/hide columns based on data availability
   - Gracefully handle missing data (placeholders like "Data needed")
   - Progressive enhancement as more data becomes available

**Timeline:**
- **Phase 1 (Now):** Build with current format, architect for change
- **Phase 2 (After MVP):** Collaborate on enhanced format design
- **Phase 3:** Implement new format parser, migrate historical data if needed

---

## Technical Architecture

### Database Schema (Supabase)

**Core Tables (Planned):**

1. **`customers`**
   - customer_id (PK)
   - name
   - inn (tax ID)
   - category
   - payment_terms_days
   - created_at, updated_at

2. **`sales_transactions`**
   - transaction_id (PK)
   - customer_id (FK)
   - product_name
   - period_date (month)
   - quantity
   - sales_rub
   - cogs_rub
   - additional_expenses_rub
   - margin_rub (calculated)
   - created_at

3. **`expense_details`** (Future)
   - expense_id (PK)
   - transaction_id (FK)
   - expense_type (logistics, bonuses, discounts, other)
   - amount_rub

4. **`payment_calendar`** (Priority 2)
   - payment_id (PK)
   - customer_id (FK)
   - shipment_date
   - expected_payment_date
   - amount_rub
   - payment_type (incoming/outgoing)
   - status (pending/received/paid)

5. **`managers`** (Optional)
   - manager_id (PK)
   - name
   - department
   - customers (relationship)

6. **`exchange_rates`**
   - rate_id (PK)
   - date (unique for RUB/USD pair)
   - currency_from (RUB)
   - currency_to (USD)
   - rate (decimal)
   - source (CBR, ECB, manual, etc.)
   - created_at

7. **`anomaly_alerts`**
   - alert_id (PK)
   - alert_type (sales_drop, margin_compression, unusual_activity, etc.)
   - entity_type (customer, category, product, overall)
   - entity_id (FK - if applicable)
   - period_date
   - metric_name
   - actual_value
   - expected_value (baseline)
   - deviation_percent
   - severity (low, medium, high)
   - status (new, acknowledged, resolved)
   - created_at

8. **`import_history`** (Data tracking)
   - import_id (PK)
   - file_name
   - import_date
   - period_start
   - period_end
   - records_imported
   - status (success, partial, failed)
   - notes

### Import Pipeline

**Phase 1: Excel Import Service**
1. Upload Excel file (.xls format)
2. Parse hierarchical structure
3. Extract:
   - Period (month)
   - Customer categories
   - Customer names + INN
   - Products
   - Metrics (quantity, sales, COGS, additional expenses)
4. Calculate derived fields:
   - Margin (basic calculation)
   - Margin %
5. Store in normalized database tables

**Phase 2: Historic Data Import**
- Batch import of multiple monthly files
- Deduplicate records
- Build time-series data

### Analytics Services

**Planned Services:**

1. **`marginAnalyticsService.ts`**
   - Calculate margin by customer
   - Calculate margin by category
   - Calculate margin by product
   - Time-series margin trends
   - Comparison reports (MoM, QoQ, YoY)

2. **`profitabilityService.ts`**
   - Profitability ratios
   - Efficiency metrics
   - Customer contribution ranking

3. **`cashFlowService.ts`** (Priority 2)
   - Payment calendar generation
   - Cash flow forecasting
   - Liquidity analysis

4. **`costAllocationService.ts`** (Priority 3)
   - Distribute costs by customer category
   - Profit calculation by department/category

5. **`currencyConversionService.ts`**
   - RUB to USD conversion using historical rates
   - Exchange rate data management
   - Period-appropriate rate selection
   - Cache exchange rates for performance

6. **`anomalyDetectionService.ts`**
   - Baseline calculation (historical averages, trends)
   - Deviation detection (MoM, QoQ, YoY comparisons)
   - Configurable threshold alerts
   - Flag generation for unusual patterns
   - Examples:
     - Sales drop >20% vs previous period
     - Margin compression >X%
     - Unusual customer activity

---

## UI/UX Components

### Dashboard Views

1. **Margin Dashboard**
   - Customer margin table (sortable, filterable)
   - **Dual currency display:** RUB (primary) + USD (context)
   - Category margin breakdown
   - Top/bottom performers
   - Margin trends chart
   - Time period selector (MoM, QoQ, YoY)
   - **Anomaly indicators:** Visual flags for unusual patterns
   - Alert badges for significant deviations

2. **Filters Panel**
   - Customer category selector
   - Manager selector (when available)
   - Product/category selector
   - Date range picker
   - Custom filter combinations

3. **Payment Calendar** (Priority 2)
   - Calendar view (weekly/monthly)
   - Incoming vs outgoing payments
   - Cash position tracking
   - Scenario planning tools

4. **Profitability Report** (Priority 3)
   - Department profit view
   - Customer category profit view
   - Cost allocation breakdown

---

## Implementation Decisions

### Data Import Strategy

**✅ Decision: Support Both File Formats (Option C)**
- Auto-detect if file contains single month or multiple months
- Parse accordingly with flexible parser
- Handles both yearly exports (12 months) and monthly exports (1 month)

**✅ Decision: All Historical Data Import**
- Import all 25 months for first release (Jan 2024 - Jan 2026)
- Provides full historical baseline for comparisons
- Enables immediate YoY, QoQ, MoM analytics

### Data Update Strategy

**✅ Target: Regular Updates → Real-Time** (Evolving)
- **Current State:** Manual Excel file uploads
- **Near Future:** Regular scheduled updates (daily/weekly)
- **Long-term Goal:** Real-time or near-real-time data sync
- Architecture must support incremental updates and data corrections

**Update Handling:**
- Support re-importing corrected data for same period
- Detect duplicates and handle updates/corrections
- Track data versions/timestamps for audit trail
- Options: Upsert (update existing) or versioned history

### Currency Display

**✅ Dual Currency Display: RUB + USD**
- **Base Currency:** Russian Roubles (RUB) - primary/source data
- **Context Currency:** US Dollars (USD) - for international context
- Display both currencies in dashboards and reports

**Exchange Rate Handling:**
- Need exchange rate source (e.g., Central Bank of Russia, ECB, or manual input)
- Historical rates for accurate period comparisons
- Decision needed: Use period-average rate or specific date rate?

### Anomaly Detection & Alerts

**✅ Enable Alerts for Unusual Patterns**
- Flag significant deviations from baseline
- Examples:
  - Sales drops >20% MoM or YoY
  - Margin compression alerts
  - Unusual customer behavior
- User-configurable thresholds

---

## Open Questions & Next Steps

### Questions Resolved:

1. ✅ **Expense breakdown** → Keep bulk for now, design for future breakdown
2. ✅ **Discounts in sales** → Assume included, allow future separation
3. ✅ **Customer categories** → Use 1C export categories
4. ✅ **Historic data** → Received (2024, 2025 full years)
5. ✅ **Import approach** → Option C (support both formats)
6. ✅ **Initial data load** → All 25 months
7. ✅ **Currency display** → Dual currency (RUB + USD)
8. ✅ **Anomaly alerts** → Yes, implement flagging system

### Questions Pending Customer Clarification:

1. ⏳ **Payment terms source** → Awaiting data source determination
2. ⏳ **Manager dimension** → Customer thinking about it
3. ✅ **USD Exchange Rates** → Resolved
   - **Source:** Any free reliable source (CBR API recommended)
   - **Method:** Period-average rates (monthly averages)
   - **Manual Input:** Allowed/disallowed via Settings toggle
   - Fetch historical rates programmatically
4. ✅ **Alert Thresholds** → Resolved
   - **Sales MoM:** >20% drop triggers alert
   - **Sales YoY:** >15% drop triggers alert
   - **Margin Compression:** >5 percentage points
   - **All thresholds:** Configurable in Settings
   - User can enable/disable specific alert types

### Immediate Next Steps:

1. **Review & Approve Functionality** (Current Phase)
   - Finalize Priority 1 requirements
   - Confirm database schema design
   - Agree on UI/UX approach

2. **Data Schema Design**
   - Design normalized database tables
   - Plan for future flexibility (expense breakdown, etc.)
   - Set up Supabase tables

3. **Import Pipeline Development**
   - Excel parser for 1C format
   - Hierarchical data extraction
   - Database insertion logic

4. **Analytics Implementation**
   - Margin calculation service
   - Filtering and aggregation
   - Time-series comparisons

5. **Dashboard UI**
   - Margin dashboard components
   - Multi-dimensional filters
   - Data visualization (charts, tables)

---

## Success Criteria

### Priority 1 Success:
- ✓ Import 1C sales data from Excel
- ✓ Calculate accurate margins per customer
- ✓ Show margin breakdown by categories within customer
- ✓ Enable multi-dimensional filtering (categories, managers, products, time)
- ✓ Compare time periods (MoM, QoQ, YoY) in single view
- ✓ Display profitability and efficiency metrics
- ✓ Outperform 1C "Sales Analysis" report limitations

### Priority 2 Success:
- ✓ Generate payment calendar (incoming + outgoing)
- ✓ Weekly and monthly views
- ✓ Cash flow forecasting
- ✓ Support scenario planning

### Priority 3 Success:
- ✓ Automate quarterly profit calculations
- ✓ Replace manual Excel process
- ✓ Intelligent cost allocation by category

---

## Timeline & Phasing

**Phase 1: Foundation (Priority 1 - Start)**
- Database schema
- Excel import pipeline
- Basic margin analytics
- Initial dashboard

**Phase 2: Enhancement (Priority 1 - Complete)**
- Multi-dimensional filtering
- Time-series comparisons
- Advanced analytics
- Profitability metrics

**Phase 3: Cash Flow (Priority 2)**
- Payment calendar
- Cash flow forecasting
- Scenario planning

**Phase 4: Profitability (Priority 3)**
- Cost allocation
- Profit by category
- Full automation

---

*Last Updated: 2026-02-19*
*Version: 0.1 - Initial Requirements*
