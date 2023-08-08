import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

export interface User {
  _id: string;
  email: string;
  name: string;
  isActive: boolean;
  roles: string[];
  __v: number;
}


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  displayedColumns: string[] = ['_id', 'email', 'name', 'isActive', 'roles', 'actions'];
  dataSource = new MatTableDataSource<User>();

  
}
