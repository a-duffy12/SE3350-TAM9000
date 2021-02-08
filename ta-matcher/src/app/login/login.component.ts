import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Account } from '../account'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private http: HttpClient) { }

  account: Account | undefined;

  header = { 'Content-Type': 'application/json' };
  options = ({ headers: this.header });

  email = '';
  password = '';

  loginUser(): void {
    const body = {
      email: this.email,
      password: this.password
    };

    this.http.post<Account>(`/api/users/login/${this.email}`, body, this.options).subscribe(() => {
      alert('User logged in successfully');
    }, (err => {
      alert(err.error);
    }));
  }

  ngOnInit(): void {
  }

}
