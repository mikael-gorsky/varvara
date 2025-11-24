export type Level1MenuItem =
  | 'DASHBOARD'
  | 'CHANNELS'
  | 'MOTIVATION'
  | 'FINANCE'
  | 'PRODUCTS'
  | 'PLAN'
  | 'IMPORT'
  | 'SETTINGS';

export interface MenuStructure {
  l1Items: Level1MenuItem[];
  l2Items: Record<Level1MenuItem, string[] | null>;
  l3Items?: Record<string, string[]>;
  disabledL2Items?: Record<Level1MenuItem, string[]>;
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
    CHANNELS: ['CUMULATIVE', 'OZON', 'WILDBERRIES', 'YANDEX', 'RESELLERS', 'TENDERS'],
    MOTIVATION: null,
    FINANCE: null,
    PRODUCTS: ['CATALOG', 'PERFORMANCE', 'INVENTORY', 'CATEGORIES'],
    PLAN: ['SALES PLANS', 'BUDGET', 'TARGETS', 'TIMELINE'],
    IMPORT: ['IMPORT OZON REPORTS', 'IMPORT WB REPORTS', 'IMPORT YANDEX.MARKET REPORTS', 'IMPORT OUR PRICE-LIST'],
    SETTINGS: ['INTERFACE DESIGN', 'THEME', 'LANGUAGE', 'USERS'],
  },
  l3Items: {
    OZON: ['COMPANIES', 'PRODUCTS', 'MARKETING'],
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
