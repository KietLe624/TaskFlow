import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  constructor(private authService: AuthService) { }

  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // 2. Gọi service
    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (res) => {
        // 3. Xử lý thành công
        this.isLoading = false;
        // Hiển thị thông báo (bảo mật) mà backend trả về
        this.successMessage = res.message;
        this.email = ''; // Xóa email khỏi ô input
      },
      error: (err) => {
        // 4. Xử lý lỗi
        // (Mặc dù backend của chúng ta luôn trả về 200,
        //  vẫn nên có để phòng trường hợp server sập 500)
        this.isLoading = false;
        this.errorMessage =
          err.error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      },
    });
  }
}

