import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Role } from 'src/app/auth/interfaces';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private http: HttpClient) {}

  private routePermissions: { [key: string]: string[] } = {
    '/website/printers': ['canViewPrinter'],
    '/website/printers/create': ['canCreatePrinter'],
    '/website/printers/*': ['canUpdatePrinter', 'canDeletePrinter'],
    '/website/printers/*/edit': ['canUpdatePrinter'],
    '/website/deals': ['canViewDeal'],
    '/website/deals/create': ['canCreateDeal'],
    '/website/deals/create/*': ['canUpdateDeal', 'canDeleteDeal'],
    '/website/deals/*': ['canUpdateDeal', 'canDeleteDeal'],
    '/website/deals/*/edit': ['canUpdateDeal'],
    '/website/config': ['canConfigureWebsite'],
    '/dashboard/intro-screen': ['canViewDashboard'],
    '/dashboard/printerscrud': ['canManagePrinterCRUD'],
    '/dashboard/ventas': ['canViewVentas'],
    '/dashboard/inventario': ['canViewInventario'],
    '/dashboard/chat': ['canManageChat'],
    '/dashboard/settings': ['canManageSettings'],
    '/website/consumibles': ['canViewConsumable'],
    '/website/consumibles/create': ['canCreateConsumable'],
    '/website/consumibles/create/*': [
      'canUpdateConsumable',
      'canDeleteConsumable',
    ],
    '/website/consumibles/*': ['canUpdateConsumable', 'canDeleteConsumable'],
    '/website/consumibles/*/edit': ['canUpdateConsumable'],
    '/website/packages': ['canViewPackage'],
    '/website/packages/create': ['canCreatePackage'],
    '/website/packages/create/*': ['canUpdatePackage', 'canDeletePackage'],
    '/website/packages/*': ['canUpdatePackage', 'canDeletePackage'],
    '/website/packages/*/edit': ['canUpdatePackage'],
    '/sales/leads': ['canViewLead'],
    '/sales/leads/create': ['canCreateLead'],
    '/sales/leads/create/*': ['canUpdateLead', 'canDeleteLead'],
    '/sales/leads/*': ['canViewLead'],
    '/sales/leads/*/edit': ['canUpdateLead'],
    '/sales/leads/communication/*': ['canManageLeadCommunication'],
    '/sales/leads/communication/*/edit': ['canManageLeadCommunication'],
    '/sales/leads/*/communication/create': ['canManageLeadCommunication'],
    '/users/user': ['canViewUser'],
    '/users/user/create': ['canCreateUser'],
    '/users/user/create/*': ['canUpdateUser', 'canDeleteUser'],
    '/users/user/*': ['canUpdateUser', 'canDeleteUser'],
    '/users/user/*/edit': ['canUpdateUser'],
    '/users/config': ['canManageUserConfig'],
    '/support/tickets': ['canViewTicket'],
    '/support/tickets/create': ['canCreateTicket'],
    '/support/tickets/create/*': ['canUpdateTicket', 'canDeleteTicket'],
    '/support/tickets/*': ['canViewTicket'],
    '/support/tickets/*/edit': ['canUpdateTicket'],
    '/support/config': ['canManageSupportConfig'],
    '/support/tickets/list': ['canViewTicketList'],
    '/chat/chats': ['canViewChat'],
    '/chat/live-chat': ['canManageLiveChat'],
    '/chat/config': ['canManageChatConfig'],
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
}
