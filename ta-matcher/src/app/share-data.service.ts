import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {
  numQuestions = new Array();
  questions = new Array();
  constructor() { }

  addQuestion(){
    this.numQuestions.push({num:this.numQuestions.length, display:`Question ${this.numQuestions.length+1}`});
    this.questions.push("");
  }

  removeQuestion(){
    this.numQuestions.pop();
    this.questions.pop();
  }
}
