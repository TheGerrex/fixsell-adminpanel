import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Role } from 'src/app/users/interfaces/users.interface';
import { Permission } from 'src/app/users/interfaces/users.interface';
@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private http: HttpClient) { }

  private routePermissions: { [key: string]: string[] } = {
    // Dashboard permissions
    '/dashboard/intro-screen': ['canViewDashboard'],
    '/dashboard/printerscrud': ['canManagePrinterCRUD'],
    '/dashboard/ventas': ['canViewVentas'],
    '/dashboard/inventario': ['canViewInventario'],
    '/dashboard/chat': ['canManageChat'],
    '/dashboard/settings': ['canManageSettings'],
    // Website permissions
    '/website/printers': ['canViewPrinter'],
    '/website/printers/create': ['canCreatePrinter'],
    '/website/printers/*': ['canViewPrinter'],
    '/website/printers/*/edit': ['canUpdatePrinter'],
    '/website/deals': ['canViewDeal'],
    '/website/deals/create': ['canCreateDeal'],
    '/website/deals/create/*': ['canUpdateDeal', 'canDeleteDeal'],
    '/website/deals/*': ['canViewDeal'],
    '/website/deals/*/edit': ['canUpdateDeal'],
    '/website/config': ['canConfigureWebsite'],
    '/website/consumibles': ['canViewConsumable'],
    '/website/consumibles/create': ['canCreateConsumable'],
    '/website/consumibles/create/*': [
      'canUpdateConsumable',
      'canDeleteConsumable',
    ],
    '/website/consumibles/*': ['canViewConsumable'],
    '/website/consumibles/*/edit': ['canUpdateConsumable'],
    '/website/packages': ['canViewPackage'],
    '/website/packages/create': ['canCreatePackage'],
    '/website/packages/create/*': ['canUpdatePackage', 'canDeletePackage'],
    '/website/packages/*': ['canViewPackage'],
    '/website/packages/*/edit': ['canUpdatePackage'],
    // Sales permissions
    '/sales/leads': ['canViewLead'],
    '/sales/leads/create': ['canCreateLead'],
    '/sales/leads/create/*': ['canUpdateLead', 'canDeleteLead'],
    '/sales/leads/*': ['canViewLead'],
    '/sales/leads/*/edit': ['canUpdateLead'],
    '/sales/leads/communication/*': ['canViewLeadCommunication'],
    '/sales/leads/communication/*/edit': ['canUpdateLeadCommunication'],
    '/sales/leads/*/communication/create': ['canCreateLeadCommunication'],
    '/sales/clients/*': ['canViewClient'],
    '/sales/clients/create': ['canCreateClient'],
    '/sales/clients/create/*': ['canUpdateClient', 'canDeleteClient'],
    '/sales/clients/*/edit': ['canUpdateClient'],
    '/sales/config': ['canConfigureSales'],
    // Users permissions
    '/users/user': ['canViewUser'],
    '/users/user/create': ['canCreateUser'],
    '/users/user/create/*': ['canUpdateUser', 'canDeleteUser'],
    '/users/user/*': ['canUpdateUser', 'canDeleteUser'],
    '/users/user/*/edit': ['canUpdateUser'],
    '/users/config': ['canManageUserConfig'],
    // Support permissions
    '/support/tickets': ['canViewTicket'],
    '/support/tickets/create': ['canCreateTicket'],
    '/support/tickets/create/*': ['canUpdateTicket', 'canDeleteTicket'],
    '/support/tickets/*': ['canViewTicket'],
    '/support/tickets/*/edit': ['canUpdateTicket'],
    '/support/config': ['canManageSupportConfig'],
    '/support/tickets/list': ['canViewTicketList'],
    // Chat permissions
    '/chat/chats': ['canViewChat'],
    '/chat/live-chat': ['canManageLiveChat'],
    '/chat/config': ['canManageChatConfig'],
    // Events permissions
    '/events': ['canViewEvents'],
    '/events/create': ['canCreateEvent'],
    '/events/edit/*': ['canUpdateEvent'],
    '/events/view/*': ['canViewEvent'],
  };

  getRequiredPermissions(path: string): string[] {
    const basePath = path.split('?')[0];

    const route = Object.keys(this.routePermissions).find((key) =>
      new RegExp(`^${key.replace(/\*/g, '[0-9a-zA-Z-]+')}$`).test(basePath),
    );
    return route ? this.routePermissions[route] : [];
  }

  // Create role
  createRole(role: string | null): Observable<any> {
    return this.http
      .post(`${environment.baseUrl}/roles`, { name: role?.toLowerCase() })
      .pipe(
        catchError((error) => {
          console.error('Error occurred:', error);
          return throwError(error);
        }),
      );
  }

  // Edit role
  editRole(roleId: string, roleName: string | null): Observable<any> {
    return this.http
      .patch(`${environment.baseUrl}/roles/${roleId}`, {
        name: roleName?.toLowerCase(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error occurred:', error);
          return throwError(error);
        }),
      );
  }

  // Get roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.baseUrl}/roles`).pipe(
      catchError((error) => {
        console.error('Error fetching roles:', error);
        return throwError(error);
      }),
    );
  }

  // Update role
  updateRole(role: Role, id: string): Observable<any> {
    return this.http.patch(`${environment.baseUrl}/roles/${id}`, role).pipe(
      catchError((error) => {
        console.error('Error updating role:', error);
        return throwError(error);
      }),
    );
  }

  // Delete role
  deleteRole(roleId: string): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/roles/${roleId}`).pipe(
      catchError((error) => {
        console.error('Error deleting role:', error);
        return throwError(error);
      }),
    );
  }

  // Get permissions by permissionId
  getPermissionsById(permissionId: string): Observable<Permission> {
    return this.http.get<Permission>(
      `${environment.baseUrl}/permissions/${permissionId}`,
    );
  }
}
