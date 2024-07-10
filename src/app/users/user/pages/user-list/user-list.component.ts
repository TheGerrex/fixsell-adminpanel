import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Role, User } from 'src/app/users/interfaces/users.interface';
import { environment } from 'src/environments/environment';
import { ToastService } from '../../../../shared/services/toast.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { UsersService } from 'src/app/users/services/users.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'email', 'roles', 'isActive', 'action'];
  dataSource = new MatTableDataSource<User>();
  filterValue = '';
  isAdmin = false;
  userData: User[] = [];
  token: string = '';

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private userService: UsersService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.token = this.userService.getToken();
    this.getAllUsersData()
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

  getAllUsersData() {
    this.userService.getUsers(this.token).subscribe((data) => {
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
  }

  openConfirmDialog(user: User): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de eliminar este usuario?',
      message: 'El usuario será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (user.id){
            this.deleteUser(user);
        }
      }
    });
  }

  deleteUser(user: User) {
  if (user.id){
    this.userService.deleteUser(user, this.token).subscribe(
      (response) => {
        // Remove the deleted user from the dataSource
        const data = this.dataSource.data;
        this.dataSource.data = data.filter((u) => u.id !== user.id);

        this.toastService.showSuccess('Usuario eliminado con exito', 'Aceptar');
      },
      (error) => {
        this.toastService.showError(error.error.message, 'Cerrar');
      }
      ); 
    }
  }

  editUser(id: string) {
    this.router.navigate([`/users/user/${id}/edit`]);
  }

  seeUser(id: string) {
    this.router.navigate([`/users/user/${id}/`]);
  }

  addUser() {
    this.router.navigate(['/users/user/create']);
  }
}
