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
    '/dashboard/intro-screen': ['admin', 'user', 'vendor'],
    '/dashboard/printerscrud': ['admin', 'user', 'vendor'],
    '/dashboard/users': ['admin'],
    '/dashboard/ventas': ['admin', 'vendor'],
    '/dashboard/inventario': ['admin', 'user', 'vendor'],
    '/dashboard/chat': ['admin', 'user', 'vendor'],
    '/dashboard/settings': ['admin', 'user', 'vendor'],
  };

  getAllowedRoles(path: string): string[] {
    const route = Object.keys(this.roles).find((key) =>
      new RegExp(`^${key.replace('*', '[0-9a-zA-Z-]+')}$`).test(path)
    );
    return route ? this.roles[route] : [];
  }
  // getAllowedRoles(path: string): string[] {
  //   return this.roles[path];
  // }
}
