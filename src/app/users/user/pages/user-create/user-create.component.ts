import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  User,
  Role,
  Permission,
} from 'src/app/users/interfaces/users.interface';
import { UsersService } from '../../../services/users.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AddUserRoleDialogComponent } from '../../../../shared/components/add-user-role-dialog/add-user-role-dialog.component';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss'],
})
export class UserCreateComponent implements OnInit {
  public createUserForm!: FormGroup;
  hide = true;
  roles: Role[] = [];
  isLoadingForm = false;
  passwordFieldFocused = false;
  selectedRoleName: string = '';
  selectedPermissionId: string | null = null;
  constructor(
    private router: Router,
    private usersService: UsersService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
    private http: HttpClient,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.getRoles();

    // Subscribe to role changes to update selectedRoleName and permissionId
    this.createUserForm
      .get('role')
      ?.valueChanges.subscribe((roleId: string) => {
        this.onRoleChange(roleId);
      });
  }

  getRoles(): void {
    this.usersService.getRoles().subscribe(
      (roles: Role[]) => {
        this.roles = roles;
        console.log('Roles:', this.roles);
      },
      (error) => {
        console.error('Error fetching roles', error);
      },
    );
  }

  initializeForm() {
    this.createUserForm = this.fb.group(
      {
        email: [
          '',
          [
            Validators.required,
            Validators.pattern(this.validatorsService.emailPattern),
          ],
        ],
        name: ['', Validators.required],
        password: [
          '',
          [Validators.required, this.validatorsService.isStrongPassword()],
        ],
        repeatPassword: ['', Validators.required],
        isActive: [true],
        role: ['', Validators.required], // Changed from 'roles' to 'role'
        permissions: [{} as Permission], // Add permissions control
      },
      {
        validators: this.validatorsService.passwordsMatch(
          'password',
          'repeatPassword',
        ),
      },
    );
  }

  onRoleChange(roleId: string): void {
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
    this.createUserForm.controls['permissions'].setValue(updatedPermissions);
  }

  onIsActiveChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.createUserForm.get('isActive')?.setValue(target.checked);
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.createUserForm, field);
  }

  getFieldError(field: string): string | null {
    if (!this.createUserForm.controls[field]) return null;

    const errors = this.createUserForm.controls[field].errors || {};

    console.log(errors);

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'pattern':
          return 'Este campo está en formato incorrecto';
        case 'maxlength':
          return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
        default:
          return 'Error desconocido';
      }
    }
    return null;
  }

  public isStrongPassword() {
    return (control: AbstractControl) => {
      const value = control.value;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
        value,
      );

      const passwordValid =
        hasUpperCase &&
        hasLowerCase &&
        hasNumeric &&
        hasSpecialChar &&
        value.length >= 8;

      if (!passwordValid) {
        return { strongPassword: true };
      }

      return null;
    };
  }

  hasUpperCase(value: string): boolean {
    return /[A-Z]/.test(value);
  }

  hasLowerCase(value: string): boolean {
    return /[a-z]/.test(value);
  }

  hasNumeric(value: string): boolean {
    return /[0-9]/.test(value);
  }

  hasSpecialChar(value: string): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
  }

  updateValidationStatus() {
    // Do nothing. This is just to trigger change detection.
  }

  newRole() {
    this.openAddUserRoleDialog();
  }

  openAddUserRoleDialog() {
    const dialogRef = this.dialog.open(AddUserRoleDialogComponent);

    dialogRef.afterClosed().subscribe((newRole) => {
      if (newRole) {
        this.getRoles();
        // Add the new role to the roles array
        this.roles.push(newRole);

        // Set the new role as the selected role
        const rolesControl = this.createUserForm.get('role');
        if (rolesControl) {
          rolesControl.setValue(newRole.id); // Assuming 'id' is used as the value
        } else {
          console.warn('The form does not have a "role" control.');
        }
      }
    });
  }

  submitForm() {
    if (this.createUserForm.invalid) {
      console.log('Invalid form');
      this.createUserForm.markAllAsTouched();
      return;
    }
    this.isLoadingForm = true;

    const user = { ...this.createUserForm.value };
    delete user.repeatPassword; // Remove the repeat password field
    delete user.permissions; // Remove the permissions field

    console.log('user:', user);
    this.http.post(`${environment.baseUrl}/auth/register`, user).subscribe({
      next: (response) => {
        this.isLoadingForm = false;
        this.toastService.showSuccess('Usuario creado con éxito', 'Close');
        // Navigate to the user detail page
        this.router.navigate(['/users/user']);
        // Reset the form
        this.createUserForm.reset();
      },
      error: (error) => {
        this.isLoadingForm = false;
        this.toastService.showError(
          `Error creando usuario: ${error.error.message}`,
          'Close',
        );
        console.error('Error creando usuario:', error.error.message);
      },
    });
  }
}
