import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Permission } from 'src/app/users/interfaces/users.interface';
import { RoleService } from 'src/app/shared/services/role.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/services/toast.service';

interface PermissionItem {
  key: keyof Permission;
  label: string;
  checked: boolean;
}

interface PermissionSubItem {
  name: string;
  subitems: PermissionItem[];
}

interface PermissionCategory {
  name: string;
  items: PermissionSubItem[];
}

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
})
export class PermissionsComponent implements OnInit, OnChanges {
  @Input() permissionId: string | null = null; // Changed from roleId to permissionId
  @Output() permissionsChange = new EventEmitter<Permission>();

  permissions: Permission = { id: '', name: '' };
  permissionCategories: PermissionCategory[] = [];
  isCategoryVisible: boolean[] = [];

  constructor(
    private roleService: RoleService,
    private http: HttpClient,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.initializePermissionCategories();
    if (this.permissionId) {
      this.fetchPermissions();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['permissionId'] &&
      changes['permissionId'].currentValue !==
      changes['permissionId'].previousValue
    ) {
      this.fetchPermissions();
    }
  }

  fetchPermissions(): void {
    if (this.permissionId) {
      this.roleService.getPermissionsById(this.permissionId).subscribe(
        (permissions: Permission) => {
          this.permissions = permissions;
          this.updatePermissionCategories();
        },
        (error: any) => {
          console.error('Error fetching permissions', error);
          this.permissions = { id: '', name: '' };
          this.updatePermissionCategories();
        },
      );
    } else {
      this.permissions = { id: '', name: '' };
      this.updatePermissionCategories();
    }
  }

  initializePermissionCategories(): void {
    this.permissionCategories = [
      {
        name: 'Pagina Web',
        items: [
          {
            name: 'Multifuncionales',
            subitems: [
              { key: 'canViewPrinter', label: 'Ver Multifuncional', checked: false },
              { key: 'canCreatePrinter', label: 'Crear Multifuncional', checked: false },
              { key: 'canUpdatePrinter', label: 'Editar Multifuncional', checked: false },
              { key: 'canDeletePrinter', label: 'Eliminar Multifuncional', checked: false },
              {
                key: 'canManagePrinterCRUD',
                label: 'Gestión CRUD de Multifuncionales',
                checked: false,
              },
            ],
          },
          {
            name: 'Categorias',
            subitems: [
              { key: 'canViewCategory', label: 'Ver Categoria', checked: false },
              { key: 'canCreateCategory', label: 'Crear Categoria', checked: false },
              { key: 'canUpdateCategory', label: 'Editar Categoria', checked: false },
              { key: 'canDeleteCategory', label: 'Eliminar Categoria', checked: false },
            ],
          },
          {
            name: 'Marcas',
            subitems: [
              { key: 'canViewBrand', label: 'Ver Marca', checked: false },
              { key: 'canCreateBrand', label: 'Crear Marca', checked: false },
              { key: 'canUpdateBrand', label: 'Editar Marca', checked: false },
              { key: 'canDeleteBrand', label: 'Eliminar Marca', checked: false },
            ],
          },
          {
            name: 'Consumibles',
            subitems: [
              { key: 'canViewConsumable', label: 'Ver Consumible', checked: false },
              { key: 'canCreateConsumable', label: 'Crear Consumible', checked: false },
              { key: 'canUpdateConsumable', label: 'Editar Consumible', checked: false },
              { key: 'canDeleteConsumable', label: 'Eliminar Consumible', checked: false },
            ],
          },
          {
            name: 'Promociones',
            subitems: [
              { key: 'canViewDeal', label: 'Ver Promoción', checked: false },
              { key: 'canCreateDeal', label: 'Crear Promoción', checked: false },
              { key: 'canUpdateDeal', label: 'Editar Promoción', checked: false },
              { key: 'canDeleteDeal', label: 'Eliminar Promoción', checked: false },
            ],
          },
          {
            name: 'Paquetes de Renta',
            subitems: [
              { key: 'canViewPackage', label: 'Ver Paquete de Renta', checked: false },
              { key: 'canCreatePackage', label: 'Crear Paquete de Renta', checked: false },
              { key: 'canUpdatePackage', label: 'Editar Paquete de Renta', checked: false },
              { key: 'canDeletePackage', label: 'Eliminar Paquete de Renta', checked: false },
            ],
          },
          {
            name: 'Eventos',
            subitems: [
              { key: 'canViewEvent', label: 'Ver Evento', checked: false },
              { key: 'canCreateEvent', label: 'Crear Evento', checked: false },
              { key: 'canUpdateEvent', label: 'Editar Evento', checked: false },
              { key: 'canDeleteEvent', label: 'Eliminar Evento', checked: false },
            ],
          },
          {
            name: 'Configuración del sitio web',
            subitems: [
              {
                key: 'canConfigureWebsite',
                label: 'Gestión de configuración de sitio web',
                checked: false,
              },
            ],
          },
        ],
      },
      {
        name: 'Ventas',
        items: [
          {
            name: 'Prospectos',
            subitems: [
              { key: 'canViewLead', label: 'Ver Prospecto', checked: false },
              { key: 'canCreateLead', label: 'Crear Prospecto', checked: false },
              { key: 'canUpdateLead', label: 'Editar Prospecto', checked: false },
              { key: 'canDeleteLead', label: 'Eliminar Prospecto', checked: false },
              {
                key: 'canViewAllLeads',
                label: 'Ver todos los prospectos',
                checked: false,
              },
              {
                key: 'canBeAssignedToLead',
                label: 'Ser asignado a prospectos',
                checked: false,
              },
            ],
          },
          {
            name: 'Clientes',
            subitems: [
              { key: 'canViewClient', label: 'Ver Cliente', checked: false },
              { key: 'canCreateClient', label: 'Crear Cliente', checked: false },
              { key: 'canUpdateClient', label: 'Editar Cliente', checked: false },
              { key: 'canDeleteClient', label: 'Eliminar Cliente', checked: false },
              {
                key: 'canViewAllClients',
                label: 'Ver todos los clientes',
                checked: false,
              },
              {
                key: 'canBeAssignedToClient',
                label: 'Ser asignado a clientes',
                checked: false,
              },
            ],
          },
          {
            name: 'Comunicación de Prospectos',
            subitems: [
              {
                key: 'canViewLeadCommunication',
                label: 'Ver Comunicación de Prospecto',
                checked: false,
              },
              {
                key: 'canCreateLeadCommunication',
                label: 'Crear Comunicación de Prospecto',
                checked: false,
              },
              {
                key: 'canUpdateLeadCommunication',
                label: 'Editar Comunicación de Prospecto',
                checked: false,
              },
              {
                key: 'canDeleteLeadCommunication',
                label: 'Eliminar Comunicación de Prospecto',
                checked: false,
              },
            ],
          },
        ],
      },
      {
        name: 'Soporte',
        items: [
          {
            name: 'Tickets',
            subitems: [
              { key: 'canViewTicket', label: 'Ver Ticket', checked: false },
              { key: 'canCreateTicket', label: 'Crear Ticket', checked: false },
              { key: 'canUpdateTicket', label: 'Editar Ticket', checked: false },
              { key: 'canDeleteTicket', label: 'Eliminar Ticket', checked: false },
              {
                key: 'canViewAllTickets',
                label: 'Ver todos los tickets',
                checked: false,
              },
            ],
          },
        ],
      },
      {
        name: 'Chat',
        items: [
          {
            name: 'Chats',
            subitems: [
              { key: 'canViewChat', label: 'Ver Chat', checked: false },
              { key: 'canCreateChat', label: 'Crear Chat', checked: false },
              { key: 'canUpdateChat', label: 'Editar Chat', checked: false },
              { key: 'canDeleteChat', label: 'Eliminar Chat', checked: false },
            ],
          },
        ],
      },
      {
        name: 'Usuarios',
        items: [
          {
            name: 'Usuarios',
            subitems: [
              { key: 'canViewUser', label: 'Ver Usuario', checked: false },
              { key: 'canCreateUser', label: 'Crear Usuario', checked: false },
              { key: 'canUpdateUser', label: 'Editar Usuario', checked: false },
              { key: 'canDeleteUser', label: 'Eliminar Usuario', checked: false },

            ],
          },
          {
            name: 'Registros',
            subitems: [
              {
                key: 'canViewLogs',
                label: 'Ver Registros',
                checked: false,
              },
            ],
          },
          {
            name: 'Configuración',
            subitems: [
              {
                key: 'canManageUserConfig',
                label: 'Gestión de configuración de usuarios',
                checked: false,
              },
            ],
          },
        ],
      }
    ]
  }

  updatePermissionCategories(): void {
    this.permissionCategories.forEach((category) => {
      category.items.forEach((item) => {
        item.subitems.forEach((subitem) => {
          subitem.checked = !!this.permissions[subitem.key];
        });
      });
    });
  }

  onPermissionChange(): void {
    // Update the permissions object based on user input
    this.permissionCategories.forEach((category) => {
      category.items.forEach((item) => {
        item.subitems.forEach((subitem) => {
          this.permissions[subitem.key] = subitem.checked;
        });
      });
    });
    this.permissionsChange.emit(this.permissions);
  }

  toggleAllSubitems(item: PermissionSubItem, isChecked: boolean): void {
    item.subitems.forEach((subitem) => {
      subitem.checked = isChecked;
    });
    this.onPermissionChange();
  }

  isAllSubitemsChecked(item: PermissionSubItem): boolean {
    return item.subitems.every((subitem) => subitem.checked);
  }

  isSomeSubitemsChecked(item: PermissionSubItem): boolean {
    return item.subitems.some((subitem) => subitem.checked) && !this.isAllSubitemsChecked(item);
  }

  toggleCategory(index: number): void {
    this.isCategoryVisible[index] = !this.isCategoryVisible[index];
  }

  submitPermissions(): void {
    if (this.permissionId) {
      const { id, ...permissionsWithoutId } = this.permissions;
      this.http
        .patch(
          `${environment.baseUrl}/permissions?id=${this.permissionId}`,
          permissionsWithoutId,
        )
        .subscribe(
          (response) => {
            this.toastService.showSuccess(
              'Permissions updated successfully',
              'Close',
            );
            console.log('Permissions updated successfully:', response);
          },
          (error) => {
            this.toastService.showError('Error updating permissions', 'Close');
            console.error('Error updating permissions:', error);
          },
        );
    }
  }
}
