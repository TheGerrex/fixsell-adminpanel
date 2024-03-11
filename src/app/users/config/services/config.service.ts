import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Role } from '../../interfaces/users.interface';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(private http: HttpClient) {}

  // get roles
  getRoles(): Observable<any> {
    return this.http
      .get<any>(`${environment.baseUrl}/roles`)
      .pipe(map((roles: any) => roles));
  }

  // create role
  createRole(role: Role): Observable<any> {
    return this.http.post(`${environment.baseUrl}/roles`, role).pipe(
      catchError((error) => {
        console.error('Error occurred:', error);
        return of(error);
      })
    );
  }

  // update role
  updateRole(role: Role, id: string): Observable<any> {
    return this.http.patch(`${environment.baseUrl}/roles/${id}`, role);
  }

  // delete role
  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/roles/${id}`);
  }
}
