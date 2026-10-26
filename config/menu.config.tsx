import { LayoutDashboard, Settings } from 'lucide-react';
import { type MenuConfig } from './types';

/**
 * The console's primary navigation configuration.
 *
 * Defines the navigation menu items displayed in the sidebar.
 * New business modules can register their route items here.
 */
export const MENU_SIDEBAR: MenuConfig = [
  { heading: 'Overview' },
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    permission: 'dashboard.view',
  },

  { heading: 'System' },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
    permission: 'settings.view',
  },
];
