import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { AuthStatus } from '../interfaces';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const authStatus = localStorage.getItem('authStatus');

  if(authStatus === AuthStatus.authenticated){
    return true;
  }

  router.navigateByUrl('/auth/login');
  return false;
};
