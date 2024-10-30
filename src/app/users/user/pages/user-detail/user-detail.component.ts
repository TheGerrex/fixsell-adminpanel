import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/auth/interfaces';
import { UsersService } from 'src/app/users/services/users.service';
import { ToastService } from './../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  isLoadingForm = false;
  token = localStorage.getItem('token') || '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UsersService,
    private dialog: MatDialog,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        const token = localStorage.getItem('token');
        if (token) {
          this.userService.getUser(id, token).subscribe((user) => {
            this.user = user;
          });
        }
      }
    });
  }

  navigateToEditUser(user: User) {
    this.router.navigate(['/users/user', user.id, 'edit']);
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
        if (user.id) {
          this.deleteUser(user);
        }
      }
    });
  }

  deleteUser(user: User) {
    if (user.id) {
      this.userService.deleteUser(user, this.token).subscribe(
        (response) => {
          this.router.navigate(['/users/user']);
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
}
