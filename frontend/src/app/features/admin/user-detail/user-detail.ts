import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-detail.html',
  styleUrls: ['./user-detail.css']
})
export class UserDetailComponent {
  @Input() user: any = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() resetPassword = new EventEmitter<number>();
  @Output() toggleBan = new EventEmitter<number>();
  @Output() changeRole = new EventEmitter<{ userId: number, newRole: string }>();

  selectedRole = '';

  ngOnChanges() {
    if (this.user) {
      this.selectedRole = this.user.roleNames?.[0] || 'member';
    }
  }

  onClose() {
    this.close.emit();
  }

  onResetPassword() {
    this.resetPassword.emit(this.user.user_id);
  }

  onToggleBan() {
    this.toggleBan.emit(this.user.user_id);
  }

  onSaveRole() {
    this.changeRole.emit({ userId: this.user.user_id, newRole: this.selectedRole });
  }

  //delete
  // Thêm biến
  showDeleteConfirm = false;
  deleting = false;
  @Output() delete = new EventEmitter<number>(); // emit user_id khi xóa

  openDeleteConfirm() {
    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    if (!this.user?.user_id) return;
    this.deleting = true;
    this.delete.emit(this.user.user_id);
  }
}
