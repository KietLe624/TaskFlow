import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth/auth';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {

  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  // Biến cho thông báo
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const tokenFromUrl = params['token'];
      // kiểm tra token có tồn tại không
      if (tokenFromUrl) {
        this.token = tokenFromUrl;
      } else {
        this.errorMessage = 'Đường dẫn không hợp lệ hoặc thiếu token.';
        console.error('Không tìm thấy token trên URL');
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // Kiểm tra xác nhận mật khẩu
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Vui lòng nhập cả hai trường mật khẩu.';
      this.isLoading = false;
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp.';
      this.isLoading = false;
      return;
    }
    if (!this.token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng thử lại từ email.';
      this.isLoading = false;
      return;
    }
    this.authService
      .resetPassword({
        token: this.token,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage =
            res.message + ' Bạn sẽ được chuyển về trang đăng nhập sau 3 giây.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err.error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
        },
      });
  }
}
