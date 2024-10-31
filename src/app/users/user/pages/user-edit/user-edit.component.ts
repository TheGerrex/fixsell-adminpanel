// src/app/users/user/pages/user-edit/user-edit.component.ts

import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User, Role } from 'src/app/users/interfaces/users.interface';
import { UsersService } from '../../../services/users.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
    private dialog: MatDialog,
  ) {
    // Initialize the form with default empty controls to avoid undefined FormGroup errors
    this.editUserForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        name: ['', Validators.required],
        password: ['', [this.validatorsService.isStrongPassword()]],
        repeatPassword: [''],
        isActive: [false],
        role: ['', Validators.required],
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
  }

  /**
   * Fetch the user data based on route parameters.
   */
  getUser(): void {
    const token = this.usersService.getToken();
    this.route.params.subscribe((params) => {
      this.usersService.getUser(params['id'], token).subscribe(
        (user: User) => {
          this.user = user;
          this.initializeForm();
          // It's better to fetch roles before setting the role in the form
          this.getRoles();
        },
        (error) => {
          console.error('Error fetching user:', error);
        },
      );
    });
  }

  /**
   * Fetch all available roles from the backend.
   */
  getRoles(): void {
    this.usersService.getRoles().subscribe(
      (roles: Role[]) => {
        this.roles = roles;
        console.log('Roles:', this.roles);
        // After fetching roles, set the user's role if available
        if (this.user && this.user.role) {
          this.editUserForm.patchValue({
            role: this.user.role.id,
          });
        }
      },
      (error) => {
        console.error('Error fetching roles:', error);
      },
    );
  }

  /**
   * Initialize the form with the fetched user data.
   */
  initializeForm() {
    if (this.user) {
      this.editUserForm.patchValue({
        email: this.user.email || '',
        name: this.user.name || '',
        isActive: this.user.isActive || false,
        // Role is set after fetching roles in getRoles()
      });
    }
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
      // Do not assign role here
    };

    if (this.editUserForm.value.password) {
      updatedUser.password = this.editUserForm.value.password;
    }

    // Create a separate object for the API request with role as string and include id
    const userToSubmit = {
      id: updatedUser.id, // Include user ID
      email: updatedUser.email,
      name: updatedUser.name,
      isActive: updatedUser.isActive,
      role: selectedRoleId, // role ID as string
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
