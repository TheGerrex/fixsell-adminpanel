import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environments';
@Injectable({
  providedIn: 'root',
})
export class NavigationGuard {
  private readonly baseUrl: string = environment.baseUrl;
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    // store last visited url
    //localStorage.setItem('lastVisitedRoute', state.url);
    return this.authService.checkAuthStatus().pipe(
      map(() => true),
      catchError((err: any, caught: Observable<boolean>) => {
        // Redirect to a fallback page when authentication fails
        return of(this.router.createUrlTree([`${this.baseUrl}/auth/login`]));
      })
    );
  }
}
