import { Component, Input, OnInit } from '@angular/core';
import { ShareDataService } from '../share-data.service';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.css']
})
export class CreateQuestionComponent implements OnInit {
  @Input()
  id: any;

  constructor(public data: ShareDataService) { }

  ngOnInit(): void {
  }

}
