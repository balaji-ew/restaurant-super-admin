import {
  Building2,
  CircleAlert,
  MapPin,
  Settings,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';
import { type MenuConfig } from './types';

/**
 * The console's primary navigation configuration.
 *
 * Defines the navigation menu items displayed in the sidebar.
 * New business modules can register their route items here.
 */
export const MENU_SIDEBAR: MenuConfig = [
  { heading: 'System' },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
    permission: 'settings.view',
  },

  { heading: 'Management' },
  {
    title: 'Country',
    icon: MapPin,
    path: '/country',
  },
  {
    title: 'Feature',
    icon: Sparkles,
    path: '/feature',
  },
  {
    title: 'Business Management',
    icon: Building2,
    path: '/business-management',
  },
  {
    title: 'Outlet Management',
    icon: Store,
    path: '/outlet-management',
  },
  {
    title: 'User Management',
    icon: Users,
    path: '/user-management',
  },
  {
    title: 'Issue Tracking',
    icon: CircleAlert,
    path: '/issue-tracking',
  },
];
