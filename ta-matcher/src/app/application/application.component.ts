import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Validator } from '../validator.service';
import { ShareDataService } from '../share-data.service';
import { Subscription, interval, Observable } from 'rxjs';
@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {

  header = { 'Content-Type': 'application/json' };
  options = ({ headers: this.header });
  mdata = undefined;

  sub: Subscription;
  activeUser = '';
  inst = false;
  admn = false;

  subject = ''; // make upper case
  catalog = ''; // make upper case
  extension = ''; // make upper case
  email = '';
  name = '';
  status = 0;
  newTA = true; // used to select hours
  hours = 0;
  courseRank = 0;
  courseName = '';

  constructor(private http: HttpClient, private val: Validator, public data: ShareDataService)
  {
    // every second, update the active user variable
    this.sub = interval(1000).subscribe(() => {
      this.activeUser = this.val.getActiveUser();

      if (this.activeUser)
      {
        // check to see if this user is an instructor
        this.http.get(`/api/users/${this.activeUser}`).subscribe((data:any) => {

          if (data.type == "instructor")
          {
            this.inst = true;
            this.admn = false;
          }
          else if (data.type == "admin")
          {
            this.admn = true;
            this.inst = false;
          }
        });
      }
      else
      {
        this.inst = false;
        this.admn = false;
      }
    });
  }

  ngOnInit(): void {
  }

  // function to sumbit a TA application
  submitApplication(): void
  {
    if (this.activeUser && this.admn && this.subject && this.catalog && this.email && this.name && this.status && this.courseRank)
    {
      this.courseName = this.subject.toUpperCase() + this.catalog + this.extension.toUpperCase(); // create course name

      if (this.newTA) // never TAed before
      {
        this.hours = 5;
      }
      else if (!this.newTA) // has TAed before
      {
        this.hours = 10;
      }

      let body = {
        name: this.name,
        status: this.status,
        hours: this.hours,
        courseRank: this.courseRank
      }

      this.http.post(`/api/application/${this.courseName}/${this.email}`, body, this.options).subscribe(() => {
        alert(`Submitted a TA application for candidate ${this.email} to TA ${this.courseName}`);
      }, (err => {
        alert(err.error);
      })
      )
    }
  }

}
