import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Role } from 'src/app/users/interfaces/users.interface';
import { ConfigService } from '../../../services/config.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AddUserRoleDialogComponent } from 'src/app/shared/components/add-user-role-dialog/add-user-role-dialog.component';
import { EditUserRoleDialogComponent } from 'src/app/shared/components/edit-user-role-dialog/edit-user-role-dialog.component';
import { DeleteUserRoleDialogComponent } from 'src/app/shared/components/delete-user-role-dialog/delete-user-role-dialog.component';
import { UsersService } from 'src/app/users/services/users.service';
@Component({
  selector: 'app-roles-crud',
  templateUrl: './roles-crud.component.html',
  styleUrls: ['./roles-crud.component.scss'],
})
export class RolesCrudComponent implements OnInit, AfterViewInit {
  rolesDisplayedColumns: string[] = ['name', 'action'];
  rolesDataSource = new MatTableDataSource<Role>();
  filterValue = '';
  isAdmin = false;
  roleData: Role[] = [];
  token: string = '';
  searchTerm = '';

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private configService: ConfigService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.token = this.userService.getToken();
    this.getRoles();
    const userRoles = this.authService.getCurrentUserRoles();
    this.isAdmin = userRoles.includes('admin');
    if (!this.isAdmin) {
      this.rolesDisplayedColumns = ['name'];
    }
  }

  ngAfterViewInit() {
    this.rolesDataSource.sort = this.sort;
    this.rolesDataSource.paginator = this.paginator;
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

  saveRole(role: Role) { }

  addRole() {
    //open dialog
    const dialogRef = this.dialog.open(AddUserRoleDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      this.getRoles();
    });
  }
}
