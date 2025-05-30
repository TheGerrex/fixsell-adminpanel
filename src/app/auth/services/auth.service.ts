// auth.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

import {
  AuthStatus,
  CheckTokenResponse,
  LoginResponse,
} from '../interfaces/index';
import { User, Permission } from 'src/app/users/interfaces/users.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl: string = environment.baseUrl;
  private http = inject(HttpClient);

  private _currentUser = signal<User | null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);

  //! public stuff
  public currentUser = computed(() => this._currentUser());
  public authStatus = computed(() => this._authStatus());

  constructor() {
    this.checkAuthStatus().subscribe();
  }

  private setAuthentication(user: User, token: string): boolean {
    this._currentUser.set(user);
    this._authStatus.set(AuthStatus.authenticated);
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return true;
  }

  login(email: string, password: string): Observable<boolean> {
    const url = `${this.baseUrl}/auth/login`;
    const body = { email, password };

    return this.http.post<LoginResponse>(url, body).pipe(
      tap(() => console.log('Login method called')),
      map(({ user, token }) => {
        localStorage.setItem('authStatus', AuthStatus.authenticated);
        return this.setAuthentication(user, token);
      }),
      catchError((err) => {
        return throwError(() => err.error.message);
      }),
    );
  }

  checkAuthStatus(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/check-token`;
    const token = localStorage.getItem('token');

    if (!token) {
      this.logout();
      return of(false);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<CheckTokenResponse>(url, { headers }).pipe(
      map(({ user, token }) => {
        localStorage.setItem('authStatus', AuthStatus.authenticated);
        return this.setAuthentication(user, token);
      }),
      catchError(() => {
        this._authStatus.set(AuthStatus.notAuthenticated);
        localStorage.removeItem('authStatus');
        return of(false);
      }),
    );
  }

  logout() {
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.notAuthenticated);
    localStorage.removeItem('token');
    localStorage.removeItem('authStatus');
    localStorage.removeItem('currentUser');
  }

  setCurrentUser(user: User): void {
    this._currentUser.set(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  getCurrentUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user && user.role
      ? [user.role.name].filter((name): name is string => Boolean(name))
      : [];
  }

  getCurrentUserPermissions(): string[] {
    const user: User | null = this.getCurrentUser();
    if (user?.role?.permission) {
      const permissions = user.role.permission;
      return Object.keys(permissions).filter(
        (key) => permissions[key as keyof Permission] === true,
      );
    }
    return [];
  }

  /**
   * Checks if the current user has the specified permission.
   * @param permission The permission to check.
   * @returns `true` if the user has the permission, otherwise `false`.
   */
  /* used in the HasPermissionPipe */
  hasPermission(permission: string): boolean {
    return this.getCurrentUserPermissions().includes(permission);
  }
}
