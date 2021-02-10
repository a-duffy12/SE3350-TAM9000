import { Component, Input, OnInit } from '@angular/core';
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

  constructor(public validator: Validator) {
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
