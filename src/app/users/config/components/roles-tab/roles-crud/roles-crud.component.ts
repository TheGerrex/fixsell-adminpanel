import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Role } from 'src/app/users/interfaces/users.interface';
//src\app\website\config\services\brand.service.ts
import { ConfigService } from '../../../services/config.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { AddPrinterBrandDialogComponent } from 'src/app/shared/components/add-printer-brand-dialog/add-printer-brand-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { AddUserRoleDialogComponent } from 'src/app/shared/components/add-user-role-dialog/add-user-role-dialog.component';
@Component({
  selector: 'app-roles-crud',
  templateUrl: './roles-crud.component.html',
  styleUrls: ['./roles-crud.component.scss'],
})
export class RolesCrudComponent implements OnInit {
  rolesDataSource = new MatTableDataSource<Role>();
  rolesDisplayedColumns: string[] = ['name', 'action'];
  dataSource = new MatTableDataSource<Role>();
  filterValue = '';
  isAdmin = false;
  roleData: Role[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private configService: ConfigService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getRoles();

    const userRoles = this.authService.getCurrentUserRoles();
    this.isAdmin = userRoles.includes('admin');
    if (!this.isAdmin) {
      this.rolesDisplayedColumns = ['name'];
    }
  }

  getRoles() {
    this.configService.getRoles().subscribe((roles: Role[]) => {
      this.rolesDataSource.data = roles;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.rolesDataSource.filter = filterValue.trim().toLowerCase();
  }

  deleteRole(id: number, role: Role) {
    // open confirm-dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete role',
        message: `Seguro que quieres elimnar la marca ${role}?`,
        buttonText: { cancel: 'Cancelar', ok: 'Si' },
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.configService.deleteRole(id).subscribe(() => {
          this.getRoles();
        });
      }
    });
  }

  editRole(role: Role) {}

  addRole() {
    //open dialog
    const dialogRef = this.dialog.open(AddUserRoleDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      this.getRoles();
    });
  }
}
