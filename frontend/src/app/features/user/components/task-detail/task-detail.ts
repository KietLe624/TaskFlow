import { Component, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tasks } from '../../../../models/tasks';
import { ChangeDetectorRef } from '@angular/core';
import { Input, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TaskService } from '../../../../core/services/task/task-service';
import { UserAvatarComponent } from '../user-avatar/user-avatar';

@Component({
  selector: 'app-task-detail',
  imports: [CommonModule, UserAvatarComponent],
  templateUrl: './task-detail.html',
  styleUrls: ['./task-detail.css']
})
export class TaskDetailComponent implements OnInit {
  @Input() task_id!: number;
  @Input() task?: Tasks;
  @Output() closed = new EventEmitter<void>();
  isLoading = true;

  constructor(private taskService: TaskService, private toastr: ToastrService) { }

  ngOnInit(): void {
    if (this.task_id) {
      this.loadTaskDetail(this.task_id);
    } else if (this.task) {
      this.isLoading = false;
    } else {
      this.toastr.error('Không có thông tin task để hiển thị chi tiết.');
      this.isLoading = false;
    }
  }

  loadTaskDetail(id: number) {
    this.isLoading = true;
    this.taskService.getTaskById(id).subscribe({
      next: (data: Tasks) => {
        this.task = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  editTask() {
    // Gọi hàm openEditTaskModal từ parent hoặc router
    this.toastr.info('Mở modal sửa task');
  }

  deleteTask() {
    if (confirm('Xóa task này?')) {
      this.taskService.deleteTask(this.task_id).subscribe({
        next: () => this.toastr.success('Xóa task thành công!'),
        error: () => this.toastr.error('Xóa thất bại')
      });
    }
  }

  changeStatus(newStatus: string) {
    this.taskService.updateTask(this.task_id, { status: newStatus }).subscribe({
      next: () => this.toastr.success('Cập nhật trạng thái thành công!'),
      error: () => this.toastr.error('Cập nhật thất bại')
    });
  }

  getColorPriority(priority: string): string {
    switch (priority) {
      case 'low':
        return 'text-green-700 bg-green-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-200';
      case 'high':
        return 'text-red-700 bg-red-200';
      default:
        return 'bg-gray-200';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-200'; // Xanh lá

      case 'in_progress':
        return 'text-blue-700 bg-blue-200'; // Xanh dương

      case 'on_hold':
        return 'text-yellow-700 bg-yellow-200'; // Vàng

      case 'over_due':
        return 'text-red-700 bg-red-200'; // Đỏ

      case 'to_do':
        return 'bg-gray-400'; // Xám

      default:
        return 'bg-gray-400'; // Mặc định
    }
  }

  closeModal() {
    this.closed.emit();   // Phát ra event để parent biết đóng
  }
}
