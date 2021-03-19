import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Validator } from './validator.service';
import { ShareDataService } from './share-data.service';
import { Subscription, interval, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ta-matcher';

  sub: Subscription;
  activeUser = '';

  inst = false;
  admn = false;

  constructor(private http: HttpClient, private val: Validator, public data: ShareDataService, private router: Router)
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

  ngOnInit(): void {
    this.router.navigate(['']);
  }
}
