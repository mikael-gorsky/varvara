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
    IMPORT: ['MARKETPLACE REPORTS', 'PRICE LISTS', 'ACCOUNTING'],
    SETTINGS: ['INTERFACE DESIGN', 'THEME', 'LANGUAGE', 'USERS'],
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
    breadcrumbs.push({
      label: activeL1,
      onClick: onNavigateToL1,
    });
  }

  if (activeL2) {
    breadcrumbs.push({
      label: activeL2,
      onClick: () => {},
    });
  }

  return breadcrumbs;
}
