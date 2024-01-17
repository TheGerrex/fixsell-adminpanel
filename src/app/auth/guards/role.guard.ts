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
    const userRoles = this.authService.getCurrentUserRoles();

    if (this.authService.checkAuthStatus()) {
      console.log('Allowed roles for current route:', allowedRoles);
      console.log('Current user roles:', userRoles);
    
      const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
    
      console.log('User has required role:', hasRequiredRole);
    
      if (hasRequiredRole) {
        return true;
      } else {
        return this.router.createUrlTree(['/dashboard']);
      }
    }

    // Redirect to login page if user is not authenticated
    return this.router.createUrlTree(['/auth/login']);
  }
}
