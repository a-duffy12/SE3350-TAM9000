import { Component, Input, OnInit } from '@angular/core';
import { ShareDataService } from '../share-data.service';
import { HttpClient } from '@angular/common/http';
import { Validator } from '../validator.service';
import { Subscription, interval, Observable } from 'rxjs';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.css']
})
export class CreateQuestionComponent implements OnInit {
  @Input()
  id: any;
  boolean = [{display: "Yes", value: true}, {display: "No", value: false}]

  header = { 'Content-Type': 'application/json' };
  options = ({ headers: this.header });

  sub: Subscription;
  activeUser = '';
  rdata: any;

  inst = false;
  admn = false;

  catalogq = ''; // make upper case
  subjectq = ''; // make upper case
  extensionq = ''; // make upper case

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

  exportQuestions()
  {
    window.open('/api/download');
    // this.http.get(`/api/download`).subscribe((data:any) => {
    //   console.log(data);
    // })
  }

  ngOnInit(): void {
  }

}
