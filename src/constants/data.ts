import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [], // Empty array as there are no child items for Dashboard
    roles: ['OWNER'] // All roles can access Dashboard
  },
  {
    title: 'Subscriptions',
    url: '/dashboard/subscription',
    icon: 'subscriptions',
    isActive: false,
    shortcut: ['s', 's'],
    items: [], // Empty array as there are no child items for Subscriptions
    roles: ['SUPERADMIN'] // Only SUPERADMIN and OWNER can manage subscriptions
  },
  {
    title: 'Clients',
    url: '/dashboard/clients',
    icon: 'clients',
    isActive: false,
    shortcut: ['c', 'c'],
    items: [], // Empty array as there are no child items for Clients
    roles: ['SUPERADMIN'] // All roles can view clients
  },
  {
    title: 'Locations',
    url: '/dashboard/locations',
    icon: 'location',
    isActive: false,
    shortcut: ['l', 'l'],
    items: [], // Empty array as there are no child items for Locations
    roles: ['OWNER'] // Only OWNER can view locations
  },
  {
    title: 'Members',
    url: '/dashboard/members',
    icon: 'users2',
    isActive: false,
    shortcut: ['m', 'm'],
    items: [], // Empty array as there are no child items for Members
    roles: ['OWNER'] // Only OWNER can view members
  },
  {
    title: 'Equipment',
    url: '/dashboard/equipments',
    icon: 'equipment',
    isActive: false,
    shortcut: ['e', 'e'],
    items: [], // Empty array as there are no child items for Equipment
    roles: ['OWNER'] // Only OWNER can view equipment
  },
  {
    title: 'Todos',
    url: '/dashboard/todos',
    icon: 'todo',
    isActive: false,
    shortcut: ['t', 't'],
    items: [], // Empty array as there are no child items for Equipment
    roles: ['OWNER'] // Only OWNER can view equipment
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
