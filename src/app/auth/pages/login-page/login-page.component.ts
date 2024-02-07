import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/shared/services/toast.service';

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

  public myForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    //password must contain at least 8 characters, including UPPER/lowercase and numbers, and special characters
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  login() {
    this.isLoading = true;
    const { email, password } = this.myForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigateByUrl('/dashboard').then(() => {
          this.toastService.showSuccess('Login successful', 'success');
          this.isLoading = false;
        });
      },
      error: (message) => {
        this.toastService.showError(message, 'error');
        this.isLoading = false;
      },
    });
  }
}
