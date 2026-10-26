import { type LucideIcon } from 'lucide-react';

/**
 * One entry in the sidebar.
 *
 * `heading` marks a section label (OVERVIEW, CATALOG, …) rather than a link —
 * it carries no path and renders as small caps above the group that follows.
 */
export interface MenuItem {
  /**
   * What a viewer must hold to be offered this. Absent means everyone.
   *
   * Presentation only — the server refuses the page's data regardless. This
   * just stops the console pointing at doors it knows are locked.
   */
  permission?: import('@/lib/admin/permissions').Permission;
  title?: string;
  heading?: string;
  icon?: LucideIcon | string;
  path?: string;
  /**
   * Extra paths that should light this item up. A detail or create route
   * (`/products/new`) is matched by prefix on `path` already; this is for the
   * cases where the routes do not share a prefix.
   */
  match?: string[];
  children?: MenuItem[];
  disabled?: boolean;
  badge?: string;
}

export type MenuConfig = MenuItem[];

export interface LayoutSettings {
  sidebarCollapse?: boolean;
  sidebarTheme?: 'light' | 'dark';
  headerSticky?: boolean;
  headerStickyOffset?: number;
}

export interface Settings {
  layout: string;
  container: 'fixed' | 'fluid';
  layouts: Record<string, LayoutSettings>;
}
