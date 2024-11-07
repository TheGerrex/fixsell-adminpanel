import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  User,
  Role,
  Permission,
} from 'src/app/users/interfaces/users.interface';
import { UsersService } from '../../../services/users.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AddUserRoleDialogComponent } from '../../../../shared/components/add-user-role-dialog/add-user-role-dialog.component';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit {
  public editUserForm: FormGroup;
  user: User | null = null;
  hide = true;
  roles: Role[] = [];
  isLoadingForm = false;
  passwordFieldFocused = false;
  selectedRoleName: string = '';
  selectedPermissionId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
    private dialog: MatDialog,
    private http: HttpClient,
  ) {
    this.editUserForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        name: ['', Validators.required],
        password: ['', [this.validatorsService.isStrongPassword()]],
        repeatPassword: [''],
        isActive: [false],
        role: ['', Validators.required],
        permissions: [{} as Permission],
      },
      {
        validators: this.validatorsService.passwordsMatch(
          'password',
          'repeatPassword',
        ),
      },
    );
  }

  ngOnInit() {
    this.getUser();
    this.getRoles();

    // Subscribe to role changes to update selectedRoleName and permissionId
    this.editUserForm.get('role')?.valueChanges.subscribe((roleId: string) => {
      this.onRoleChange(roleId);
    });
  }

  getUser(): void {
    const token = this.usersService.getToken();
    this.route.params.subscribe((params) => {
      const userId = params['id']; // Assuming the route parameter is 'id'
      this.usersService.getUser(userId, token).subscribe(
        (user: User) => {
          this.user = user;
          this.initializeForm();
          // Set selectedRoleName and selectedPermissionId
          this.selectedRoleName = user.role?.name || '';
          this.selectedPermissionId = user.role?.permission?.id || null;
        },
        (error) => {
          console.error('Error fetching user', error);
        },
      );
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
    if (this.user) {
      this.editUserForm.patchValue({
        email: this.user.email,
        name: this.user.name,
        isActive: this.user.isActive,
        role: this.user.role?.id || '',
        permissions: this.user.role?.permission || {},
      });
    }
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
    this.editUserForm.controls['permissions'].setValue(updatedPermissions);
  }

  /**
   * Handle changes to the 'isActive' toggle.
   * @param event The toggle change event.
   */
  onIsActiveChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.editUserForm.get('isActive')?.setValue(target.checked);
  }

  /**
   * Check if a form field is valid.
   * @param field The name of the form field.
   * @returns True if valid, false otherwise.
   */
  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.editUserForm, field);
  }

  /**
   * Get the error message for a specific form field.
   * @param field The name of the form field.
   * @returns The error message if any, otherwise null.
   */
  getFieldError(field: string): string | null {
    return this.validatorsService.getFieldError(this.editUserForm, field);
  }

  /**
   * Validator for strong passwords.
   * @returns A validator function.
   */
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

  /**
   * Trigger change detection for validation status.
   */
  updateValidationStatus() {
    // This can be used if additional change detection logic is needed
  }

  /**
   * Open the dialog to create a new role.
   */
  newRole() {
    this.openAddUserRoleDialog();
  }

  /**
   * Open the AddUserRoleDialogComponent and handle the creation of a new role.
   */
  openAddUserRoleDialog() {
    const dialogRef = this.dialog.open(AddUserRoleDialogComponent);

    dialogRef.afterClosed().subscribe((newRole: Role | null) => {
      if (newRole) {
        this.roles.push(newRole);
        this.editUserForm.get('role')?.setValue(newRole.id);
      }
    });
  }

  /**
   * Submit the form to update the user.
   */
  submitForm() {
    if (this.editUserForm.invalid) {
      console.log('Invalid form');
      this.editUserForm.markAllAsTouched();
      return;
    }

    this.isLoadingForm = true;

    const selectedRoleId: string = this.editUserForm.value.role;

    // Keep updatedUser.role as Role object to satisfy the User interface
    const updatedUser: User = {
      ...this.user!,
      email: this.editUserForm.value.email,
      name: this.editUserForm.value.name,
      isActive: this.editUserForm.value.isActive,
      role: { id: selectedRoleId } as Role,
    };

    if (this.editUserForm.value.password) {
      updatedUser.password = this.editUserForm.value.password;
    }

    // Create a separate object for the API request, excluding permissions
    const userToSubmit = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      isActive: updatedUser.isActive,
      role: selectedRoleId,
      password: updatedUser.password,
    };

    console.log('Updated user:', userToSubmit);

    const token = this.usersService.getToken();

    this.usersService.editUser(userToSubmit, token).subscribe({
      next: (response) => {
        this.isLoadingForm = false;
        this.toastService.showSuccess('Usuario actualizado con éxito', 'Close');
        this.router.navigate(['/users/user']);
      },
      error: (error) => {
        this.isLoadingForm = false;
        this.toastService.showError(
          `Error actualizando usuario: ${error.error.message}`,
          'Close',
        );
        console.error('Error actualizando usuario:', error.error.message);
      },
    });
  }
}
