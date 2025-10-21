import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Footer } from '../../../../layout/footer/footer';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule, Footer],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

  onRegister() {
    // Registration logic here
    this.errorMessage = '';
    if(!this.username || !this.email) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Vui lòng xác nhận lại mật khẩu';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự';
      return;
    }

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        console.log('Đăng ký thành công', res.user);
        this.router.navigate(['/login']).then(() => {
          console.log('Chuyển hướng đến trang đăng nhập');
        });
      },
      error: (err) => this.errorMessage = err.message
    });
  }
  clearError() {
    this.errorMessage = '';
  }
}
