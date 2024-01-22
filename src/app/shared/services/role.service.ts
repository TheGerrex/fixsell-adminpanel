import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private roles: { [key: string]: string[] } = {
    '/website/printers': ['admin', 'user'],
    '/website/printers/create': ['admin', 'user', 'vendor'],
    '/website/promociones': ['admin'],
    '/dashboard/intro-screen': ['admin', 'user', 'vendor'],
    '/dashboard/printerscrud': ['admin', 'user', 'vendor'],
    '/dashboard/users': ['admin'],
    '/dashboard/ventas': ['admin', 'vendor'],
    '/dashboard/inventario': ['admin', 'user', 'vendor'],
    '/dashboard/chat': ['admin', 'user', 'vendor'],
    '/dashboard/settings': ['admin', 'user', 'vendor'],
  };

  getAllowedRoles(path: string): string[] {
    return this.roles[path];
  }
}
