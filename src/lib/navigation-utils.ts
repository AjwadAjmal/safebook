/**
 * Pure client navigation utilities for mapping routes and managing navigation state.
 */

const ROUTE_TITLE_MAP: Record<string, string> = {
  '/': 'Dashboard',
  '/accounts': 'Meine Konten',
  '/transactions/new': 'Neue Transaktion',
};

const DEFAULT_PAGE_TITLE = 'Dashboard';

/**
 * Returns the localized page title for a given pathname.
 *
 * @param pathname - The current URL pathname (e.g., '/', '/accounts', '/transactions/new')
 * @returns The localized page title
 */
export function getPageTitleByPathname(pathname?: string | null): string {
  if (!pathname) {
    return DEFAULT_PAGE_TITLE;
  }

  const normalized = pathname.replace(/\/+$/, '') || '/';
  return ROUTE_TITLE_MAP[normalized] || DEFAULT_PAGE_TITLE;
}
