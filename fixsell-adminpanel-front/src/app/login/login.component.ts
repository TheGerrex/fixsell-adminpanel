import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

loginUserData = {email: '', password: ''};
token: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {

  }

  loginUser(){
    console.log(this.loginUserData)
    this.http.post<any>('http://localhost:3000/auth/login', this.loginUserData).subscribe(
      (response) => {
        this.token = response.token;
        console.log('Token:', this.token);
        
      },
      (error) => {
        console.log('Error:', error);
        console.log('Response:', error.error.message);
        alert(error.error.message);
      }
    );
  }
}

