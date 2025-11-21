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
import { PageProjectDetailComponent } from './features/user/components/page-project-detail/page-project-detail';
import { TaskComponent } from './features/user/components/task/task';
import { ProfileComponent } from './features/user/components/profile/profile';

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
      { path: 'projects/:id', component: PageProjectDetailComponent, data: { title: 'Project Detail' } },
      { path: 'tasks', component: TaskComponent, data: { title: 'Tasks' } },
      { path: 'tasks/:id', component: TaskComponent, data: { title: 'Task Detail' } },
      { path: 'profile', component: ProfileComponent, data: { title: 'Profile' } }
    ]
  },

  { path: '', redirectTo: '/app', pathMatch: 'full' }
];



