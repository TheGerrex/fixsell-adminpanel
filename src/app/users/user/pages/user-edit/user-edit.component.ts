import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { User } from 'src/app/users/interfaces/users.interface';
import { UsersService } from '../../../services/users.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { repeat } from 'rxjs';
import { R } from '@angular/cdk/keycodes';
import {
  InputChipsComponent,
  Chip,
} from '../../../../shared/components/input-chips/input-chips.component';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AddUserRoleDialogComponent } from '../../../../shared/components/add-user-role-dialog/add-user-role-dialog.component';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit {
  public editUserForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', Validators.required],
    password: ['', [this.validatorsService.isStrongPassword()]],
    repeatPassword: [''],
    isActive: [false],
    roles: [this.fb.array([])],
  });
  user: User | null = null;
  roles = ['user', 'admin', 'vendor'];
  isLoadingForm = false;
  selectedRoles: string[] = [];
  passwordFieldFocused = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private usersService: UsersService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getUser();
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
        }
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
        console.error('Error fetching roles', error);
      }
    );
  }

  isRoleSelected(roleName: string): boolean {
    return this.user?.roles?.some((role) => role.name === roleName) || false;
  }

  initializeForm() {
    this.editUserForm.setValue({
      email: this.user?.email || '',
      name: this.user?.name || '',
      password: '',
      repeatPassword: '',
      isActive: this.user?.isActive || false,
      roles: [] as unknown[],
    });
    this.selectedRoles = (
      this.user?.roles?.map((role) => role.name) || []
    ).filter((role): role is string => Boolean(role));
  }

  onIsActiveChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.editUserForm.get('isActive')?.setValue(target.checked);
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.editUserForm, field);
  }

  getFieldError(field: string): string | null {
    if (
      !this.editUserForm.controls[
        field as keyof typeof this.editUserForm.controls
      ]
    )
      return null;

    const errors =
      this.editUserForm.controls[
        field as keyof typeof this.editUserForm.controls
      ].errors || {};

    console.log(errors);

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'pattern':
          return 'Este campo esta en formato incorrecto';
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
        value
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

  roleSelected(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOption = selectElement.value;

    if (
      selectedOption !== 'addNew' &&
      !this.selectedRoles.includes(selectedOption)
    ) {
      this.selectedRoles = [...this.selectedRoles, selectedOption];
      this.editUserForm.get('roles')?.setValue(this.selectedRoles);
      console.log('selectedRoles:', this.selectedRoles);
    }
  }

  handleTagsUpdated(chips: Chip[]) {
    const newRoles = chips.map((chip) => chip.name);

    // Filter out any roles not in the original set
    const validRoles = newRoles.filter((role) =>
      this.selectedRoles.includes(role)
    );

    // Update the selected roles and form control value
    this.selectedRoles = validRoles;
    this.editUserForm.get('roles')?.setValue(this.selectedRoles);

    console.log('selectedRoles:', this.selectedRoles);
    console.log('chips:', chips);
  }

  isSubset(subset: string[], set: string[]): boolean {
    return subset.every((val) => set.includes(val));
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
            'Userio actualizado con exito',
            'Close'
          );
          // Navigate to the user detail page
          this.router.navigate(['/users/user']);
          // Reset the form
          this.editUserForm.reset();
        },
        error: (error) => {
          this.isLoadingForm = false;
          this.toastService.showError(
            `Error creando userio: ${error.error.message}`,
            'Close'
          );
          console.error('Error actualizando userio:', error.error.message);
        },
      });
  }
}
