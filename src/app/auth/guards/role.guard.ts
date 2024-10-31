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
    console.log('requiredPermissions', requiredPermissions);
    console.log('url', state.url);
    localStorage.setItem('lastVisitedRoute', state.url);

    if (this.authService.checkAuthStatus()) {
      const userPermissions = this.authService.getCurrentUserPermissions();
      const hasRequiredPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );
      if (hasRequiredPermission) {
        return true;
      } else {
        console.log('RoleGuard: user does not have required permissions');
        // Redirect or handle unauthorized access
        // redirect user to /dashboard or handle unauthorized access
        return this.router.createUrlTree(['/dashboard']);
      }
    }

    return this.router.createUrlTree(['/auth/login']);
  }
}
