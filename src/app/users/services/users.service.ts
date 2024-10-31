import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User, Role } from '../interfaces/users.interface';

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
  // Updated getRoles method to return Role[]
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.baseUrl}/roles`);
  }

  // Optionally, add a getRole method to fetch a single Role by ID
  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${environment.baseUrl}/roles/${id}`);
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

  getCurrentUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // delete user
  deleteUser(user: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const userId = user.id;
    delete user.id; // Remove the id property from the user object

    console.log('userId:', userId); // Log the userId
    console.log('user:', user); // Log the user object

    return this.http.delete(`${environment.baseUrl}/auth/${userId}`, {
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
