import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  isLoading = false;

  constructor(private validatorsService: ValidatorsService) {}

  public myForm: FormGroup = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.pattern(this.validatorsService.emailPattern),
      ],
    ],
    //password must contain at least 8 characters, including UPPER/lowercase and numbers, and special characters
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  login() {
    if (this.myForm.invalid) {
      console.log('Invalid form');
      console.log(this.myForm);
      this.myForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const { email, password } = this.myForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        console.log('login successful rerouting to dashboard');
        this.router.navigateByUrl('/dashboard').then(() => {
          this.toastService.showSuccess(
            'Sesión iniciada con éxito.',
            'success',
          );
          this.isLoading = false;
        });
      },
      error: (message) => {
        this.toastService.showError(message, 'error');
        this.isLoading = false;
        this.myForm.controls['password'].setErrors({ serverError: true });
      },
    });
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.myForm, field);
  }

  getFieldError(field: string): string | null {
    return this.validatorsService.getFieldError(this.myForm, field);
  }
}
