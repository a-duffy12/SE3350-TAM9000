import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { InstructorViewComponent } from './instructor-view/instructor-view.component';
import { CreateQuestionComponent } from './create-question/create-question.component';
import { CourseSearchComponent } from './course-search/course-search.component';
import { MatchingComponent } from './matching/matching.component';
import { ApplicationComponent } from './application/application.component';

const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'home', component: InstructorViewComponent },
    { path: 'question', component: CreateQuestionComponent },
    { path: 'course', component: CourseSearchComponent },
    { path: 'matching', component: MatchingComponent },
    {path: 'application', component: ApplicationComponent},
    { path: '**', redirectTo: '', pathMatch: 'full' }
  ]

export const appRoutingModule = RouterModule.forRoot(routes);
