import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../../../models/users';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiAuthUrl = 'http://localhost:3000/api/auth';
  private isBrowser: boolean;
  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object, private router: Router) {
    this.isBrowser = this.platformId === 'browser';
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiAuthUrl}/login`, data);
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiAuthUrl}/register`, data);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiAuthUrl}/forgot-password`,
      data
    );
  }

  resetPassword(data: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.apiAuthUrl}/reset-password`,
      data
    );
  }

  isLoggedIn(): boolean {
    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      return !!localStorage.getItem('token');
    }
    return false;
  }
  logout(): void {
    if (this.isBrowser) {
      // Xóa token khỏi localStorage
      localStorage.removeItem('token');
      console.log('Đã đăng xuất, xóa token.');

      // (Tùy chọn) Xóa thông tin user đang lưu trong service (nếu có)
      // this.currentUser = null;

      // Điều hướng về trang login
      this.router.navigate(['/login']);
    }
  }
}
