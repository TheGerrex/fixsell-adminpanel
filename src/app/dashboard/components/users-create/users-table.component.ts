import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.scss'],
})
export class UsersTableComponent implements OnInit {
  userForm!: FormGroup;
  roles = ['user', 'admin', 'vendor'];

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {
    this.userForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      roles: [[]],
    });
  }

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      password: ['', Validators.required],
      isActive: [false],
      roles: [[]],
    });
  }

  onSubmit() {
    const user = this.userForm.value;
    this.http.post(`${environment.baseUrl}/auth/register`, user).subscribe(
      (response) => {
        console.log('User created successfully', response);
        // Reset the form
        this.userForm.reset();
      },
      (error) => {
        console.error('Error creating user', error);
      }
    );
  }

  toggleRole(role: string) {
    const roles = this.userForm.get('roles')?.value || [];
    if (Array.isArray(roles)) {
      // Check if roles is an array
      const index = roles.indexOf(role);
      if (index >= 0) {
        roles.splice(index, 1);
      } else {
        roles.push(role);
      }
      this.userForm.patchValue({ roles });
    } else {
      console.error('Roles is not an array:', roles);
    }
  }
}
