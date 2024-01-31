export const navbarData = [
  {
    label: 'Dashboard',
    routeLink: 'dashboard',
    icon: 'fal fa-home',
    allowedRoles: ['admin', 'user', 'vendor'],
  },
  {
    label: 'Pagina Web',
    routeLink: 'website/printers',
    allowedRoles: ['admin', 'user', 'vendor'],
    icon: 'fal fa-globe',
    isExpanded: false,
    subRoutes: [
      {
        label: 'Multifuncionales',
        routeLink: 'website/printers',
        allowedRoles: ['admin', 'user', 'vendor'],
      },
      {
        label: 'Consumibles',
        routeLink: 'website/consumibles',
        allowedRoles: ['admin', 'user', 'vendor'],
      },
      {
        label: 'Promociones',
        routeLink: 'website/deals',
        allowedRoles: ['admin', 'user', 'vendor'],
      },
      {
        label: 'Paquetes',
        routeLink: 'website/packets',
        allowedRoles: ['admin', 'user', 'vendor'],
      },
    ],
  },
  {
    label: 'Usuarios',
    routeLink: 'dashboard/users',
    icon: 'fal fa-users',
    allowedRoles: ['admin'],
  },
  // {
  //   routeLink: 'dashboard/ventas',
  //   icon: 'fal fa-shopping-cart',
  //   label: 'Ventas',
  //   allowedRoles: ['admin', 'vendor'],
  // },
  // {
  //   routeLink: 'dashboard/inventario',
  //   icon: 'fal fa-boxes',
  //   label: 'Inventario',
  //   allowedRoles: ['admin', 'user', 'vendor'],
  // },
  // {
  //   routeLink: 'dashboard/chat',
  //   icon: 'fal fa-comments',
  //   label: 'Chat',
  //   allowedRoles: ['admin', 'user', 'vendor'],
  // },
  {
    label: 'Ajustes',
    routeLink: 'dashboard/settings',
    icon: 'fal fa-cog',
    allowedRoles: ['admin', 'user', 'vendor'],
  },
];
