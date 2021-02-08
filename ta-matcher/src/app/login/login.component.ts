import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Account } from '../account'
import { Validator } from '../validator.service'
import { Subscription, interval, Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  account: Account | undefined;

  header = { 'Content-Type': 'application/json' };
  options = ({ headers: this.header });

  email = '';
  password = '';
  passwordCheck = '';
  fName = '';
  lName = '';
  type = '';
  id = 0;
  hours: any;
  ass: any;

  sub: Subscription;
  activeUser = '';
  loggedIn = false;

  constructor(private http: HttpClient, private val: Validator) {
    this.sub = interval(100).subscribe(() => {
      this.activeUser = this.val.getActiveUser();
      if (this.activeUser != "")
      {
        this.loggedIn = true;
      }
    })
   }

  loginUser(): void {
    if (this.email && this.password) {
      const body = {
        email: this.email,
        password: this.password
      };

      this.http.post<Account>(`/api/users/login/${this.email}`, body, this.options).subscribe(() => {
        alert('User logged in successfully');
        this.loggedIn = true;
        this.activeUser = this.email;
        this.val.setActiveUser(this.email);
      }, (err => {
        alert(err.error);
      }));
    }
    else {
      alert('Missing inputs!');
    }
  }

  logoutUser(): void {
    this.loggedIn = false;
    this.activeUser = '';
    this.val.setActiveUser('');
  }

  newUser(): void {

    if (this.val.validateNum(this.id, 0, 999999999) && this.password == this.passwordCheck && this.type == ("student" || "instructor") && String(this.id).length == 9)
    {

      if (this.type == "student")
      {
        this.hours = 0;
        this.ass = false;
      }
      else if (this.type == "instructor")
      {
        this.hours = null;
        this.ass = null;
      }

      const body = {
        password: this.password,
        fName: this.fName,
        lName: this.lName,
        idNo: this.id,
        type: this.type,
        hours: this.hours,
        isAssigned: this.ass
      }

      this.http.post(`/api/users/${this.email}`, body, this.options).subscribe(() => {
        alert('User account created successfully, please log in')
      }, (err => {
        alert(err.error);
      }))
    }
    else {
      alert('Missing or incorrect inputs!');
    }
  }

  ngOnInit(): void {
  }

}
