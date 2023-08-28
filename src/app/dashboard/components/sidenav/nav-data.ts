export const navbarData = [
  {
    routeLink: 'intro-screen',
    icon: 'fal fa-home',
    label: 'Dashboard',
    allowedRoles: ['admin', 'user', 'vendor'],
  },
  {
    routeLink: 'printerscrud',
    icon: 'fal fa-tasks',
    label: 'Printers',
    allowedRoles: ['admin', 'user', 'vendor'],
  },
  {
    routeLink: 'users',
    icon: 'fal fa-users',
    label: 'Users',
    allowedRoles: ['admin'],
  },
  {
    routeLink: 'ventas',
    icon: 'fal fa-shopping-cart',
    label: 'Ventas',
    allowedRoles: ['admin', 'vendor'],
  },
  {
    routeLink: 'inventario',
    icon: 'fal fa-boxes',
    label: 'Inventario',
    allowedRoles: ['admin', 'user', 'vendor'],
  },
  {
    routeLink: 'chat',
    icon: 'fal fa-comments',
    label: 'Chat',
    allowedRoles: ['admin', 'user', 'vendor'],
  },
  {
    routeLink: 'settings',
    icon: 'fal fa-cog',
    label: 'Settings',
    allowedRoles: ['admin', 'user', 'vendor'],
  },
];
