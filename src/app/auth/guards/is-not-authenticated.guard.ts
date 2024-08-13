import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { AuthStatus } from '../interfaces';

export const isNotAuthenticatedGuard: CanActivateFn = (state) => {
  const authService = inject(AuthService);

  if (authService.authStatus() === AuthStatus.authenticated) {
    console.log('isNotAuthenticatedGuard: user is authenticated');
    return false;
  }

  return true;
};
