import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Observable } from 'rxjs';
import { RoleService } from 'src/app/shared/services/role.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private roleService: RoleService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    const allowedRoles = this.roleService.getAllowedRoles(state.url); // Get the allowed roles from the RoleService

    if (this.authService.checkAuthStatus()) {
      const userRoles = this.authService.getCurrentUserRoles();
      console.log('users roles:', userRoles);
      console.log('allowed roles:', allowedRoles);

      // Check if any of the allowed roles match the user's roles
      const hasRequiredRole = allowedRoles.some((role) =>
        userRoles.includes(role)
      );

      if (hasRequiredRole) {
        return true; // User has required role, allow access
      } else {
        // Redirect to unauthorized page or show an appropriate message
        return this.router.createUrlTree(['/dashboard']); // Redirect to '/unauthorized'
      }
    }

    // Redirect to login page if user is not authenticated
    return this.router.createUrlTree(['/login']);
  }
}
