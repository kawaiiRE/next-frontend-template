import { APP_ROUTES } from '@/constants/routes';

export type AppNavIcon = 'dashboard' | 'notes' | 'profile' | 'settings';
export type AppNavLabel = 'dashboard' | 'notes' | 'profile' | 'settings';

export interface AppNavItem {
  href: string;
  label: AppNavLabel;
  icon: AppNavIcon;
}

export interface AppNavSection {
  label: 'workspace' | 'account';
  items: readonly AppNavItem[];
}

/** Sidebar structure; labels are keys in the `nav` message namespace. */
export const APP_NAVIGATION: readonly AppNavSection[] = [
  {
    label: 'workspace',
    items: [
      { href: APP_ROUTES.dashboard, label: 'dashboard', icon: 'dashboard' },
      { href: APP_ROUTES.notes, label: 'notes', icon: 'notes' },
    ],
  },
  {
    label: 'account',
    items: [
      { href: APP_ROUTES.profile, label: 'profile', icon: 'profile' },
      { href: APP_ROUTES.settings, label: 'settings', icon: 'settings' },
    ],
  },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type BreadcrumbKey =
  'dashboard' | 'notes' | 'newNote' | 'note' | 'editNote' | 'profile' | 'settings';

export interface BreadcrumbItem {
  key: BreadcrumbKey;
  href: string;
}

/** Derives breadcrumbs from the authenticated area's URL structure. */
export function breadcrumbsFor(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const [first, second, third] = segments;

  switch (first) {
    case 'dashboard':
      return [{ key: 'dashboard', href: APP_ROUTES.dashboard }];
    case 'profile':
      return [{ key: 'profile', href: APP_ROUTES.profile }];
    case 'settings':
      return [{ key: 'settings', href: APP_ROUTES.settings }];
    case 'notes': {
      const crumbs: BreadcrumbItem[] = [{ key: 'notes', href: APP_ROUTES.notes }];
      if (second === 'new') crumbs.push({ key: 'newNote', href: APP_ROUTES.newNote });
      else if (second) {
        crumbs.push({ key: 'note', href: APP_ROUTES.note(second) });
        if (third === 'edit') crumbs.push({ key: 'editNote', href: APP_ROUTES.editNote(second) });
      }
      return crumbs;
    }
    default:
      return [];
  }
}
