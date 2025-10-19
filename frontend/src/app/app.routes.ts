import { Routes } from '@angular/router';
import { PublicPage } from './features/public/public-page/public-page';
import { Login } from './features/public/login/login';

export const routes: Routes = [
  { path: '', component: PublicPage, },
  { path: 'login', component: Login },
];
