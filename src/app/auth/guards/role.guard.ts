import { Injectable } from '@angular/core';
import {
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
export class RoleGuard {
  constructor(
    private authService: AuthService,
    private router: Router,
    private roleService: RoleService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    const allowedRoles = this.roleService.getAllowedRoles(state.url); // Get the allowed roles from the RoleService
    console.log('allowedRoles', allowedRoles);
    // log url and allowed roles to the console
    console.log('url', state.url);
    console.log('allowedRoles', allowedRoles);
    localStorage.setItem('lastVisitedRoute', state.url);
    if (this.authService.checkAuthStatus()) {
      const userRoles = this.authService.getCurrentUserRoles();
      const hasRequiredRole = allowedRoles.some((role) =>
        userRoles.includes(role)
      );
      if (hasRequiredRole) {
        return true;
      } else {
        console.log('RoleGuard: user does not have required role');
        // return this.router.createUrlTree(['/dashboard']);
      }
    }

    // Redirect to login page if user is not authenticated
    return this.router.createUrlTree(['/auth/login']);
  }
}
