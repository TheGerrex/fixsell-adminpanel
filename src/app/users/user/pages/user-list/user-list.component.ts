import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { User } from 'src/app/users/interfaces/users.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'email', 'isActive', 'roles', 'action'];
  dataSource = new MatTableDataSource<User>();
  filterValue = '';
  isAdmin = false;
  userData: User[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.http
      .get<User[]>(`${environment.baseUrl}/auth`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token') || '',
        },
      })
      .subscribe((data) => {
        console.log(data);

        // save to userData
        this.userData = data;

        // const users = data.map(({ _id,   }) => ({ _id, name, email, isActive, roles }));
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });

    const userRoles = this.authService.getCurrentUserRoles();
    this.isAdmin = userRoles.includes('admin');
    if (!this.isAdmin) {
      this.displayedColumns = ['name', 'email', 'isActive'];
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  deleteUser(id: string) {
    // console.log(id);
    this.http.delete(`${environment.baseUrl}/users/${id}`).subscribe((data) => {
      console.log(data);
      this.dataSource.data = this.dataSource.data.filter(
        (user) => user.id !== id
      );
    });
  }

  editUser(id: string) {
    this.router.navigate(['/users/edit', id]);
  }

  seeUser(id: string) {
    this.router.navigate(['/users/see', id]);
  }

  addUser() {
    this.router.navigate(['/users/add']);
  }
}
