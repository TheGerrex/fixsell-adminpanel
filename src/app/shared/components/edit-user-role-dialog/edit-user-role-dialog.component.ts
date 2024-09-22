import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-edit-user-role-dialog',
  templateUrl: './edit-user-role-dialog.component.html',
  styleUrl: './edit-user-role-dialog.component.scss'
})
export class EditUserRoleDialogComponent {
  roleName = new FormControl('', Validators.required);


  constructor(
    private rolService: RoleService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<EditUserRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.roleName.setValue(data.roleName);
  }

  get roleNameError() {
    return this.roleName.errors?.["serverError"];
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.roleName.valid) {
      this.rolService.editRole(this.data.roleId, this.roleName.value).subscribe({
        next: () => {
          this.toastService.showSuccess('Rol actualizado con éxito', 'Close');
          this.dialogRef.close();
        },
        error: (error) => {
          this.roleName.setErrors({ serverError: error.error.message });
        }
      });
    }
  }
}
