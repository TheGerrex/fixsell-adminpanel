import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { RoleService } from 'src/app/shared/services/role.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private roleService: RoleService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    const requiredPermissions = this.roleService.getRequiredPermissions(
      state.url,
    );
    console.log('RoleGuard: Required Permissions:', requiredPermissions);
    console.log('RoleGuard: Attempting to access URL:', state.url);
    localStorage.setItem('lastVisitedRoute', state.url);

    if (this.authService.checkAuthStatus()) {
      const userPermissions = this.authService.getCurrentUserPermissions();
      console.log('RoleGuard: User Permissions:', userPermissions);

      if (!requiredPermissions || requiredPermissions.length === 0) {
        console.log(
          'RoleGuard: No specific permissions required for this route.',
        );
        return true; // Allow access if no permissions are required
      }

      const missingPermissions = requiredPermissions.filter(
        (permission) => !userPermissions.includes(permission),
      );

      if (missingPermissions.length === 0) {
        console.log('RoleGuard: User has all required permissions.');
        return true;
      } else {
        console.log(
          `RoleGuard: User lacks the following permissions to access ${state.url}:`,
          missingPermissions,
        );
        // Optionally, you can display a notification or redirect to an unauthorized page
        return this.router.createUrlTree(['/dashboard']);
      }
    }

    console.log(
      `RoleGuard: User is not authenticated and tried to access ${state.url}`,
    );
    return this.router.createUrlTree(['/auth/login']);
  }
}
