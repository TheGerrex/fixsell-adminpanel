import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-user-role-dialog',
  templateUrl: './add-user-role-dialog.component.html',
  styleUrls: ['./add-user-role-dialog.component.scss'],
})
export class AddUserRoleDialogComponent {
  roleName = new FormControl('', Validators.required);

  constructor(
    private rolService: RoleService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<AddUserRoleDialogComponent>
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  get roleNameError() {
    return this.roleName.errors?.["serverError"];
  }

  onSubmit(): void {
    if (this.roleName.valid) {
      this.rolService.createRole(this.roleName.value).subscribe({
        next: () => {
          this.toastService.showSuccess('Rol creado con éxito', 'Close');
          this.dialogRef.close();
        },
        error: (error) => {
          this.roleName.setErrors({ serverError: error.error.message });
        }
      });
    }
  }
}
