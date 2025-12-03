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
    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message;
        this.email = ''; // Xóa email khỏi ô input
      },
      error: (err) => {

        this.isLoading = false;
        this.errorMessage =
          err.error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      },
    });
  }
}

