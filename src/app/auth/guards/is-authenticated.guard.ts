import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { AuthStatus } from '../interfaces';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const authStatus = localStorage.getItem('authStatus');

  if (authStatus === AuthStatus.authenticated) {
    const requiredPermissions = route.data?.['allowedPermissions'] as
      | string[]
      | undefined;
    if (
      !requiredPermissions ||
      requiredPermissions.every((permission) =>
        authService.hasPermission(permission),
      )
    ) {
      return true;
    } else {
      const missingPermissions = requiredPermissions.filter(
        (permission) => !authService.hasPermission(permission),
      );
      console.log(
        `isAuthenticatedGuard: user does not have required permissions to access ${
          state.url
        }. Missing permissions: ${missingPermissions.join(', ')}`,
      );
      // Redirect to dashboard instead of login
      router.navigateByUrl('/dashboard');
      return false;
    }
  }

  console.log(
    `isAuthenticatedGuard: user is not authenticated and tried to access ${state.url}`,
  );
  router.navigateByUrl('/auth/login');
  return false;
};
