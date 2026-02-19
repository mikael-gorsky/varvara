export type Level1MenuItem =
  | 'DASHBOARD'
  | 'CUSTOMERS'
  | 'MOTIVATION'
  | 'FINANCE'
  | 'PRODUCTS'
  | 'INVENTORY'
  | 'TARGETS'
  | 'IMPORT'
  | 'SETTINGS';

export interface TileGroup {
  category: string;
  items: string[];
}

export interface MenuStructure {
  l1Items: Level1MenuItem[];
  l2Items: Record<Level1MenuItem, string[] | null>;
  l3Items?: Record<string, string[]>;
  disabledL2Items?: Record<Level1MenuItem, string[]>;
  tileGroups?: Record<Level1MenuItem, TileGroup[]>;
}

export const menuStructure: MenuStructure = {
  l1Items: [
    'DASHBOARD',
    'CUSTOMERS',
    'MOTIVATION',
    'FINANCE',
    'PRODUCTS',
    'INVENTORY',
    'TARGETS',
    'IMPORT',
    'SETTINGS',
  ],
  l2Items: {
    DASHBOARD: null,
    CUSTOMERS: ['OZON', 'WILDBERRIES', 'COMUS', 'DNS', 'MERLION', 'EBURG', 'SARATOV'],
    MOTIVATION: null,
    FINANCE: ['MARGINS', 'PROFITS', 'CALENDAR'],
    PRODUCTS: ['CATALOG', 'PERFORMANCE', 'CATEGORIES'],
    INVENTORY: ['STOCK LEVELS', 'ABC ANALYSIS', 'AGING ALERTS', 'REORDER PLANNING'],
    TARGETS: ['SALES PLANS', 'BUDGET', 'TIMELINE'],
    IMPORT: ['IMPORT SALES-MARGIN REPORT', 'IMPORT INVENTORY SNAPSHOT', 'IMPORT ABC CLASSIFICATION', 'IMPORT PROCUREMENT DATA', 'IMPORT OZON REPORTS', 'IMPORT WB REPORTS', 'IMPORT YANDEX.MARKET REPORTS', 'IMPORT OUR PRICE-LIST'],
    SETTINGS: ['INTERFACE DESIGN', 'THEME', 'EXCHANGE RATE', 'INVENTORY SETTINGS', 'LANGUAGE', 'USERS'],
  },
  l3Items: {
    OZON: ['COMPANIES', 'CATEGORIES', 'MARKETING'],
  },
  disabledL2Items: {
    CUSTOMERS: [],
    MOTIVATION: [],
    FINANCE: ['PROFITS', 'CALENDAR'],
    PRODUCTS: [],
    INVENTORY: ['ABC ANALYSIS', 'AGING ALERTS', 'REORDER PLANNING'],
    TARGETS: [],
    IMPORT: ['IMPORT ABC CLASSIFICATION', 'IMPORT PROCUREMENT DATA', 'IMPORT WB REPORTS', 'IMPORT YANDEX.MARKET REPORTS', 'IMPORT OUR PRICE-LIST'],
    SETTINGS: ['INVENTORY SETTINGS'],
  },
  tileGroups: {
    CUSTOMERS: [
      { category: 'MARKETPLACES', items: ['OZON', 'WILDBERRIES'] },
      { category: 'RETAIL', items: ['COMUS', 'DNS', 'MERLION'] },
      { category: 'REGIONS', items: ['EBURG', 'SARATOV'] },
    ],
    MOTIVATION: [],
    FINANCE: [
      { category: 'FINANCIAL ANALYTICS', items: ['MARGINS', 'PROFITS', 'CALENDAR'] },
    ],
    PRODUCTS: [
      { category: 'CATALOG', items: ['CATALOG', 'CATEGORIES'] },
      { category: 'ANALYTICS', items: ['PERFORMANCE'] },
    ],
    INVENTORY: [
      { category: 'INVENTORY ANALYTICS', items: ['STOCK LEVELS', 'ABC ANALYSIS', 'AGING ALERTS', 'REORDER PLANNING'] },
    ],
    TARGETS: [
      { category: 'PLANNING', items: ['SALES PLANS', 'BUDGET', 'TIMELINE'] },
    ],
    IMPORT: [
      { category: 'SALES & MARGIN', items: ['IMPORT SALES-MARGIN REPORT'] },
      { category: 'INVENTORY', items: ['IMPORT INVENTORY SNAPSHOT', 'IMPORT ABC CLASSIFICATION', 'IMPORT PROCUREMENT DATA'] },
      { category: 'MARKETPLACES', items: ['IMPORT OZON REPORTS', 'IMPORT WB REPORTS', 'IMPORT YANDEX.MARKET REPORTS', 'IMPORT OUR PRICE-LIST'] },
    ],
    SETTINGS: [
      { category: 'PREFERENCES', items: ['INTERFACE DESIGN', 'THEME', 'EXCHANGE RATE', 'LANGUAGE', 'USERS'] },
    ],
  },
};

export interface BreadcrumbItem {
  label: string;
  onClick: () => void;
}

export function buildBreadcrumbs(
  activeL1: Level1MenuItem | null,
  activeL2: string | null,
  onNavigateToMain: () => void,
  onNavigateToL1: () => void
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];

  breadcrumbs.push({
    label: 'MAIN',
    onClick: onNavigateToMain,
  });

  if (activeL1) {
    const hasL2Submenu = menuStructure.l2Items[activeL1] !== null;

    if (hasL2Submenu && !activeL2) {
      breadcrumbs.push({
        label: activeL1,
        onClick: () => {},
      });
    } else {
      breadcrumbs.push({
        label: activeL1,
        onClick: onNavigateToL1,
      });
    }
  }

  if (activeL2) {
    breadcrumbs.push({
      label: activeL2,
      onClick: () => {},
    });
  }

  return breadcrumbs;
}
