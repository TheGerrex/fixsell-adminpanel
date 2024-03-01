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
@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss'],
})
export class UserCreateComponent implements OnInit {
  public createUserForm!: FormGroup;
  user: User | null = null;

  isLoadingForm = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private usersService: UsersService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private validatorsService: ValidatorsService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.createUserForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        name: ['', Validators.required],
        password: [
          '',
          [Validators.required, this.validatorsService.isStrongPassword()],
        ],
        repeatPassword: ['', Validators.required],
        isActive: [false],
        roles: [[]],
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

  submitForm() {
    console.log(this.createUserForm.value);
  }
}
