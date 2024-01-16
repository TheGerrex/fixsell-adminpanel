export const navbarData = [
  {
    routeLink: 'dashboard/intro-screen',
    icon: 'fal fa-home',
    label: 'Dashboard',
    allowedRoles: ['admin', 'user', 'vendor'],
  },
  {
    routeLink: 'dashboard/printerscrud',
    icon: 'fal fa-tasks',
    label: 'Printers',
    allowedRoles: ['admin', 'user', 'vendor'],
  },
  {
    routeLink: 'website/printers/create',
    icon: 'fal fa-tasks',
    label: 'Website Printers',
    allowedRoles: ['admin', 'user', 'vendor'],
  },
  {
    routeLink: 'dashboard/users',
    icon: 'fal fa-users',
    label: 'Users',
    allowedRoles: ['admin'],
  },
  {
    routeLink: 'dashboard/ventas',
    icon: 'fal fa-shopping-cart',
    label: 'Ventas',
    allowedRoles: ['admin', 'vendor'],
  },
  {
    routeLink: 'dashboard/inventario',
    icon: 'fal fa-boxes',
    label: 'Inventario',
    allowedRoles: ['admin', 'user', 'vendor'],
  },
  {
    routeLink: 'dashboard/chat',
    icon: 'fal fa-comments',
    label: 'Chat',
    allowedRoles: ['admin', 'user', 'vendor'],
  },
  {
    routeLink: 'dashboard/settings',
    icon: 'fal fa-cog',
    label: 'Settings',
    allowedRoles: ['admin', 'user', 'vendor'],
  },
];
