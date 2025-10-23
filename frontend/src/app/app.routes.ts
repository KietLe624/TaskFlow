import { Routes } from '@angular/router';
import { PublicPageComponent } from './features/public/components/public-page/public-page';
import { LoginComponent } from './features/public/components/login/login';
import { RegisterComponent } from './features/public/components/register/register';
import { ResetPasswordComponent } from './features/public/components/reset-password/reset-password';
import { ForgotPasswordComponent } from './features/public/components/forgot-password/forgot-password';
import { DashboardComponent } from './features/user/components/dashboard/dashboard';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth-guard';
import { ProjectsComponent } from './features/user/components/projects/projects';


export const routes: Routes = [
  { path: '', component: PublicPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent },

  {
    path: 'app', component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' } },
      { path: 'projects', component: ProjectsComponent, data: { title: 'Projects' } },
    ]
  },
  
  { path: '', redirectTo: '/app', pathMatch: 'full' }
];



