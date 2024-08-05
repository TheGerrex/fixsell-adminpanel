import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ToastService } from './toast.service';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Role } from 'src/app/auth/interfaces';

@Injectable({
  providedIn: 'root',
})
export class RoleService {

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}
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
    '/chat/chats': ['admin', 'user', 'vendor'],
    '/chat/live-chat': ['admin', 'user', 'vendor'],
    '/chat/config': ['admin', 'user', 'vendor'],
  };

  getAllowedRoles(path: string): string[] {
    // Split the path by the '?' character to separate the base path from the query parameters
    const basePath = path.split('?')[0];

    const route = Object.keys(this.roles).find((key) =>
      new RegExp(`^${key.replace('*', '[0-9a-zA-Z-]+')}$`).test(basePath)
    );
    return route ? this.roles[route] : [];
  }

  // create role
  createRole(role: string | null): Observable<any> {
    return this.http.post(`${environment.baseUrl}/roles`, {name: role?.toLocaleLowerCase()}).pipe(
      catchError((error) => {
        console.error('Error occurred:', error);
        return throwError(error);
      })
    );
  }

  editRole(roleId: string, roleName: string | null): Observable<any> {
    return this.http.patch(`${environment.baseUrl}/roles/${roleId}`, {name: roleName?.toLocaleLowerCase()}).pipe(
      catchError((error) => {
        console.error('Error occurred:', error);
        return throwError(error);
      })
    );
  }

  // get roles
  getRoles(): Observable<any> {
    return this.http
      .get<any>(`${environment.baseUrl}/roles`)
      .pipe(map((roles: any) => roles));
  }


  // update role
  updateRole(role: Role, id: string): Observable<any> {
    return this.http.patch(`${environment.baseUrl}/roles/${id}`, role);
  }

  // delete role
  deleteRole(roleId: string): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/roles/${roleId}`);
  }

}
