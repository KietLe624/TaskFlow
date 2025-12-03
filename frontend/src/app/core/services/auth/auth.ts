import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, MyJwtPayload } from '../../../models/users';
import { Router } from '@angular/router';
import { JwtPayload, jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiAuthUrl = (window as any).__env?.apiUrl ? `${(window as any).__env.apiUrl}/api/auth` : 'http://localhost:3000/api/auth';
  private isBrowser: boolean;


  private currentUserSubject = new BehaviorSubject<MyJwtPayload | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object, private router: Router) {
    this.isBrowser = this.platformId === 'browser';
    if (this.isBrowser) {
      this.loadUserFromToken();
    }
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiAuthUrl}/login`, data);
  }

  // Tự động đăng nhập nếu có token trong localStorage
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();
  autoLogin() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user_info');

    if (token && userStr) {
      const user = JSON.parse(userStr);
      this.userSubject.next(user);
    } else {
      this.userSubject.next(null);
    }
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

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiAuthUrl}/changePassword`, data, { headers: this.getAuthHeaders() });
  }

  isLoggedIn(): boolean {
    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      return !!localStorage.getItem('token');
    }
    return false;
  }

  setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
      this.loadUserFromToken();
    }
  }

  private loadUserFromToken(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.currentUserSubject.next(null);
      return;
    }

    try {
      const decoded = jwtDecode<MyJwtPayload>(token);

      // Kiểm tra token hết hạn
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        console.warn('Token đã hết hạn');
        this.logout();
        return;
      }

      this.currentUserSubject.next(decoded);
    } catch (error) {
      console.error('Token không hợp lệ:', error);
      this.logout();
    }
  }

  get currentUserValue(): MyJwtPayload | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    if (!user?.roles) return false;
    return user.roles.includes('admin');
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      console.log('Đã đăng xuất, xóa token.');
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  getUserIdFromToken(): number {
    const token = localStorage.getItem('token');
    if (!token) return 0;
    try {
      const decoded = jwtDecode<MyJwtPayload>(token);
      return decoded.user_id;
    } catch {
      return 0;
    }
  }

  getUserRoles(): string[] {
    return this.currentUserValue?.roles || [];
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }
}
