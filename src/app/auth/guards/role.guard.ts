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

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    const allowedRoles = route.data['allowedRoles'] as string[]; // Roles allowed for the route

    if (this.authService.checkAuthStatus()) {
      const userRoles = this.authService.getCurrentUserRoles();
      console.log('users roles:', userRoles);

      // Check if any of the allowed roles match the user's roles
      const hasRequiredRole = allowedRoles.some((role) =>
        userRoles.includes(role)
      );

      if (hasRequiredRole) {
        return true; // User has required role, allow access
      } else {
        // Redirect to unauthorized page or show an appropriate message
        return this.router.createUrlTree(['/unauthorized']); // Redirect to '/unauthorized'
      }
    }

    // Redirect to login page if user is not authenticated
    return this.router.createUrlTree(['/login']);
  }
}
