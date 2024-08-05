import { Component, Inject } from '@angular/core';
import { RoleService } from '../../services/role.service';
import { ToastService } from '../../services/toast.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Role } from 'src/app/users/interfaces/users.interface';

@Component({
  selector: 'app-delete-user-role-dialog',
  templateUrl: './delete-user-role-dialog.component.html',
  styleUrl: './delete-user-role-dialog.component.scss'
})
export class DeleteUserRoleDialogComponent {

  constructor(
    private roleService: RoleService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<DeleteUserRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Role,
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.data.id) {
      const id = this.data.id;
      this.roleService.deleteRole(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Rol eliminado con éxito', 'Close');
          this.dialogRef.close();
        },
        error: (error) => {
          // handle error...
        }
      });
    }
  }
}
