import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Validator } from '../validator.service';
import { ShareDataService } from '../share-data.service';
import { Subscription, interval, Observable } from 'rxjs';

@Component({
  selector: 'app-matching',
  templateUrl: './matching.component.html',
  styleUrls: ['./matching.component.css']
})
export class MatchingComponent implements OnInit {

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
  prior = ''; // make lower case
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

  // function to generate matches
  generateMatches(): void
  {
    if (this.activeUser && (this.inst || this.admn) && this.catalog && this.subject && this.prior)
    {
      this.courseName = this.subject.toUpperCase() + this.catalog + this.extension.toUpperCase(); // create course name

      this.http.get(`/api/algorithm/${this.courseName}/${this.activeUser}/${this.prior.toLowerCase()}`).subscribe(() => {
        alert(`Generated TA matches for course: ${this.courseName}`);
      }, (err => {
        alert(err.error);
      })
      )
    }
    else
    {
      alert("Invalid input!");
    }
  }

  // function to view matches
  viewMatches(): void
  {
    this.mdata = undefined;
    if (this.activeUser && (this.inst || this.admn) && this.catalog && this.subject && this.prior)
    {
      this.courseName = this.subject.toUpperCase() + this.catalog + this.extension.toUpperCase(); // create course name

      this.http.get(`/api/matches/${this.courseName}/${this.activeUser}`).subscribe((data:any) => {
        this.mdata = data;
        alert(`Retrieved TA matches for course: ${this.courseName}`);
      }, (err => {
        alert(err.error);
      })
      )
    }
    else
    {
      alert("Invalid input!");
    }
  }

  ngOnInit(): void {
  }

}
