import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
//mat button
import { MatButtonModule } from '@angular/material/button';
import swal from 'sweetalert2';
import { Router } from '@angular/router';

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
  displayedColumns: string[] = ['_id', 'email', 'name', 'isActive', 'roles', 'edit', 'delete'];
  dataSource = new MatTableDataSource<User>();

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    //gets users and sends auth token in header to verify user 
    this.http.get<User[]>('http://localhost:3000/auth', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') || '' } }).subscribe(data => {
      console.log(data);
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
    }, err => {
      console.log(err);
    }
    );
  }



  editUser(user: User){
    // Implement edit functionality here
    this.router.navigate(['/dashboard/edit-user']);
  }

  deleteUser(user: User) {
    //implement delete functionality here
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then(async (result) => {
      if (result.value) {
        try {
          await this.http.delete(`http://localhost:3000/auth/${user._id}`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') || '' } }).toPromise();
          swal.fire(
            'Deleted!',
            'Your user has been deleted.',
            'success'
          );
          this.dataSource.data = this.dataSource.data.filter(({ _id }) => _id !== user._id);
        } catch (err) {
          swal.fire(
            'Error!',
            'Your user could not be deleted.',
            'error'
          );
        }
      } else if (result.dismiss === swal.DismissReason.cancel) {
        swal.fire(
          'Cancelled',
          'Your user is safe :)',
          'error'
        );
      }
    }
    );
  }
  createUser() {
    this.router.navigate(['/dashboard/users-table']);
  }
}
