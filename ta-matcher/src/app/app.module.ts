import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { appRoutingModule } from './app.routing';
import { Validator } from './validator.service';
import { InstructorViewComponent } from './instructor-view/instructor-view.component'
import { ApplicationComponent } from './application/application.component';
import { CreateQuestionComponent } from './create-question/create-question.component'
import { CourseSearchComponent } from './course-search/course-search.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatchingComponent } from './matching/matching.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    InstructorViewComponent,
    ApplicationComponent,
    CreateQuestionComponent,
    CourseSearchComponent,
    CreateQuestionComponent,
    CourseSearchComponent,
    MatchingComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    appRoutingModule,
    BrowserAnimationsModule,
    MatCheckboxModule
  ],
  providers: [Validator],
  bootstrap: [AppComponent]
})
export class AppModule { }
