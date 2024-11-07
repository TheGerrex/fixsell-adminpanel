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

interface PermissionCategory {
  name: string;
  items: PermissionItem[];
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

  constructor(
    private roleService: RoleService,
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

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
        name: 'Printers',
        items: [
          { key: 'canViewPrinter', label: 'View Printer', checked: false },
          { key: 'canCreatePrinter', label: 'Create Printer', checked: false },
          { key: 'canUpdatePrinter', label: 'Update Printer', checked: false },
          { key: 'canDeletePrinter', label: 'Delete Printer', checked: false },
          {
            key: 'canManagePrinterCRUD',
            label: 'Manage Printer CRUD',
            checked: false,
          },
        ],
      },
      {
        name: 'Categories',
        items: [
          { key: 'canViewCategory', label: 'View Category', checked: false },
          {
            key: 'canCreateCategory',
            label: 'Create Category',
            checked: false,
          },
          {
            key: 'canUpdateCategory',
            label: 'Update Category',
            checked: false,
          },
          {
            key: 'canDeleteCategory',
            label: 'Delete Category',
            checked: false,
          },
        ],
      },
      {
        name: 'Brands',
        items: [
          { key: 'canViewBrand', label: 'View Brand', checked: false },
          { key: 'canCreateBrand', label: 'Create Brand', checked: false },
          { key: 'canUpdateBrand', label: 'Update Brand', checked: false },
          { key: 'canDeleteBrand', label: 'Delete Brand', checked: false },
        ],
      },
      {
        name: 'Consumables',
        items: [
          {
            key: 'canViewConsumable',
            label: 'View Consumable',
            checked: false,
          },
          {
            key: 'canCreateConsumable',
            label: 'Create Consumable',
            checked: false,
          },
          {
            key: 'canUpdateConsumable',
            label: 'Update Consumable',
            checked: false,
          },
          {
            key: 'canDeleteConsumable',
            label: 'Delete Consumable',
            checked: false,
          },
        ],
      },
      {
        name: 'Deals',
        items: [
          { key: 'canViewDeal', label: 'View Deal', checked: false },
          { key: 'canCreateDeal', label: 'Create Deal', checked: false },
          { key: 'canUpdateDeal', label: 'Update Deal', checked: false },
          { key: 'canDeleteDeal', label: 'Delete Deal', checked: false },
        ],
      },
      {
        name: 'Packages',
        items: [
          { key: 'canViewPackage', label: 'View Package', checked: false },
          { key: 'canCreatePackage', label: 'Create Package', checked: false },
          { key: 'canUpdatePackage', label: 'Update Package', checked: false },
          { key: 'canDeletePackage', label: 'Delete Package', checked: false },
        ],
      },
      {
        name: 'Leads',
        items: [
          { key: 'canViewLead', label: 'View Lead', checked: false },
          { key: 'canCreateLead', label: 'Create Lead', checked: false },
          { key: 'canUpdateLead', label: 'Update Lead', checked: false },
          { key: 'canDeleteLead', label: 'Delete Lead', checked: false },
          {
            key: 'canViewAllLeads',
            label: 'View All Leads',
            checked: false,
          },
          {
            key: 'canBeAssignedToLead',
            label: 'Be Assigned to Lead',
            checked: false,
          },
        ],
      },
      {
        name: 'Users',
        items: [
          { key: 'canViewUser', label: 'View User', checked: false },
          { key: 'canCreateUser', label: 'Create User', checked: false },
          { key: 'canUpdateUser', label: 'Update User', checked: false },
          { key: 'canDeleteUser', label: 'Delete User', checked: false },
          {
            key: 'canManageUserConfig',
            label: 'Manage User Config',
            checked: false,
          },
        ],
      },
      {
        name: 'Tickets',
        items: [
          { key: 'canViewTicket', label: 'View Ticket', checked: false },
          { key: 'canCreateTicket', label: 'Create Ticket', checked: false },
          { key: 'canUpdateTicket', label: 'Update Ticket', checked: false },
          { key: 'canDeleteTicket', label: 'Delete Ticket', checked: false },
          {
            key: 'canViewAllTickets',
            label: 'View All Tickets',
            checked: false,
          },
        ],
      },
      {
        name: 'Chats',
        items: [
          { key: 'canViewChat', label: 'View Chat', checked: false },
          { key: 'canCreateChat', label: 'Create Chat', checked: false },
          { key: 'canUpdateChat', label: 'Update Chat', checked: false },
          { key: 'canDeleteChat', label: 'Delete Chat', checked: false },
        ],
      },
      {
        name: 'Lead Communications',
        items: [
          {
            key: 'canViewLeadCommunication',
            label: 'View Lead Communication',
            checked: false,
          },
          {
            key: 'canCreateLeadCommunication',
            label: 'Create Lead Communication',
            checked: false,
          },
          {
            key: 'canUpdateLeadCommunication',
            label: 'Update Lead Communication',
            checked: false,
          },
          {
            key: 'canDeleteLeadCommunication',
            label: 'Delete Lead Communication',
            checked: false,
          },
        ],
      },
      {
        name: 'Website Configuration',
        items: [
          {
            key: 'canConfigureWebsite',
            label: 'Configure Website',
            checked: false,
          },
        ],
      },
    ];
  }

  updatePermissionCategories(): void {
    this.permissionCategories.forEach((category) => {
      category.items.forEach((item) => {
        item.checked = !!this.permissions[item.key];
      });
    });
  }

  onPermissionChange(): void {
    // Update the permissions object based on user input
    this.permissionCategories.forEach((category) => {
      category.items.forEach((item) => {
        this.permissions[item.key] = item.checked;
      });
    });
    this.permissionsChange.emit(this.permissions);
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
