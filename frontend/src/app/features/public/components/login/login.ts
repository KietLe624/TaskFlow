import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth'
import { Footer } from "../../../../layout/footer/footer";


@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, Footer, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  constructor(private authService: AuthService, private router: Router) { }

  emailOrUsername: string = '';
  password: string = '';

  errorMessage: string = '';

  onLogin() {
    this.errorMessage = '';
    this.authService.login({
      loginInput: this.emailOrUsername,
      password: this.password,
    }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        console.log('Đăng nhập thành công', res.user);
        this.router.navigate(['/dashboard']).then(() => {
          console.log('Chuyển hướng đến trang dashboard');
        });
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      },
    });

  }
  clearError() {
    this.errorMessage = '';
  }
}
