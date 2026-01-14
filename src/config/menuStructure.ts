export type Level1MenuItem =
  | 'DASHBOARD'
  | 'CHANNELS'
  | 'MOTIVATION'
  | 'FINANCE'
  | 'PRODUCTS'
  | 'PLAN'
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
    'CHANNELS',
    'MOTIVATION',
    'FINANCE',
    'PRODUCTS',
    'PLAN',
    'IMPORT',
    'SETTINGS',
  ],
  l2Items: {
    DASHBOARD: null,
    CHANNELS: ['OZON', 'WILDBERRIES', 'COMUS', 'DNS', 'MERLION', 'EBURG', 'SARATOV'],
    MOTIVATION: null,
    FINANCE: null,
    PRODUCTS: ['CATALOG', 'PERFORMANCE', 'INVENTORY', 'CATEGORIES'],
    PLAN: ['SALES PLANS', 'BUDGET', 'TARGETS', 'TIMELINE'],
    IMPORT: ['IMPORT OZON REPORTS', 'IMPORT WB REPORTS', 'IMPORT YANDEX.MARKET REPORTS', 'IMPORT OUR PRICE-LIST'],
    SETTINGS: ['INTERFACE DESIGN', 'THEME', 'LANGUAGE', 'USERS'],
  },
  l3Items: {
    OZON: ['COMPANIES', 'CATEGORIES', 'MARKETING'],
  },
  disabledL2Items: {
    DASHBOARD: [],
    CHANNELS: [],
    MOTIVATION: [],
    FINANCE: [],
    PRODUCTS: [],
    PLAN: [],
    IMPORT: ['IMPORT WB REPORTS', 'IMPORT YANDEX.MARKET REPORTS', 'IMPORT OUR PRICE-LIST'],
    SETTINGS: [],
  },
  tileGroups: {
    DASHBOARD: [],
    CHANNELS: [
      { category: 'MARKETPLACES', items: ['OZON', 'WILDBERRIES'] },
      { category: 'RETAIL', items: ['COMUS', 'DNS', 'MERLION'] },
      { category: 'REGIONS', items: ['EBURG', 'SARATOV'] },
    ],
    MOTIVATION: [],
    FINANCE: [],
    PRODUCTS: [
      { category: 'INVENTORY', items: ['CATALOG', 'INVENTORY'] },
      { category: 'ANALYTICS', items: ['PERFORMANCE', 'CATEGORIES'] },
    ],
    PLAN: [
      { category: 'PLANNING', items: ['SALES PLANS', 'BUDGET', 'TARGETS', 'TIMELINE'] },
    ],
    IMPORT: [
      { category: 'DATA IMPORT', items: ['IMPORT OZON REPORTS', 'IMPORT WB REPORTS', 'IMPORT YANDEX.MARKET REPORTS', 'IMPORT OUR PRICE-LIST'] },
    ],
    SETTINGS: [
      { category: 'PREFERENCES', items: ['INTERFACE DESIGN', 'THEME', 'LANGUAGE', 'USERS'] },
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
