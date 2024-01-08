import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../users/users.component';
import swal from 'sweetalert2';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { environment } from 'src/environments/environments';

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
  oldPassword: string = '';
  isActive: boolean = false;
  userForm!: FormGroup;
  userId!: string;
  roles = ['user', 'admin', 'vendor'];
  showNewPassword = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    const userFromState = history.state.user;

    console.log('State data:', history.state);
    console.log('user data:', userFromState);
    // Create a new object with the oldPassword field
    const newUser = {
      ...userFromState,
      oldPassword: userFromState.password,
      password: undefined,
    };

    //parse it to newUser
    this.user = newUser;
    console.log('new user data:', this.user);
  }

  ngOnInit() {
    // this.user = history.state.user;
    this.userId = this.user.id;
    this.userForm = new FormGroup(
      {
        email: new FormControl(this.user.email, [
          Validators.required,
          Validators.email,
        ]),
        name: new FormControl(this.user.name, Validators.required),
        oldPassword: new FormControl(this.user.password, Validators.required),
        isActive: new FormControl(this.user.isActive),
        roles: new FormControl(this.user.roles),
        newPassword: new FormControl('', Validators.required),
        repeatNewPassword: new FormControl('', Validators.required), // Add a repeatPassword form control
      },
      {
        validators: this.passwordMatchValidator, // Add the passwordMatchValidator to the form group
      }
    );
  }

  toggleRoles(role: string) {
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

  //this does something i think... not connected in html, but now it works?!?!
  toggleActive() {
    const isActive = this.userForm.get('isActive')?.value || false;
    this.userForm.patchValue({ isActive: !isActive });
  }

  onSubmit() {
    const user = this.userForm.value;

    const formValues = this.userForm.value;

    //if new password is clicked
    //probably a better way...
    if (formValues.newPassword === '') {
      //set new password to old password
      formValues.newPassword = formValues.oldPassword;
      formValues.repeatNewPassword = formValues.oldPassword;
    }

    const newUser = {
      email: formValues.email,
      oldPassword: formValues.oldPassword,
      newPassword: formValues.newPassword,
      name: formValues.name,
      roles: formValues.roles,
      isActive: formValues.isActive,
    };
    //log what is being submitted
    console.log('Submitting:', user);
    //log as json text only
    console.log('Submitting:', JSON.stringify(user));
    console.log('Submitting new user data:', newUser);

    // if password does not match
    if (user.newPassword !== user.repeatNewPassword) {
      // Show an error message
      swal.fire({
        title: 'Passwords do not match',
        icon: 'error',
      });
      return;
    }

    // Send a PATCH request to update the user data
    this.http
      .patch(`${environment.baseUrl}/auth/${this.userId}`, newUser)
      .subscribe(
        (response) => {
          //log response
          console.log('patching with:', response);
          console.log('User updated successfully', response);
          // Reset the form
          //this.userForm.reset();
          // Show a success message
          swal.fire({
            title: 'User updated successfully',
            icon: 'success',
          });
          // Navigate back to the users list
          this.router.navigate(['/dashboard/users']);
        },
        (error) => {
          console.error('Error updating user', error);
          // console.log(error.message);
          // Show an error message using swal.fire
          swal.fire({
            title: 'Error updating user',
            text: error.error.message,
            icon: 'error',
          });
        }
      );
  }

  showNewPasswordFields() {
    this.showNewPassword = !this.showNewPassword;
  }

  passwordMatchValidator: ValidatorFn = (
    control: AbstractControl
  ): { [key: string]: any } | null => {
    const newPassword = control.get('newPassword');
    const repeatPassword = control.get('repeatPassword');

    if (
      newPassword &&
      repeatPassword &&
      newPassword.value !== repeatPassword.value
    ) {
      return { passwordMismatch: true };
    }

    return null;
  };
}
