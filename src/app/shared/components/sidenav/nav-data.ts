// nav-data.ts
export const navbarData = [
  {
    label: 'Dashboard',
    routeLink: 'dashboard',
    icon: 'home',
    allowedPermissions: [],
  },
  {
    label: 'Pagina Web',
    routeLink: 'website/printers',
    allowedPermissions: ['canViewPrinter'],
    icon: 'public',
    isExpanded: false,
    subRoutes: [
      {
        label: 'Multifuncionales',
        routeLink: 'website/printers',
        allowedPermissions: ['canViewPrinter'],
      },
      {
        label: 'Consumibles',
        routeLink: 'website/consumibles',
        allowedPermissions: ['canViewConsumable'],
      },
      {
        label: 'Promociones',
        routeLink: 'website/deals',
        allowedPermissions: ['canViewDeal'],
      },
      {
        label: 'Paquetes de Renta',
        routeLink: 'website/packages',
        allowedPermissions: ['canViewPackage'],
      },
      {
        label: 'Configuracion',
        routeLink: 'website/config',
        allowedPermissions: ['canManageConfig'],
      },
    ],
  },
  {
    label: 'Ventas',
    routeLink: 'sales/sales',
    icon: 'storefront',
    allowedPermissions: ['canViewVentas'],
    isExpanded: false,
    subRoutes: [
      {
        label: 'Clientes Potenciales',
        routeLink: 'sales/leads',
        allowedPermissions: ['canViewLead'],
      },
      {
        label: 'Cotización',
        routeLink: 'sales/quote',
        allowedPermissions: ['canCreateQuote'],
      },
    ],
  },
  {
    label: 'Soporte',
    routeLink: 'support/tickets',
    icon: 'support_agent',
    allowedPermissions: ['canViewTicket'],
    isExpanded: false,
    subRoutes: [
      {
        label: 'Tickets',
        routeLink: 'support/tickets',
        allowedPermissions: ['canViewTicket'],
      },
      {
        label: 'Configuracion',
        routeLink: 'support/config',
        allowedPermissions: ['canManageSupportConfig'],
      },
    ],
  },
  {
    label: 'Chat',
    routeLink: 'chat/chat',
    icon: 'chat',
    allowedPermissions: ['canViewChat'],
    isExpanded: false,
    subRoutes: [
      {
        label: 'Chat',
        routeLink: 'chat/chats',
        allowedPermissions: ['canViewChat'],
      },
      {
        label: 'Chat en vivo',
        routeLink: 'chat/live-chat',
        allowedPermissions: ['canManageLiveChat'],
      },
      {
        label: 'Configuracion',
        routeLink: 'chat/config',
        allowedPermissions: ['canManageChatConfig'],
      },
    ],
  },
  {
    label: 'Usuarios',
    routeLink: 'users/user',
    allowedPermissions: ['canViewUser'],
    icon: 'group',
    isExpanded: false,
    subRoutes: [
      {
        label: 'Usuarios',
        routeLink: 'users/user',
        allowedPermissions: ['canViewUser'],
      },
      {
        label: 'Configuracion',
        routeLink: 'users/config',
        allowedPermissions: ['canManageUserConfig'],
      },
    ],
  },
];
