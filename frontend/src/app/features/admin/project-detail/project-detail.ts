import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserAvatarComponent } from '../../user/components/user-avatar/user-avatar';
import { ProjectStatusPipe } from '../../../pipes/project-status-pipe';
import { ProjectPriorityPipe } from '../../../pipes/project-priority-pipe';
import { AdminService } from '../../../core/services/admin/admin-service';
import { FormTaskModalComponent } from '../form-task-modal/form-task-modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-project-detail',
  imports: [CommonModule, FormsModule, UserAvatarComponent, ProjectStatusPipe, ProjectPriorityPipe, FormTaskModalComponent],
  templateUrl: './project-detail.html',
  styleUrls: ['./project-detail.css']
})
export class ProjectDetailComponent {
  @Input() isOpen = false;
  @Input() project: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  isTaskModalOpen = false;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef, private toastr: ToastrService) { }

  newTaskName = '';
  showAddTask = false;
  deleting = false;

  openCreateTask() {
    this.isTaskModalOpen = true;
  }

  handleCreateTask(taskData: any) {
    // Gắn thêm project_id vào data (vì form task chưa biết project nào)
    const payload = {
      ...taskData,
      project_id: this.project.project_id
    };

    this.adminService.createTaskAdmin(payload).subscribe({
      next: (res: any) => {
        // Thêm task mới vào list để hiển thị ngay
        if (!this.project.tasks) this.project.tasks = [];
        this.project.tasks.unshift(res.data || res); // Tùy response backend trả về
        this.isTaskModalOpen = false; // Đóng modal task
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  deleteProject(projectId: number, projectName?: string) {
    const name = projectName ? `"${projectName}"` : 'dự án này';

    if (!confirm(`XÓA HOÀN TOÀN ${name}?\n\nTất cả dữ liệu sẽ bị xóa vĩnh viễn và KHÔNG THỂ khôi phục.\n\nBạn có chắc chắn không?`)) {
      return;
    }

    this.deleting = true;

    this.adminService.deleteProject(projectId).subscribe({
      next: () => {
        this.deleting = false;
        // this.toastr.success('Đã xóa dự án thành công!', 'Thành công');
        this.close.emit();
        this.refresh.emit();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.deleting = false;
        const msg = err?.error?.message || 'Không thể xóa dự án lúc này';
        // this.toastr.error(msg, 'Lỗi');
        this.close.emit(); // vẫn đóng modal để khỏi treo
      }
    });
  }

  onClose() {
    this.close.emit();
  }

  // invite member
  showInviteInput = false; // Để ẩn/hiện ô nhập email
  inviteEmail = '';        // Biến lưu email đang nhập
  isInviting = false;

  toggleInvite() {
    this.showInviteInput = !this.showInviteInput;
    if (this.showInviteInput) {
      this.inviteEmail = '';
    }
  }

  // 2. Gọi API mời
  onInviteMember() {
    if (!this.inviteEmail.trim()) return;
    this.isInviting = true;
    this.adminService.inviteMemberToProject(this.project.project_id, { email: this.inviteEmail })
      .subscribe({
        next: (res: any) => {
          const newMember = res.data;

          if (!this.project.members) this.project.members = [];
          this.project.members.push(newMember);

          this.toastr.success(`Đã mời thành viên ${this.inviteEmail} thành công`);
          this.inviteEmail = '';
          this.showInviteInput = false;
          this.isInviting = false;
        },
        error: (err) => {
          this.isInviting = false;
          const msg = err.error?.message || 'Mời thất bại';
          this.toastr.error(msg);
        }
      });
  }

  // status color
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

  getStatusBarColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-500'; // Xanh lá
      case 'in_progress':
        return 'bg-blue-500'; // Xanh dương
      case 'on_hold':
        return 'bg-yellow-500'; // Vàng
      case 'over_due':
        return 'bg-red-500'; // Đỏ
      case 'to_do':
        return 'bg-gray-400'; // Xám
      default:
        return 'bg-gray-400'; // Mặc định
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'gray';
    }
  }
  // Màu thanh progress (gradient khi tiến độ cao)
  progressBarClass(progress?: number) {
    const p = progress ?? 0;
    if (p >= 100) return 'bg-green-500';
    if (p >= 60) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    if (p >= 30) return 'bg-blue-500';
    return 'bg-gray-400 dark:bg-gray-500';
  }
}
