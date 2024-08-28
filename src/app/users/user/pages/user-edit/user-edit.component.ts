import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/users/interfaces/users.interface';
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
  // public editUserForm = this.fb.group({
  //   email: ['', [Validators.required, Validators.email]],
  //   name: ['', Validators.required],
  //   password: ['', [this.validatorsService.isStrongPassword()]],
  //   repeatPassword: [''],
  //   isActive: [false],
  //   roles: [this.fb.array([]), Validators.required],
  // });
  public editUserForm!: FormGroup;
  user: User | null = null;
  hide = true;
  roles = ['user', 'admin', 'vendor'];
  isLoadingForm = false;
  selectedRoles: string[] = [];
  passwordFieldFocused = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.getUser();
    this.initializeForm();
  }

  getUser(): void {
    const token = localStorage.getItem('token') ?? '';
    this.route.params.subscribe((params) => {
      this.usersService.getUser(params['id'], token).subscribe(
        (user: User) => {
          this.user = user;
          this.initializeForm();
          this.getRoles();
        },
        (error) => {
          console.error('error:', error);
        },
      );
    });
  }

  getRoles(): void {
    this.usersService.getRoles().subscribe(
      (roles: string[]) => {
        this.roles = roles;
        console.log('roles:', this.roles);
      },
      (error) => {
        console.error('Error al traer roles', error);
      },
    );
  }

  isRoleSelected(roleName: string): boolean {
    return this.user?.roles?.some((role) => role.name === roleName) || false;
  }

  initializeForm() {
    this.editUserForm = this.fb.group(
      {
        email: [this.user?.email || '', [Validators.required, Validators.email]],
        name: [this.user?.name || '', Validators.required],
        password: [this.user?.password || '', [this.validatorsService.isStrongPassword()]],
        repeatPassword: [''],
        isActive: [this.user?.isActive || false],
        roles: [this.user?.roles?.map((role) => role.name) ?? null, Validators.required],
      },
      {
        validators: this.validatorsService.passwordsMatch(
          'password',
          'repeatPassword'
        ),
      }
    );
  }

  onIsActiveChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.editUserForm.get('isActive')?.setValue(target.checked);
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.editUserForm, field);
  }

  getFieldError(field: string): string | null {
    return this.validatorsService.getFieldError(this.editUserForm, field);
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

  hasUpperCase(value: string) {
    return /[A-Z]/.test(value);
  }

  hasLowerCase(value: string) {
    return /[a-z]/.test(value);
  }

  hasNumeric(value: string) {
    return /[0-9]/.test(value);
  }

  hasSpecialChar(value: string) {
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

    dialogRef.afterClosed().subscribe(() => {
      // Refresh the roles here
      this.getRoles();
    });
  }

  submitForm() {
    if (this.editUserForm.invalid) {
      console.log('Invalid form');
      this.editUserForm.markAllAsTouched();
      return;
    }
    if (
      this.editUserForm.value.password === '' ||
      this.editUserForm.value.password === null
    ) {
      delete this.editUserForm.value.password;
    }
    this.isLoadingForm = true;
    const user = { ...this.editUserForm.value, id: this.user?.id };
    delete user.repeatPassword; // Delete the repeat field
    console.log('user:', user);
    this.usersService
      .editUser(user, localStorage.getItem('token') ?? '')
      .subscribe({
        next: (response) => {
          this.isLoadingForm = false;
          this.toastService.showSuccess(
            'Usuario actualizado con éxito',
            'Close',
          );
          // Navigate to the user detail page
          this.router.navigate(['/users/user']);
          // Reset the form
          this.editUserForm.reset();
        },
        error: (error) => {
          this.isLoadingForm = false;
          this.toastService.showError(
            `Error creando usuario: ${error.error.message}`,
            'Close',
          );
          console.error('Error actualizando usuario:', error.error.message);
        },
      });
  }
}
