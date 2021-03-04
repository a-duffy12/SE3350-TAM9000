import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Validator } from '../validator.service';
import { ShareDataService } from '../share-data.service';
import { Subscription, interval, Observable } from 'rxjs';

@Component({
  selector: 'app-instructor-view',
  templateUrl: './instructor-view.component.html',
  styleUrls: ['./instructor-view.component.css']
})
export class InstructorViewComponent implements OnInit {

  header = { 'Content-Type': 'application/json' };
  options = ({ headers: this.header });

  sub: Subscription;
  activeUser = '';
  catalog = ''; // make upper case
  subject = ''; // make upper case
  extension = ''; // make upper case
  instructor=''; // get from active account
  hours=0;
  numOldStudent=0;
  numStudent=0;
  desc=''; // make descriptions upper case before sending to back end
  instructorName='';
  email = '';
  courseCode = '';
  rank = '';

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
            this.instructorName = data.fName + " " + data.lName; // build instructor name
          }
        });
      }
    });
  }

  rankApplicant(): void {
    const body = {
      rank: this.rank,
      email: this.email,
      courseCode: this.courseCode
    }

    this.http.post('/api/rank', body, this.options).subscribe(() => {
      alert(`Applicant ${this.email} for ${this.courseCode} ranked ${this.rank}`);
    }, (err => {
      alert(err.error);
    })
    )
  }

  addCourse(): void {
    if (this.activeUser && this.subject && this.catalog && this.extension && this.hours && this.numOldStudent && this.numStudent && this.desc && this.instructorName)
    {
      const courseName = this.subject + this.catalog + this.extension; // create course name
      const body = {
        instructor: this.instructorName,
        instructorEmail: this.activeUser,
        hours: this.hours,
        enrolledLast: this.numOldStudent,
        enrolled: this.numStudent,
        desc: this.desc.toUpperCase()
      }
      const questions = this.data.questions;

      this.http.post(`/api/courses/${courseName.toUpperCase()}`, body, this.options).subscribe(() => {
        alert(`Created course with name: ${courseName}`);
      }, (err => {
        alert(err.error);
      })
      )

      this.http.post(`/api/questions/${courseName.toUpperCase()}`, questions, this.options).subscribe(() => {
        console.log("Questions created");
      }, (err => {
        console.log(err.error);
      }))
    }
    else
    {
      alert("Invalid input!");
    }
  }

  ngOnInit(): void {
  }

}
