import { inject } from '@angular/core';
import { CanActivateFn, Router, Route, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth/auth';
import { ToastrService } from 'ngx-toastr';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (!authService.isAdmin()) {
    router.navigate(['/403']);
    return false;
  }

  return true;
};
