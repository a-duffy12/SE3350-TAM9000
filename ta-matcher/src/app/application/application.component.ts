import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription, interval} from 'rxjs';
import { Validator } from '../validator.service';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {

  options = [{display: "Yes", value: true}, {display:"No", value: false}];
  @Input() course: string | undefined;
  @Input() courseTaken: Boolean | undefined;
  @Input() courseLoc: string | undefined;
  @Input() courseTAd: Boolean | undefined;
  @Input() prevExp: string | undefined;

  sub: Subscription;
  activeUser = "";
  isStudent: Boolean = false;

  constructor(private http: HttpClient, public validator: Validator) {
    this.sub = interval(100).subscribe(() => {
      this.activeUser = this.validator.getActiveUser();

      if (this.activeUser)
      {
        // check to see if this user is a student
        this.http.get(`/api/users/${this.activeUser}`).subscribe((data:any) => {
          if (data.type === "student") // if user is a student
          {
            this.isStudent = true;
          }
          else // if user is not a student
          {
            this.isStudent = false;
          }
        })
      }
    });
  }

  ngOnInit(): void {
  }

  submitApplication(){
    console.log(this.course);
    console.log(this.courseTaken);
    console.log(this.courseLoc);
    console.log(this.courseTAd);
    console.log(this.prevExp);
  }

}
