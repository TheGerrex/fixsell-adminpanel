import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.scss']
})
export class UsersTableComponent implements OnInit {
  userForm!: FormGroup;
  roles = ['user', 'admin'];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      isActive: [false],
      roles: ['user']
    });
  }

  onSubmit() {
    // Handle form submission here
  }

  toggleRole(role: string) {
    const roles = this.userForm.get('roles')?.value || [];
    const index = roles.indexOf(role);
    if (index >= 0) {
      roles.splice(index, 1);
    } else {
      roles.push(role);
    }
    this.userForm.get('roles')?.setValue(roles);
  }
}