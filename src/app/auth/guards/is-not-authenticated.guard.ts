import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { AuthStatus } from '../interfaces';

export const isNotAuthenticatedGuard: CanActivateFn = (route, state) => {
  // const authService = inject(AuthService);
  // const router = inject(Router);

  // if(authService.authStatus() === AuthStatus.authenticated){
  //   return true;
  // }

  // If the user is not authenticated, redirect to the login page
  // router.navigateByUrl('/auth/login');
  // return false;

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.authStatus() === AuthStatus.authenticated) {
    console.log('isNotAuthenticatedGuard: user is authenticated');
    // router.navigateByUrl('/dashboard');
    return false;
  }

  return true;
};
