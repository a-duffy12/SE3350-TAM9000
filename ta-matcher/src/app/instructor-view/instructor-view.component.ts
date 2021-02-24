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

  header = { 'Content-Type': 'application/json' };
  options = ({ headers: this.header });

  sub: Subscription;
  activeUser = '';
  catalog = ''; // make upper case
  subject = ''; // make upper case
  extension = ''; // make upper case
  instructor=''; // get from active account
  hours=0;
  numStudent=0;
  desc=''; // make descriptions upper case before sending to back end
  instructorName='';

  constructor(private http: HttpClient, private val: Validator)
  {
    // every second, update the active user variable
    this.sub = interval(100).subscribe(() => {
      this.activeUser = this.val.getActiveUser();
    });
  }

  addCourse(): void {
    if (this.activeUser && this.subject && this.catalog && this.extension && this.hours && this.numStudent && this.desc && this.instructorName)
    {
      const courseName = this.subject + this.catalog + this.extension; // create course name
      const body = {
        instructor: this.instructorName,
        instructorEmail: this.activeUser,
        hours: this.hours,
        enrolled: this.numStudent,
        desc: this.desc.toUpperCase()
      }

      this.http.post(`/api/courses/${courseName.toUpperCase()}`, body, this.options).subscribe(() => {
        alert(`Created course with name: ${courseName}`);
      }, (err => {
        alert(err.error);
      })
      )
    }
  }

  ngOnInit(): void {
  }

}
