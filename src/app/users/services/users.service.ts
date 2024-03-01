import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}
  // get all users

  //create user
  //update user
  // delete user
  // get user by id
  // get user by email
  // get user by name
  // get roles names
  // get user roles
  // add user role
  // remove user role
  // get roles names
  getRoles(): Observable<string[]> {
    return this.http
      .get<{ id: string; name: string }[]>(`${environment.baseUrl}/roles`)
      .pipe(
        map((roles: { id: string; name: string }[]) =>
          roles.map((role) => role.name)
        )
      );
  }
}
