// user-list.component.ts
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Role, User } from 'src/app/users/interfaces/users.interface';
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
  displayedColumns: string[] = ['name', 'email', 'role', 'isActive'];
  dataSource = new MatTableDataSource<User>();
  filterValue = '';
  userData: User[] = [];
  token: string = '';
  searchTerm = '';
  isLoading = false;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Permission flags
  canEditUser: boolean = false;
  canDeleteUser: boolean = false;
  canAddUser: boolean = false;
  canViewUserDetails: boolean = false;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private userService: UsersService,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.token = this.userService.getToken();
    this.getAllUsersData();
    this.initializePermissions();
    this.isLoading = false;
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Initializes user permissions by checking with AuthService.
   */
  initializePermissions(): void {
    this.canEditUser = this.authService.hasPermission('canUpdateUser');
    this.canDeleteUser = this.authService.hasPermission('canDeleteUser');
    this.canAddUser = this.authService.hasPermission('canCreateUser');
    this.canViewUserDetails = this.authService.hasPermission('canViewUser');

    // Conditionally add 'action' column based on permissions
    if (this.canEditUser || this.canDeleteUser) {
      if (!this.displayedColumns.includes('action')) {
        this.displayedColumns.push('action');
      }
    }
  }

  /**
   * Applies filter to the data table based on user input.
   * @param event The input event containing the filter value.
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Retrieves the role name in lowercase.
   * @param role The Role object.
   * @returns The role name in lowercase.
   */
  getRoleName(role: Role): string {
    return role.name ? role.name.toLowerCase() : '';
  }

  /**
   * Fetches all users data from the server.
   */
  getAllUsersData() {
    this.userService.getUsers(this.token).subscribe(
      (data) => {
        console.log(data);
        // Save to userData
        this.userData = data;

        this.dataSource = new MatTableDataSource(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        this.dataSource.filterPredicate = (data: User, filter: string) => {
          const dataStr =
            (data.name ?? '') +
            data.email +
            (data.isActive ? 'activo' : 'inactivo') +
            (data.role?.name ?? '');
          return dataStr.toLowerCase().includes(filter);
        };

        // Apply the filter
        this.dataSource.filter = this.filterValue.trim().toLowerCase();
      },
      (error) => {
        console.error('Error fetching users:', error);
        this.toastService.showError('Error al obtener usuarios', 'Cerrar');
        this.isLoading = false;
      },
    );
  }

  /**
   * Opens a confirmation dialog before deleting a user.
   * @param user The user to be deleted.
   */
  openConfirmDialog(user: User): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: '¿Estás seguro de eliminar este usuario?',
      message: 'El usuario será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (user.id) {
          this.deleteUser(user);
        }
      }
    });
  }

  /**
   * Deletes a user and updates the data table.
   * @param user The user to be deleted.
   */
  deleteUser(user: User) {
    if (user.id) {
      this.userService.deleteUser(user, this.token).subscribe(
        (response) => {
          // Remove the deleted user from the dataSource
          const data = this.dataSource.data;
          this.dataSource.data = data.filter((u) => u.id !== user.id);

          this.toastService.showSuccess(
            'Usuario eliminado con éxito',
            'Aceptar',
          );
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        },
      );
    }
  }

  /**
   * Navigates to the edit user page.
   * @param id The ID of the user to edit.
   */
  editUser(id: string) {
    if (this.canEditUser) {
      this.router.navigate([`/users/user/${id}/edit`]);
    } else {
      this.toastService.showError(
        'No tienes permisos para editar usuarios',
        'Cerrar',
      );
    }
  }

  /**
   * Navigates to the user details page.
   * @param id The ID of the user to view.
   */
  seeUser(id: string) {
    if (this.canViewUserDetails) {
      this.router.navigate([`/users/user/${id}/`]);
    } else {
      this.toastService.showError(
        'No tienes permisos para ver detalles de usuarios',
        'Cerrar',
      );
    }
  }

  /**
   * Navigates to the add user page.
   */
  addUser() {
    if (this.canAddUser) {
      this.router.navigate(['/users/user/create']);
    } else {
      this.toastService.showError(
        'No tienes permisos para agregar usuarios',
        'Cerrar',
      );
    }
  }
}
