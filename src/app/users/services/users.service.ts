import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  getUser(id: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${environment.baseUrl}/auth/finduser/${id}`, {
      headers,
    });
  }

  getUsers(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${environment.baseUrl}/auth`, { headers });
  }
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

  // get user name
  getUserName(id: string, token: string): Observable<string> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http
      .get<any>(`${environment.baseUrl}/auth/finduser/${id}`, { headers })
      .pipe(map((response) => response.name));
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  // delete user
  deleteUser(user: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const userId = user.id;
    delete user.id; // Remove the id property from the user object

    console.log('userId:', userId); // Log the userId
    console.log('user:', user); // Log the user object

    return this.http.delete(`${environment.baseUrl}/auth/${userId}`,{
      headers,
    });
  }

  // edit user
  editUser(user: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const userId = user.id;
    delete user.id; // Remove the id property from the user object

    console.log('userId:', userId); // Log the userId
    console.log('user:', user); // Log the user object

    return this.http.patch(`${environment.baseUrl}/auth/${userId}`, user, {
      headers,
    });
  }
}
