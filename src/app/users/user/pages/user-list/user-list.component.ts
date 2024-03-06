import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Role, User } from 'src/app/users/interfaces/users.interface';
import { environment } from 'src/environments/environment';
import { DialogService } from '../../../../shared/services/dialog.service';
import { ToastService } from '../../../../shared/services/toast.service';

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
    private authService: AuthService,
    private dialogService: DialogService,
    private toastService: ToastService
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

        this.dataSource = new MatTableDataSource(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        this.dataSource.filterPredicate = (data: User, filter: string) => {
          const dataStr =
            (data.name ?? '') +
            data.email +
            (data.isActive ? 'activo' : 'inactive') +
            (data.roles?.map((role) => role.name).join(' ') ?? '');
          return dataStr.toLowerCase().includes(filter);
        };

        // Apply the filter
        this.dataSource.filter = this.filterValue.trim().toLowerCase();
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

  getRoleNames(roles: Role[]): string {
    return roles.map((role) => role.name).join(', ');
  }

  deleteUser(user: User) {
    this.dialogService
      .openConfirmDialog(
        `Are you sure you want to delete the user: ${user.name}?`,
        'Yes',
        'delete-dialog'
      )
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.http
            .delete(`${environment.baseUrl}/auth/${user.id}`, {
              headers: {
                Authorization:
                  'Bearer ' + (localStorage.getItem('token') || ''),
              },
            })
            .subscribe(
              (response) => {
                console.log(response);
                this.toastService.showSuccess(
                  'User deleted successfully',
                  'OK'
                );

                // Remove the deleted user from the dataSource
                const data = this.dataSource.data;
                this.dataSource.data = data.filter((u) => u.id !== user.id);
              },
              (error) => {
                console.error('Error:', error);
                this.dialogService.openErrorDialog(
                  'Error deleting user',
                  'OK',
                  'delete-dialog'
                );
              }
            );
        }
      });
  }

  editUser(id: string) {
    console.log('navigating to:', `/users/user/${id}/edit`);
    this.router.navigate([`/users/user/${id}/edit`]);
  }

  seeUser(id: string) {
    console.log('navigating to:', `/users/user/${id}/`);
    this.router.navigate([`/users/user/${id}/`]);
  }

  addUser() {
    this.router.navigate(['/users/user/create']);
  }
}
