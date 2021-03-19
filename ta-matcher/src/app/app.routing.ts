import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { InstructorViewComponent } from './instructor-view/instructor-view.component';
import { CreateQuestionComponent } from './create-question/create-question.component';
import { CourseSearchComponent } from './course-search/course-search.component';

const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'home', component: InstructorViewComponent },
    { path: 'question', component: CreateQuestionComponent },
    { path: 'course', component: CourseSearchComponent },
    // otherwise redirect to home
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

export const appRoutingModule = RouterModule.forRoot(routes);