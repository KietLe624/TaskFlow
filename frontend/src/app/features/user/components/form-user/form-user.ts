import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProfileData } from '../../../../models/profile';
import { AuthService } from '../../../../core/services/auth/auth';
import { UserService } from '../../../../core/services/user/user-service';
import { ToastrService } from 'ngx-toastr';
import { ChangePasswordRequest } from '../../../../models/users';

@Component({
  selector: 'app-form-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-user.html',
  styleUrls: ['./form-user.css']
})
export class FormUserComponent implements OnInit {

  constructor(private authService: AuthService, private userService: UserService, private toastr: ToastrService) { }
  private fb = inject(FormBuilder);
  profile: ProfileData | null = null;
  loading = true;
  saving = false;

  @Output() onClose = new EventEmitter<void>();

  // Form chỉnh sửa thông tin
  profileForm = this.fb.group({
    full_name: [''],
    phone_number: [''],
    address: ['']
  });

  passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
    const newPass = control.get('newPassword')?.value;
    const confirmPass = control.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  };

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  ngOnInit(): void {
    const userId = this.authService.getUserIdFromToken();
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (data) => {
          this.profile = data;
          this.profileForm.patchValue({
            full_name: data.user.full_name || '',
            phone_number: data.user.phone_number || '',
            address: data.user.address || ''
          });
          this.loading = false;
        },
        error: () => {
          this.toastr.error('Không thể tải thông tin người dùng');
          this.loading = false;
        }
      });
    }
  }

  onUpdateProfile() {
    if (this.profileForm.invalid || !this.profile) return;

    this.saving = true;
    const updateData = this.profileForm.value;
    this.userService.updateUser(this.profile.user.user_id, updateData).subscribe({
      next: () => {
        this.toastr.success('Cập nhật thông tin thành công');
        this.saving = false;
        this.profile = { ...this.profile!, user: { ...this.profile!.user, ...updateData } };
      },
      error: (err) => {
        this.toastr.error('Cập nhật thông tin thất bại: ' + err.error.message);
        this.saving = false;
      }
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;

    this.saving = true;

    const payload: ChangePasswordRequest = {
      email: this.profile?.user.email ?? '', // nếu profile chưa load thì rỗng
      oldPassword: this.passwordForm.get('currentPassword')?.value ?? '',
      newPassword: this.passwordForm.get('newPassword')?.value ?? ''
    };

    this.authService.changePassword(payload).subscribe({
      next: () => {
        this.toastr.success('Đổi mật khẩu thành công!');
        this.passwordForm.reset();
        this.saving = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Đổi mật khẩu thất bại');
        this.saving = false;
      }
    });
  }
}

