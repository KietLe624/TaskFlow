import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserAvatarComponent } from '../../user/components/user-avatar/user-avatar';

@Component({
  selector: 'app-form-task-modal',
  imports: [CommonModule, FormsModule, UserAvatarComponent],
  templateUrl: './form-task-modal.html',
  styleUrls: ['./form-task-modal.css']
})
export class FormTaskModalComponent {
  // Input nhận từ cha
  @Input() isOpen = false;
  @Input() projectMembers: any[] = []; // Danh sách thành viên của Project để chọn
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  loading = false;

  // Form data
  form = {
    task_name: '',
    description: '',
    status: 'to_do',
    priority: 'medium',
    start_date: new Date().toISOString().split('T')[0], // Mặc định hôm nay
    due_date: '',
    assignee_ids: [] as number[] // Mảng chứa ID người được chọn
  };

  // Hàm kiểm tra xem user có được chọn chưa
  isAssigned(userId: number): boolean {
    return this.form.assignee_ids.includes(userId);
  }

  // Hàm toggle chọn/bỏ chọn
  toggleAssignee(userId: number) {
    const index = this.form.assignee_ids.indexOf(userId);
    if (index > -1) {
      this.form.assignee_ids.splice(index, 1); // Bỏ chọn
    } else {
      this.form.assignee_ids.push(userId); // Chọn
    }
  }

  onSubmit() {
    if (!this.form.task_name.trim()) return;
    this.loading = true;
    this.create.emit(this.form);
    // Reset form hoặc để cha xử lý
  }

  onClose() {
    this.close.emit();
  }
}
