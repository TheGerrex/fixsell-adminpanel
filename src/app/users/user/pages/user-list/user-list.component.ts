import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Role, User } from 'src/app/users/interfaces/users.interface';
import { UsersService } from 'src/app/users/services/users.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { TableColumn } from 'src/app/shared/components/data-table/data-table.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  userData: User[] = [];
  token: string = '';
  isLoading = false;

  displayedColumns: string[] = ['name', 'email', 'role', 'isActive', 'action'];

  columns: TableColumn[] = [
    {
      name: 'name',
      label: 'Nombre',
      sortable: true,
    },
    {
      name: 'email',
      label: 'Correo',
      sortable: true,
    },
    {
      name: 'role',
      label: 'Rol',
      sortable: true,
      formatter: (value: any, row: User) => row.role?.name || 'Sin rol',
    },
    {
      name: 'isActive',
      label: 'Estado',
      sortable: true,
      formatter: (value: any, row: User) => ({
        html: true,
        content: row.isActive
          ? '<span class="active-user">ACTIVO</span>'
          : '<span class="inactive-user">INACTIVO</span>',
      }),
    },
  ];

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
  }

  /**
   * Fetches all users data from the server.
   */
  getAllUsersData() {
    this.userService.getUsers(this.token).subscribe(
      (data) => {
        this.userData = data;
        this.isLoading = false;
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
          this.userData = this.userData.filter((u) => u.id !== user.id);
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
   * @param user The user to edit.
   */
  editUser(user: User) {
    this.router.navigate([`/users/user/${user.id}/edit`]);
  }

  /**
   * Navigates to the user details page.
   * @param user The user to view.
   */
  seeUser(user: User) {
    this.router.navigate([`/users/user/${user.id}/`]);
  }

  /**
   * Navigates to the add user page.
   */
  addUser() {
    this.router.navigate(['/users/user/create']);
  }
}
