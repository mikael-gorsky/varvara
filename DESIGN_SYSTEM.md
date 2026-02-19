# VARVARA Design System (ACTUAL)

**Extracted from deployed app and actual codebase**

## Design Philosophy

**Minimal. Clean. Simple.**

- Pure black background
- Pink accent color
- Large, readable typography
- No gradients, no glows, no complexity
- CSS variables for theming
- Mobile-first responsive

---

## Color System

### Primary Colors

All colors use **CSS variables** for easy theming:

```css
/* Backgrounds */
--bg-primary: #000000        /* Pure black */
--bg-secondary: #0A0A0A      /* Slightly lighter */
--bg-tertiary: #141414       /* Card backgrounds */
--bg-elevated: #1A1A1A       /* Elevated elements */
--bg-card: #111111           /* Card backgrounds */

/* Text */
--text-primary: #FFFFFF      /* Primary text (white) */
--text-secondary: #9CA3AF    /* Secondary text (gray-400) */
--text-tertiary: #6B7280     /* Tertiary text (gray-500) */
--text-disabled: #4B5563     /* Disabled state (gray-600) */

/* Accent */
--accent: #E91E63            /* Pink (main brand color) */
--accent-hover: #F06292      /* Lighter pink */
--accent-pressed: #C2185B    /* Darker pink */

/* Status */
--status-connected: #10B981   /* Green (emerald-500) */
--status-warning: #F59E0B     /* Amber */
--status-error: #EF4444       /* Red */

/* Dividers */
--divider-standard: rgba(255, 255, 255, 0.12)  /* Light divider */
--divider-strong: rgba(255, 255, 255, 0.2)     /* Stronger divider */
```

### Usage in Code

```tsx
// Always use CSS variables
<div style={{ backgroundColor: 'var(--bg-secondary)' }}>
  <p style={{ color: 'var(--text-primary)' }}>Text</p>
</div>

// For accent, use direct pink
<div style={{ borderColor: '#E91E63' }}>
```

---

## Typography

### Font Family

**Primary:** Inter (sans-serif)

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Helvetica Neue', Arial, sans-serif;
```

### Tailwind Typography Classes

All defined in `tailwind.config.js`:

```css
/* Page Titles */
text-page-title: 48px / 1.1 / 300 (light)
text-page-title-mobile: 32px / 1.15 / 300
text-page-title-desktop: 56px / 1.1 / 300

/* Menu Items (Large) */
text-menu-mobile: 48px / 1.3 / 300
text-menu-desktop: 36px / 1.4 / 300
text-menu-mobile-active: 48px / 1.3 / 600 (semibold when active)
text-menu-desktop-active: 36px / 1.4 / 600

/* Section Titles */
text-section-title: 24px / 1.2 / 400

/* KPI Values */
text-kpi-value: 32px / 1.1 / 400
text-kpi-value-lg: 48px / 1.1 / 300

/* Labels (Uppercase, tracked) */
text-label-xs: 10px / 1.4 / 500 / letter-spacing: 0.1em
text-label-sm: 11px / 1.4 / 500 / letter-spacing: 0.08em
text-label: 12px / 1.4 / 500 / letter-spacing: 0.06em

/* Body Text */
text-body-sm: 14px / 1.5 / 400
text-body: 16px / 1.5 / 400
text-body-lg: 18px / 1.5 / 400

/* Logo */
text-logo: 18px / 1 / 500 / letter-spacing: 0.15em
```

### Typography Patterns

```tsx
// Page title
<h2 className="text-page-title-mobile md:text-page-title-desktop uppercase"
    style={{ color: 'var(--accent)' }}>
  FINANCE
</h2>

// Labels (always uppercase)
<p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
  CURRENT PERIOD
</p>

// KPI value
<p className="text-kpi-value" style={{ color: 'var(--text-primary)' }}>
  $124.5k
</p>

// Body text
<p className="text-body" style={{ color: 'var(--text-primary)' }}>
  Normal content
</p>
```

---

## Spacing System

From `tailwind.config.js`:

```css
0.5: 4px
1:   8px
2:   16px
3:   24px
4:   32px
5:   40px
6:   48px
8:   64px
10:  80px
12:  96px
sidebar: 400px
```

**Common Patterns:**
- Card padding: `p-6` (24px) or `p-4` (16px)
- Section gaps: `space-y-6` (24px vertical)
- Grid gaps: `gap-4` (16px)

---

## Component Patterns

### 1. KPI Card (Simple)

```tsx
<div
  className="p-6 min-h-[140px] flex flex-col justify-between"
  style={{ backgroundColor: 'var(--bg-secondary)' }}
>
  <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
    CURRENT PERIOD
  </p>
  <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
    $3,906,946
  </p>
</div>
```

**Features:**
- Simple background (no gradient)
- Uppercase label
- Large value
- Vertical flex layout
- Minimum height for consistency

### 2. List Item with Border-Left Accent

```tsx
<div
  className="p-4 border-l-2 transition-colors duration-fast hover:bg-[var(--surface-1)]"
  style={{
    backgroundColor: 'var(--bg-tertiary)',
    borderColor: '#E91E63'  // Pink accent
  }}
>
  <div className="flex items-start gap-3">
    <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
      01
    </span>
    <div className="flex-1">
      <p className="text-body" style={{ color: 'var(--text-primary)' }}>
        Item Name
      </p>
      <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
        CATEGORY
      </p>
    </div>
  </div>
</div>
```

**Features:**
- 2px pink border on left
- Simple background
- Number/rank on left
- Hover effect (subtle)
- Clean layout

### 3. Section Container

```tsx
<div className="p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
  <h3 className="text-subsection uppercase mb-6" style={{ color: 'var(--text-secondary)' }}>
    TOP CLIENTS
  </h3>
  <div className="space-y-4">
    {/* List items */}
  </div>
</div>
```

### 4. Metric Card (Dashboard)

```tsx
<div
  className="p-4 lg:p-5 flex flex-col h-full"
  style={{ backgroundColor: 'var(--bg-card)' }}
>
  <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
    REVENUE
  </p>
  <p className="text-kpi-value mb-3" style={{ color: 'var(--text-primary)' }}>
    $124.5k
  </p>
  <div className="mt-auto">
    {/* Chart component */}
  </div>
</div>
```

### 5. Navigation Menu Item

```tsx
<button
  className={`
    block w-full text-left py-2 transition-colors
    ${isActive ? 'text-menu-desktop-active' : 'text-menu-desktop'}
  `}
  style={{
    color: isActive ? '#E91E63' : 'var(--text-tertiary)',
  }}
>
  {item.toLowerCase()}
</button>
```

**Features:**
- Pink when active
- Gray when inactive
- Large typography
- Lowercase text
- Simple hover transition

### 6. Mobile Header

```tsx
<header
  className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3"
  style={{ backgroundColor: 'var(--bg-primary)' }}
>
  <button onClick={() => setMenuOpen(true)}>
    <Menu size={24} />
  </button>

  <span className="text-logo uppercase" style={{ color: 'var(--text-primary)' }}>
    VARVARA
  </span>

  <div className="w-10" /> {/* Spacer for centering */}
</header>
```

### 7. Category Tile (Large Pink)

```tsx
<button
  className="flex items-end p-6 transition-all hover:opacity-90"
  style={{
    backgroundColor: '#E91E63',  // Full pink background
    width: '280px',
    height: '180px',
  }}
>
  <span className="text-2xl font-medium uppercase" style={{ color: 'white' }}>
    CATEGORY NAME
  </span>
</button>
```

### 8. Subcategory Tile

```tsx
<button
  className="flex flex-col justify-end p-4 transition-all border hover:opacity-80"
  style={{
    backgroundColor: 'var(--bg-tertiary)',
    borderColor: 'var(--divider-standard)',
    width: '160px',
    height: '180px',
  }}
>
  <span className="text-body-lg font-medium uppercase" style={{ color: 'var(--text-primary)' }}>
    SUBCATEGORY
  </span>
</button>
```

---

## Layout Patterns

### Desktop Layout

```tsx
<div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
  {/* Sidebar (400px fixed) */}
  <aside className="fixed left-0 top-0 bottom-0 w-sidebar">
    {/* Navigation */}
  </aside>

  {/* Main content */}
  <main className="pl-sidebar p-8">
    {/* Content */}
  </main>
</div>
```

### Mobile Layout

```tsx
{/* Fixed header */}
<header className="fixed top-0 left-0 right-0 z-30">
  {/* Menu button + Logo */}
</header>

{/* Scrollable content */}
<main className="pt-16 pb-20">
  {/* Content */}
</main>

{/* Bottom tabs (if needed) */}
<nav className="fixed bottom-0 left-0 right-0">
  {/* Tab bar */}
</nav>
```

### Grid Layouts

```tsx
{/* 4-column KPI grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* KPI cards */}
</div>

{/* 2-column section grid */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Sections */}
</div>
```

---

## Border Radius

From `tailwind.config.js`:

```css
none: 0px
DEFAULT: 0px       /* No radius by default */
sm: 4px
md: 8px
lg: 12px
```

**Usage:**
- Most elements: No border radius
- Some cards: `rounded` (4px) or `rounded-lg` (8px-12px)
- Generally sharp, minimal aesthetic

---

## Shadows

**Minimal shadows - rarely used**

```css
shadow-card: 0 1px 3px rgba(0, 0, 0, 0.1)
shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.15)
```

**Prefer no shadows** - keep it flat and clean

---

## Transitions

From `tailwind.config.js`:

```css
instant: 100ms
fast: 150ms
normal: 200ms
slow: 300ms
```

**Common usage:**
```tsx
className="transition-colors duration-fast"
```

---

## Responsive Breakpoints

```css
xs:  375px
sm:  640px
md:  768px
lg:  1024px   /* Main breakpoint - desktop sidebar appears */
xl:  1280px
2xl: 1440px
```

**Mobile-first approach:**
```tsx
className="text-menu-mobile md:text-menu-desktop"
className="grid-cols-1 lg:grid-cols-2"
```

---

## Icons

**Library:** Lucide React

**Common icons:**
- Menu, User, Settings, Upload, Download
- Check, X, Info, Alert
- ChevronRight, ChevronDown, ArrowLeft
- BarChart, TrendingUp, Package

**Sizing:**
- Small: 16px (w-4 h-4)
- Medium: 20px (w-5 h-5)
- Large: 24px (w-6 h-6)

**Usage:**
```tsx
import { Menu, User } from 'lucide-react';

<Menu size={24} style={{ color: 'var(--text-primary)' }} />
```

---

## States

### Hover

```tsx
className="hover:opacity-80 transition-opacity"
// or
className="hover:bg-[var(--surface-1)] transition-colors"
```

### Active/Selected

```tsx
// Pink accent for active items
style={{ color: isActive ? '#E91E63' : 'var(--text-tertiary)' }}
```

### Disabled

```tsx
disabled={true}
style={{ color: 'var(--text-disabled)' }}
className="opacity-50 cursor-not-allowed"
```

### Loading

```tsx
// Simple text
<p style={{ color: 'var(--text-tertiary)' }}>Loading...</p>

// Or minimal spinner (if needed)
<div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
```

---

## Critical Rules

### ✅ DO:

1. **Always use CSS variables** for colors (`var(--bg-primary)`)
2. **Use pink #E91E63** for accents, active states, highlights
3. **Uppercase all labels** with letter-spacing
4. **Keep backgrounds simple** - no gradients
5. **Use border-left accent** (2px pink) for list items
6. **Mobile-first classes** (base class = mobile, lg: = desktop)
7. **Minimal styling** - resist adding complexity
8. **Large typography** for menus and titles
9. **Clean spacing** using the spacing scale

### ❌ DON'T:

1. **No gradients** - solid colors only
2. **No glows or shadows** (except minimal card shadow if needed)
3. **No cyan/teal colors** - that was old design
4. **No complex borders** - keep it simple
5. **No monospace fonts** (that was old design)
6. **No "Imperial" or sci-fi styling**
7. **No hardcoded colors** - use CSS variables
8. **No small typography** - prefer large, readable text
9. **No rounded corners** unless specifically needed (default is 0px)

---

## Example: Full Component

```tsx
import React from 'react';

const ExampleModule: React.FC = () => {
  return (
    <div>
      {/* Page title */}
      <h2
        className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8"
        style={{ color: 'var(--accent)' }}
      >
        EXAMPLE
      </h2>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          className="p-6 min-h-[140px] flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
            METRIC
          </p>
          <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
            $124.5k
          </p>
        </div>
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h3 className="text-subsection uppercase mb-6" style={{ color: 'var(--text-secondary)' }}>
            SECTION TITLE
          </h3>
          <div className="space-y-4">
            {/* List items */}
            <div
              className="p-4 border-l-2 transition-colors duration-fast"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: '#E91E63'
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
                  01
                </span>
                <div className="flex-1">
                  <p className="text-body" style={{ color: 'var(--text-primary)' }}>
                    Item Name
                  </p>
                  <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
                    CATEGORY
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleModule;
```

---

*Last Updated: 2026-02-19*
*Source: Actual deployed Varvara app*
*Files: FinanceModule.tsx, Dashboard.tsx, MetricCard.tsx, AppLayout.tsx*
