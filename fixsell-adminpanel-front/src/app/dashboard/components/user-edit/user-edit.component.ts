import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../users/users.component';
import swal from 'sweetalert2';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})



export class UserEditComponent {
  user: User;
  _id: string = '';
  email: string = '';
  name: string = '';
  password: string = '';
  isActive: boolean = false;
  userForm!: FormGroup;
  userId!: string;
  roles = ['user', 'admin', 'vendor'];
  showNewPassword = false;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {
    this.user = history.state.user;
    console.log('State data:', history.state);
    console.log('user data:', this.user);
  }


  ngOnInit() {
    this.user = history.state.user;
    this.userId = this.user._id;
    this.userForm = new FormGroup({
      email: new FormControl(this.user.email, [Validators.required, Validators.email]),
      name: new FormControl(this.user.name, Validators.required),
      password: new FormControl(this.user.password, Validators.required),
      isActive: new FormControl(this.user.isActive),
      roles: new FormControl(this.user.roles)
    });



  
  }

 

  toggleRoles(role: string) {
    const roles = this.userForm.get('roles')?.value || [];
    if (Array.isArray(roles)) { // Check if roles is an array
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

  toggleActive() {
    const isActive = this.userForm.get('isActive')?.value || false;
    this.userForm.patchValue({ isActive: !isActive });
  }
 
  

  onSubmit() {
    const user = this.userForm.value;
    //log what is being submitted 
    console.log('Submitting:', user);
    //log as json text only 
    console.log('Submitting:', JSON.stringify(user));

    // Send a PATCH request to update the user data
    this.http.patch(`http://localhost:3000/auth/${this.userId}`, user).subscribe(
      (response) => {
        //log response
        console.log('patching with:', response)
        console.log('User updated successfully', response);
        // Reset the form
        //this.userForm.reset();
        // Show a success message
        swal.fire({
          title: 'User updated successfully',
          icon: 'success'
        });
        // Navigate back to the users list
        this.router.navigate(['/dashboard/users']);
      },
      (error) => {
        console.error('Error updating user', error);
      }
    );
  }

  
  showNewPasswordFields() {
    this.showNewPassword = !this.showNewPassword;
  }

}