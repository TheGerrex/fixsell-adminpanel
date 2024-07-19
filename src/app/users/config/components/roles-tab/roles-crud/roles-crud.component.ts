import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
import { EditUserRoleDialogComponent } from 'src/app/shared/components/edit-user-role-dialog/edit-user-role-dialog.component';
import { DeleteUserRoleDialogComponent } from 'src/app/shared/components/delete-user-role-dialog/delete-user-role-dialog.component';
@Component({
  selector: 'app-roles-crud',
  templateUrl: './roles-crud.component.html',
  styleUrls: ['./roles-crud.component.scss'],
})
export class RolesCrudComponent implements OnInit, AfterViewInit {
  rolesDataSource = new MatTableDataSource<Role>();
  rolesDisplayedColumns: string[] = ['name', 'action'];
  filterValue = '';
  isAdmin = false;
  roleData: Role[] = [];
  searchTerm = '';

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
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

  ngAfterViewInit() {
    this.rolesDataSource.sort = this.sort;
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

  deleteRole(role: Role) {
    // open delete-dialog
    const dialogRef = this.dialog.open(DeleteUserRoleDialogComponent, {
      data: {
        id: role.id,
        name: role.name,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getRoles();
    });
  }

  editRole(id: number, role: Role) {
    // Open dialog and pass role name
    const dialogRef = this.dialog.open(EditUserRoleDialogComponent, {
      data: { roleId: id, roleName: role }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      this.getRoles();
    });
  }
  
  saveRole(role: Role) {}

  addRole() {
    //open dialog
    const dialogRef = this.dialog.open(AddUserRoleDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      this.getRoles();
    });
  }
}
