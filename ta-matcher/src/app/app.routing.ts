import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    // otherwise redirect to home
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

export const appRoutingModule = RouterModule.forRoot(routes);