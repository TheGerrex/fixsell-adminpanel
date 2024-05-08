import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private roles: { [key: string]: string[] } = {
    '/website/printers': ['admin', 'user'],
    '/website/printers/create': ['admin', 'user', 'vendor'],
    '/website/printers/*': ['admin', 'user', 'vendor'],
    '/website/printers/*/edit': ['admin', 'user', 'vendor'],
    '/website/deals': ['admin', 'user', 'vendor'],
    '/website/deals/create': ['admin', 'user', 'vendor'],
    '/website/deals/create/*': ['admin', 'user', 'vendor'],
    '/website/deals/*': ['admin', 'user', 'vendor'],
    '/website/deals/*/edit': ['admin', 'user', 'vendor'],
    '/website/config': ['admin', 'user', 'vendor'],
    '/dashboard/intro-screen': ['admin', 'user', 'vendor'],
    '/dashboard/printerscrud': ['admin', 'user', 'vendor'],
    '/dashboard/ventas': ['admin', 'vendor'],
    '/dashboard/inventario': ['admin', 'user', 'vendor'],
    '/dashboard/chat': ['admin', 'user', 'vendor'],
    '/dashboard/settings': ['admin', 'user', 'vendor'],
    '/website/consumibles': ['admin', 'user', 'vendor'],
    '/website/consumibles/create': ['admin', 'user', 'vendor'],
    '/website/consumibles/create/*': ['admin', 'user', 'vendor'],
    '/website/consumibles/*': ['admin', 'user', 'vendor'],
    '/website/consumibles/*/edit': ['admin', 'user', 'vendor'],
    '/website/packages': ['admin', 'user', 'vendor'],
    '/website/packages/create': ['admin', 'user', 'vendor'],
    '/website/packages/create/*': ['admin', 'user', 'vendor'],
    '/website/packages/*': ['admin', 'user', 'vendor'],
    '/website/packages/*/edit': ['admin', 'user', 'vendor'],
    '/sales/leads': ['admin', 'vendor'],
    '/sales/leads/create': ['admin', 'vendor'],
    '/sales/leads/create/*': ['admin', 'vendor'],
    '/sales/leads/*': ['admin', 'vendor'],
    '/sales/leads/*/edit': ['admin', 'vendor'],
    '/sales/leads/communication/*': ['admin', 'vendor'],
    '/sales/leads/communication/*/edit': ['admin', 'vendor'],
    '/sales/leads/*/communication/create': ['admin', 'vendor'],
    '/users/user': ['admin', 'user', 'vendor'],
    '/users/user/create': ['admin'],
    '/users/user/create/*': ['admin'],
    '/users/user/*': ['admin'],
    '/users/user/*/edit': ['admin'],
    '/users/config': ['admin'],
    '/support/tickets': ['admin', 'user', 'vendor'],
    '/support/tickets/create': ['admin', 'user', 'vendor'],
    '/support/tickets/create/*': ['admin', 'user', 'vendor'],
    '/support/tickets/*': ['admin', 'user', 'vendor'],
    '/support/tickets/*/edit': ['admin', 'user', 'vendor'],
    '/support/config': ['admin', 'user', 'vendor'],
    '/support/tickets/list': ['admin', 'user', 'vendor'],
  };

  getAllowedRoles(path: string): string[] {
    // Split the path by the '?' character to separate the base path from the query parameters
    const basePath = path.split('?')[0];

    const route = Object.keys(this.roles).find((key) =>
      new RegExp(`^${key.replace('*', '[0-9a-zA-Z-]+')}$`).test(basePath)
    );
    return route ? this.roles[route] : [];
  }
  // getAllowedRoles(path: string): string[] {
  //   return this.roles[path];
  // }
}
