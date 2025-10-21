import { Routes } from '@angular/router';
import { PublicPageComponent } from './features/public/components/public-page/public-page';
import { LoginComponent } from './features/public/components/login/login';
import { RegisterComponent } from './features/public/components/register/register';
import { ResetPasswordComponent } from './features/public/components/reset-password/reset-password';
import { ForgotPasswordComponent } from './features/public/components/forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', component: PublicPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
];



