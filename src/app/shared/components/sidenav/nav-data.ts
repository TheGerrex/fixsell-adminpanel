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
        routeLink: 'website/packages',
        allowedRoles: ['admin', 'user', 'vendor'],
      },
      {
        label: 'Configuracion',
        routeLink: 'website/config',
        allowedRoles: ['admin', 'user', 'vendor'],
      },
    ],
  },
  // sales, subroutes: clientes potenciales
  {
    label: 'Ventas',
    routeLink: 'sales/sales',
    icon: 'fal fa-shopping-cart',
    allowedRoles: ['admin', 'vendor'],
    isExpanded: false,
    subRoutes: [
      {
        label: 'Clientes Potenciales',
        routeLink: 'sales/leads',
        allowedRoles: ['admin', 'vendor'],
      },
      // Cotización
      {
        label: 'Cotización',
        routeLink: 'sales/quote',
        allowedRoles: ['admin', 'vendor'],
      },
    ],
  },
  // tickets
  {
    label: 'Soporte',
    routeLink: 'support/tickets',
    icon: 'fal fa-headset',
    allowedRoles: ['admin', 'user', 'vendor'],
    isExpanded: false,
    subRoutes: [
      {
        label: 'Tickets',
        routeLink: 'support/tickets',
        allowedRoles: ['admin', 'user', 'vendor'],
      },
      {
        label: 'Configuracion',
        routeLink: 'support/config',
        allowedRoles: ['admin', 'user', 'vendor'],
      },
    ],
  },
  {
    label: 'Usuarios',
    routeLink: 'users/user',
    allowedRoles: ['admin', 'user', 'vendor'],
    icon: 'fal fa-users',
    isExpanded: false,
    subRoutes: [
      {
        label: 'Usuarios',
        routeLink: 'users/user',
        allowedRoles: ['admin', 'user', 'vendor'],
      },
      {
        label: 'Configuracion',
        routeLink: 'users/config',
        allowedRoles: ['admin', 'user', 'vendor'],
      },
    ],
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
