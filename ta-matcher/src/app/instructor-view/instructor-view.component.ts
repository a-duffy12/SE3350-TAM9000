import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Validator } from '../validator.service';
import { Subscription, interval, Observable } from 'rxjs';


@Component({
  selector: 'app-instructor-view',
  templateUrl: './instructor-view.component.html',
  styleUrls: ['./instructor-view.component.css']
})
export class InstructorViewComponent implements OnInit {

  sub: Subscription;
  activeUser = '';
  instruct = false;
  catalog = ''; // make upper case
  subject = ''; // make upper case
  extension = ''; // make upper case
  instructor=''; // get from active account
  instructorEmail=''; // get from active account
  hours=0;
  numstudent=0;
  desc=''; // make descriptions upper case before sending to back end

  constructor(private http: HttpClient, private val: Validator)
  {
    // every second, update the active user variable
    this.sub = interval(100).subscribe(() => {
      this.activeUser = this.val.getActiveUser();

      if (this.activeUser)
      {
        // check to see if this user is an instructor
        this.http.get(`/api/users/${this.activeUser}`).subscribe((data:any) => {
          if (data.type === "instructor") // if user is an admin
          {
            this.instruct = true; // reveal admin level content
          }
          else // if user is not an admin
          {
            this.instruct = false; // hide admin level content
          }
        })
      }
      console.log(this.instruct);
    });
  }

  ngOnInit(): void {
  }

}
