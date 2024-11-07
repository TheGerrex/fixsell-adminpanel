import { Component, OnInit } from '@angular/core';
import { RoleService } from 'src/app/shared/services/role.service';
import { Role, Permission } from 'src/app/users/interfaces/users.interface';

@Component({
  selector: 'app-permissions-tab',
  templateUrl: './permissions-tab.component.html',
  styleUrls: ['./permissions-tab.component.scss'],
})
export class PermissionsTabComponent implements OnInit {
  roles: Role[] = [];
  selectedRoleId: string | null = null;
  selectedRoleName: string = '';
  selectedPermissionId: string | null = null;

  constructor(private roleService: RoleService) {}

  ngOnInit(): void {
    this.fetchRoles();
  }

  fetchRoles(): void {
    this.roleService.getRoles().subscribe(
      (roles: Role[]) => {
        this.roles = roles;
      },
      (error) => {
        console.error('Error fetching roles', error);
      },
    );
  }

  onRoleChange(roleId: string): void {
    this.selectedRoleId = roleId;
    const selectedRole = this.roles.find((role) => role.id === roleId);
    if (selectedRole) {
      this.selectedRoleName = selectedRole.name || '';
      this.selectedPermissionId = selectedRole.permission?.id || null;
    } else {
      this.selectedRoleName = '';
      this.selectedPermissionId = null;
    }
  }

  onPermissionsChange(updatedPermissions: Permission): void {
    // Handle permission changes if needed
  }

  newRole() {
    // Implement the logic to create a new role if required
  }
}
