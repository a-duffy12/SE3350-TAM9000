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
  catalogSearch = '';
  subjectSearch = '';
  extensionSearch = '';
  hours=0;
  numOldStudent=0;
  numStudent=0;
  newHours=0;
  desc=''; // make descriptions upper case before sending to back end
  inName='';
  inEmail='';
  email = '';
  courseCode = '';
  rank = '';
  rdata: any;
  requireTA: boolean = true;
  requireTA2: boolean = true;
  labelPosition: 'before' | 'after' = 'before';

  courseCatalog = '';
  courseCodeAuto = '';
  courseExt = '';
  inst = false;
  admn = false;

  cataloga = ''; // make upper case
  subjecta = ''; // make upper case
  extensiona = ''; // make upper case
  catalogq = ''; // make upper case
  subjectq = ''; // make upper case
  extensionq = ''; // make upper case

  fileError = false;
  fileToUpload: File;

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

  // function to view applicants for their course
  viewApplicants(): void {
    this.rdata = undefined;
    if (this.activeUser && (this.inst || this.admn) && this.subjecta && this.cataloga)
    {
      const courseName = this.subjecta + this.cataloga + this.extensiona; // create course inName
      this.http.get(`/api/rank/${courseName.toUpperCase()}/${this.activeUser}`).subscribe((data:any) => {
        this.rdata = data;
        alert(`Retrieved TA applications for course: ${courseName.toUpperCase()}`);
      }, (err => {
        alert(err.error);
      }));
    }
  }

  // function to rank applicants for their course
  rankApplicant(): void {

    if (this.activeUser && this.inst && this.rank && this.email) // instructors can manually rank applicants
    {
      const body = {
        rank: this.rank,
        email: this.email,
        courseCode: this.courseCode
      }

      this.http.post(`/api/rank/${this.activeUser}`, body, this.options).subscribe(() => {
        alert(`Applicant ${this.email} for ${this.courseCode} ranked ${this.rank}`);
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

  // function to add a course
  addCourse(): void {
    if (this.activeUser && this.admn && this.subject && this.catalog && this.extension && this.hours && this.numOldStudent && this.numStudent && this.desc && this.inName && this.inEmail)
    {

      const courseName = this.subject + this.catalog + this.extension; // create course name
      const body = {
        instructor: this.inName,
        instructorEmail: this.inEmail,
        hours: this.hours,
        enrolledLast: this.numOldStudent,
        enrolled: this.numStudent,
        desc: this.desc.toUpperCase(),
        reqTA: this.requireTA
      }

      this.http.post(`/api/courses/${courseName.toUpperCase()}`, body, this.options).subscribe(() => {
        alert(`Created course with name: ${courseName.toUpperCase()}`);
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

  // fuction to add questions to a course
  addQuestions()
  {
    if (this.activeUser && this.inst && this.subjectq && this.catalogq)
    {
      const courseName = this.subjectq + this.catalogq + this.extensionq; // create course name
      const questions = this.data.questions;
      this.http.post(`/api/questions/${courseName.toUpperCase()}`, questions, this.options).subscribe(() => {
        alert(`Created questions for course: ${courseName.toUpperCase()}`)
      }, (err => {
        alert(err.error);
      }))
    }
    else
    {
      alert("Invalid input!");
    }
  }

  changeTAReq()
  {
    if(this.catalogSearch && this.subjectSearch && this.extensionSearch)
    {
      const courseName = this.subjectSearch + this.catalogSearch + this.extensionSearch;
      this.http.put(`/api/courses/${courseName}/${this.requireTA2}`, null, this.options).subscribe( () => {
        alert(`Changed TA requirement for ${courseName} to ${this.requireTA2}`);
      })
    }
  }

  exportQuestions()
  {
    window.open('/api/download');
    // this.http.get(`/api/download`).subscribe((data:any) => {
    //   console.log(data);
    // })
  }

  // function to override current allocated hours for a course
  Override()
  {
    if (this.activeUser && this.admn && this.subject && this.catalog && this.newHours && this.extension)
    {
      const courseName = this.subject + this.catalog + this.extension; // create course name
      const body = {
        instructor: this.inName,
        instructorEmail: this.inEmail,
        hours: this.newHours,
        enrolledLast: this.numOldStudent,
        enrolled: this.numStudent,
        desc: this.desc.toUpperCase()
      }

      this.http.put(`/api/courses/${courseName.toUpperCase()}`,body, this.options).subscribe(()=>{
        alert(`Current allocated TA hours for : ${courseName.toUpperCase()}`+' have been overridden!')
      }, (err=> {
        alert(err.error);
      }))
    }
    else{
      alert("Invalid input!");
    }

  }

  readFile(fileEvent: any)
  {
    const file = fileEvent.target.files[0];
    if(file.type != "application/vnd.ms-excel" && file.type != "application/csv" && file.type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
      this.fileError = true;
    }
    else{
      this.fileError = false;
      this.fileToUpload = file;
    }
  }

  uploadFile(fileToUpload: File){
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    this.http.post(`/api/upload`, formData).subscribe(() => {
      alert("Upload successful");
    }, error => {
      alert(error)
    })
  }

  ngOnInit(): void {
  }

}
