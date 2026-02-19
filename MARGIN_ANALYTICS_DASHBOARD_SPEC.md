# Margin Analytics Dashboard - Specification

**Design System:** Clean minimal (black background, pink accent)
**Last Updated:** 2026-02-19

---

## Overview

Gross margin analytics dashboard for analyzing customer profitability from 1C accounting system data. Displays revenue, costs, and margins with multi-dimensional filtering, time comparisons, and anomaly detection.

**Primary Goal:** Answer "Which customers are most/least profitable?" with drill-down capabilities.

---

## Data Sources

### 1C Sales Analysis Export
- **Source:** Excel files (.xls format)
- **Update Frequency:** Monthly batch import
- **Historic Data:** Jan 2024 - present (25+ months)
- **Row Structure:** Hierarchical (Period → Category → Customer → Product)
- **Columns:**
  - Column A: Hierarchy level (Period/Category/Customer/Product)
  - Column F: Quantity (units)
  - Column G: Sales Amount (RUB)
  - Column H: Cost of Goods Sold (RUB)
  - Column I: Additional Expenses (RUB)

### Calculated Fields
```
Gross Revenue = Sales Amount (Column G)
Total COGS = COGS (Column H) + Additional Expenses (Column I)
Gross Margin = Gross Revenue - Total COGS
Margin % = (Gross Margin / Gross Revenue) × 100
```

---

## Page Layout

### Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────┐
│ MARGIN ANALYTICS (pink, 56px, uppercase, light)         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [KPI Grid - 4 columns]                                  │
│  Total Revenue  │  Total Margin  │  Margin %  │  Customers │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [Filter Bar - horizontal row]                           │
│  Period: [Dropdown] │ Category: [Dropdown] │ [Apply]    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [Customer List - 2/3 width]  │  [Details Panel - 1/3]   │
│  ┌──────────────────────┐    │  Selected: Customer A    │
│  │ 01  Customer Name    │    │  Revenue: 1.2M RUB      │
│  │     Category         │    │  Margin: 340K RUB       │
│  │     1.2M RUB (28.3%) │    │  Margin %: 28.3%        │
│  └──────────────────────┘    │                         │
│                              │  [Month-by-month chart]  │
│                              │  [Product breakdown]     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout (<1024px)

```
┌───────────────────────────┐
│ ☰  VARVARA              │ ← Fixed header
├───────────────────────────┤
│                           │
│ MARGIN ANALYTICS          │ ← Page title (32px pink)
│                           │
│ [KPI Cards - stacked]     │
│ ┌─────────────────────┐   │
│ │ TOTAL REVENUE       │   │
│ │ $1,234,567          │   │
│ └─────────────────────┘   │
│                           │
│ [Filter - vertical]       │
│ Period: [Jan 2026  ▼]     │
│ Category: [All ▼]         │
│ [Apply Filters]           │
│                           │
│ [Customer List]           │
│ ┌─────────────────────┐   │
│ │ 01  Customer A      │   │
│ │     Electronics     │   │
│ │     1.2M (28.3%)    │   │
│ └─────────────────────┘   │
│                           │
└───────────────────────────┘
```

---

## Component Specifications

### 1. Page Title

```tsx
<h2
  className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8"
  style={{ color: 'var(--accent)' }}
>
  MARGIN ANALYTICS
</h2>
```

**Styling:**
- Mobile: 32px, line-height 1.15, font-weight 300
- Desktop: 56px, line-height 1.1, font-weight 300
- Color: `#E91E63` (pink)
- Margin bottom: 32px

---

### 2. KPI Cards

**Grid Layout:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  {/* KPI cards */}
</div>
```

**Individual KPI Card:**
```tsx
<div
  className="p-6 min-h-[140px] flex flex-col justify-between"
  style={{ backgroundColor: 'var(--bg-secondary)' }}
>
  <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
    TOTAL REVENUE
  </p>
  <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
    $1,234,567
  </p>
  <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
    RUB 114.5M
  </p>
</div>
```

**KPI Metrics:**
1. **Total Revenue** - Sum of all sales (primary: USD, secondary: RUB)
2. **Total Margin** - Sum of all margins (primary: USD, secondary: RUB)
3. **Margin %** - Average margin percentage
4. **Active Customers** - Count of customers with sales in period

**Styling:**
- Background: `var(--bg-secondary)` (#0A0A0A)
- Padding: 24px
- Min height: 140px
- Label: 12px uppercase, gray-500, letter-spacing 0.06em
- Value: 32px, white, font-weight 400
- Secondary value: 10px uppercase, gray-500

---

### 3. Filter Bar

**Desktop (Horizontal):**
```tsx
<div
  className="p-6 mb-6 flex flex-wrap gap-4 items-end"
  style={{ backgroundColor: 'var(--bg-secondary)' }}
>
  <div className="flex-1 min-w-[200px]">
    <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
      PERIOD
    </p>
    <select
      className="w-full p-3 text-body bg-transparent border"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        borderColor: 'var(--divider-standard)',
        color: 'var(--text-primary)'
      }}
    >
      <option>Jan 2026</option>
      <option>Dec 2025</option>
    </select>
  </div>

  <div className="flex-1 min-w-[200px]">
    <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
      CATEGORY
    </p>
    <select className="w-full p-3 text-body bg-transparent border" style={{...}}>
      <option>All Categories</option>
    </select>
  </div>

  <button
    className="px-6 py-3 text-body uppercase transition-opacity hover:opacity-80"
    style={{ backgroundColor: '#E91E63', color: 'white' }}
  >
    Apply Filters
  </button>
</div>
```

**Mobile (Vertical):**
- Stack filters vertically (space-y-4)
- Full-width button

**Filters:**
1. **Period** - Dropdown (single month selection)
2. **Category** - Dropdown (All / specific category from 1C data)
3. **Compare To** - Optional dropdown (previous month, same month last year)
4. **Apply** button - Pink (#E91E63) background

---

### 4. Customer List (Main Content)

**Container:**
```tsx
<div className="p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
  <h3 className="text-section-title uppercase mb-6" style={{ color: 'var(--text-secondary)' }}>
    CUSTOMERS BY MARGIN
  </h3>
  <div className="space-y-4">
    {/* List items */}
  </div>
</div>
```

**List Item:**
```tsx
<div
  className="p-4 border-l-2 transition-colors duration-fast hover:bg-[var(--surface-1)] cursor-pointer"
  style={{
    backgroundColor: 'var(--bg-tertiary)',
    borderColor: '#E91E63'
  }}
  onClick={() => setSelectedCustomer(customer)}
>
  <div className="flex items-start gap-3">
    {/* Rank */}
    <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
      {String(index + 1).padStart(2, '0')}
    </span>

    <div className="flex-1 min-w-0">
      {/* Customer Name */}
      <p className="text-body mb-1" style={{ color: 'var(--text-primary)' }}>
        {customer.name}
      </p>

      {/* Category */}
      <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
        {customer.category}
      </p>

      {/* Metrics Row */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
            REVENUE
          </p>
          <p className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
            $42,350 <span style={{ color: 'var(--text-tertiary)' }}>RUB 3.9M</span>
          </p>
        </div>

        <div>
          <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
            MARGIN
          </p>
          <p className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
            $11,975 <span style={{ color: 'var(--text-tertiary)' }}>RUB 1.1M</span>
          </p>
        </div>

        <div>
          <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
            MARGIN %
          </p>
          <p className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
            28.3%
          </p>
        </div>
      </div>

      {/* Anomaly Alert (if detected) */}
      {customer.hasAnomaly && (
        <div className="mt-2 p-2 border-l-2" style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--status-warning)'
        }}>
          <p className="text-label-xs uppercase" style={{ color: 'var(--status-warning)' }}>
            ⚠ MARGIN DROP: -22% vs last month
          </p>
        </div>
      )}
    </div>
  </div>
</div>
```

**Features:**
- 2px pink border on left (`borderColor: '#E91E63'`)
- Hover effect: subtle background change
- Click to select → show details panel
- Ranked by margin (highest to lowest)
- Dual currency display (USD primary, RUB secondary in gray)
- Anomaly alerts inline (yellow border, warning icon)

**Sorting Options:**
- By Revenue (descending)
- By Margin RUB (descending) ← **Default**
- By Margin % (descending)
- Alphabetical (A-Z)

---

### 5. Details Panel (Desktop Right Side)

**Only shown on desktop when customer is selected**

```tsx
<div className="p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
  {/* Header */}
  <div className="mb-6">
    <h3 className="text-section-title uppercase mb-2" style={{ color: 'var(--text-primary)' }}>
      {selectedCustomer.name}
    </h3>
    <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
      {selectedCustomer.category}
    </p>
  </div>

  {/* Summary Metrics */}
  <div className="space-y-4 mb-6">
    <div className="p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <p className="text-label-xs uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
        REVENUE
      </p>
      <p className="text-kpi-value" style={{ color: 'var(--text-primary)' }}>
        $42,350
      </p>
      <p className="text-label-xs" style={{ color: 'var(--text-tertiary)' }}>
        RUB 3,906,946
      </p>
    </div>

    <div className="p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <p className="text-label-xs uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
        MARGIN
      </p>
      <p className="text-kpi-value" style={{ color: 'var(--text-primary)' }}>
        $11,975
      </p>
      <p className="text-label-xs" style={{ color: 'var(--text-tertiary)' }}>
        RUB 1,104,725 (28.3%)
      </p>
    </div>
  </div>

  {/* Month-by-Month Trend */}
  <div className="mb-6">
    <h4 className="text-label uppercase mb-3" style={{ color: 'var(--text-secondary)' }}>
      MARGIN TREND (6 MONTHS)
    </h4>
    {/* Simple line chart or sparkline */}
  </div>

  {/* Top Products */}
  <div>
    <h4 className="text-label uppercase mb-3" style={{ color: 'var(--text-secondary)' }}>
      TOP PRODUCTS
    </h4>
    <div className="space-y-2">
      {products.map((product, idx) => (
        <div
          key={idx}
          className="p-3 border-l-2"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: '#E91E63'
          }}
        >
          <p className="text-body-sm mb-1" style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </p>
          <p className="text-label-xs" style={{ color: 'var(--text-tertiary)' }}>
            {product.margin} ({product.marginPercent}%)
          </p>
        </div>
      ))}
    </div>
  </div>
</div>
```

**On Mobile:**
- Details panel becomes a full-screen modal/slide-up panel
- Shows when customer is tapped
- Close button to return to list

---

## Anomaly Detection

### Visual Indicators

**Warning Alert (Margin Drop ≥20% MoM or ≥15% YoY):**
```tsx
<div className="p-2 border-l-2" style={{
  backgroundColor: 'var(--bg-primary)',
  borderColor: 'var(--status-warning)'
}}>
  <p className="text-label-xs uppercase" style={{ color: 'var(--status-warning)' }}>
    ⚠ MARGIN DROP: -22% vs last month
  </p>
</div>
```

**Error Alert (Margin Compression ≥5pp):**
```tsx
<div className="p-2 border-l-2" style={{
  backgroundColor: 'var(--bg-primary)',
  borderColor: 'var(--status-error)'
}}>
  <p className="text-label-xs uppercase" style={{ color: 'var(--status-error)' }}>
    ⛔ MARGIN COMPRESSION: 28% → 22% (-6pp)
  </p>
</div>
```

**Placement:**
- Inline below metrics in customer list items
- At top of details panel if customer selected

---

## Currency Display

**Pattern:**
```tsx
// Primary (USD, larger, white)
<span style={{ color: 'var(--text-primary)' }}>$42,350</span>

// Secondary (RUB, smaller, gray)
<span className="text-label-xs" style={{ color: 'var(--text-tertiary)' }}>
  RUB 3,906,946
</span>
```

**Formatting:**
- USD: `$` prefix, thousands separator, no decimals (e.g., `$1,234,567`)
- RUB: `RUB` prefix, thousands separator, no decimals (e.g., `RUB 114,523,450`)
- Percentages: 1 decimal place (e.g., `28.3%`)

**Exchange Rate Note:**
- Display period-average exchange rate at top of page
- Example: "Exchange rate: 92.3 RUB/USD (Jan 2026 avg)"

---

## Responsive Behavior

### Breakpoints
- **Mobile:** < 1024px
- **Desktop:** ≥ 1024px

### Mobile Adaptations
1. **KPI Grid:** 1 column (stacked)
2. **Filter Bar:** Vertical layout, full-width dropdowns
3. **Customer List:** Full width (no details panel)
4. **Details Panel:** Becomes modal/slide-up overlay
5. **Typography:** Use mobile variants (`text-page-title-mobile`, etc.)

### Desktop Layout
1. **KPI Grid:** 4 columns
2. **Filter Bar:** Horizontal row
3. **Main Content:** 2/3 customer list + 1/3 details panel
4. **Typography:** Use desktop variants (`text-page-title-desktop`, etc.)

---

## Color Reference

```tsx
// Backgrounds
backgroundColor: 'var(--bg-primary)'    // #000000 - page background
backgroundColor: 'var(--bg-secondary)'  // #0A0A0A - section containers
backgroundColor: 'var(--bg-tertiary)'   // #141414 - list item backgrounds
backgroundColor: 'var(--bg-card)'       // #111111 - card backgrounds

// Text
color: 'var(--text-primary)'     // #FFFFFF - main text
color: 'var(--text-secondary)'   // #9CA3AF - section titles
color: 'var(--text-tertiary)'    // #6B7280 - labels, secondary info

// Accent
backgroundColor: '#E91E63'       // Pink - buttons, active states
borderColor: '#E91E63'           // Pink - border-left accents

// Status
borderColor: 'var(--status-warning)'  // #F59E0B - yellow warnings
borderColor: 'var(--status-error)'    // #EF4444 - red errors
```

---

## Data Update Strategy

### Import Process
1. **Manual Upload:** User uploads Excel file via Import module
2. **Parsing:** Extract period, category, customer, product hierarchy
3. **Calculation:** Compute margins using formula above
4. **Storage:** Store in Supabase tables (see Database Schema below)
5. **Currency Conversion:** Fetch period-average exchange rate from CBR API
6. **Anomaly Detection:** Calculate comparisons vs previous periods

### Database Tables (Preliminary)

**margin_analytics_data**
- id (uuid)
- period (date) - YYYY-MM-01 format
- category (text)
- customer_name (text)
- product_name (text)
- quantity (numeric)
- revenue_rub (numeric)
- cogs_rub (numeric)
- additional_expenses_rub (numeric)
- margin_rub (numeric) - calculated
- margin_percent (numeric) - calculated
- created_at (timestamp)

**exchange_rates**
- id (uuid)
- period (date) - YYYY-MM-01 format
- usd_rub (numeric) - average rate for period
- source (text) - 'CBR_API'
- fetched_at (timestamp)

---

## Critical Design Rules

### ✅ DO:
1. Use CSS variables for ALL colors
2. Use pink #E91E63 for accents, borders, active states
3. Use border-left-2 pattern for list items
4. Uppercase all labels with letter-spacing
5. Keep backgrounds simple (no gradients)
6. Use dual currency display (USD primary, RUB secondary)
7. Mobile-first responsive classes

### ❌ DON'T:
1. No gradients - solid colors only
2. No shadows (except minimal if absolutely needed)
3. No cyan/teal colors
4. No hardcoded colors - use CSS variables
5. No complex borders - keep simple
6. No small typography - prefer large readable text

---

*Last Updated: 2026-02-19*
*Design Reference: DESIGN_SYSTEM.md*
*Based on: FinanceModule.tsx patterns*
