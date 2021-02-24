import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Validator } from '../validator.service';

@Component({
  selector: 'app-course-search',
  templateUrl: './course-search.component.html',
  styleUrls: ['./course-search.component.css']
})
export class CourseSearchComponent implements OnInit {

  header = { 'Content-Type': 'application/json' };
  options = ({ headers: this.header });

  std = false;
  cdata1: any;
  cdata2: any;
  cdata3: any;
  subject = '';
  catalog = '';
  extension = '';
  key = '';

  constructor(private http: HttpClient, private val: Validator) { }

  searchAll(): void {
    this.reset();

    this.http.get(`/api/courses`).subscribe((data:any) => {
      this.cdata1 = data;
      alert(`Searched all courses`);
    })
  }

  searchName(): void {
    this.reset();

    if (this.subject && this.catalog && this.extension && this.val.validate(this.subject, 4) && this.val.validate(this.catalog, 4) && this.val.validate(this.extension, 1))
    {
      let name = this.subject + this.catalog + this.extension;

      this.http.get(`/api/courses/${name.toUpperCase()}`).subscribe((data:any) => {
        this.cdata2 = data;
        alert(`Searched for course with name: ${name.toUpperCase()}`);
      })
    }
    else
    {
      alert(`Invalid input!`);
    }
  }

  searchDesc(): void {
    this.reset();

    if (this.key && this.val.validate(this.key, 100))
    {
      this.http.get(`/api/courses/key/${this.key.toUpperCase()}`).subscribe((data:any) => {
        this.cdata3 = data;
        alert(`Searched for course using keyword: ${this.key.toUpperCase()}`);
      })
    }
    else
    {
      alert(`Invalid input!`);
    }
  }

  reset(): void { // reset output variables
    this.cdata1 = undefined;
    this.cdata2 = undefined;
    this.cdata3 = undefined;
  }

  ngOnInit(): void {
  }

}
