import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../../core/services/project/project-service' // Đảm bảo đường dẫn đúng
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-invite-member',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invite-member.html',
  styleUrls: ['./invite-member.css']
})
export class InviteMemberComponent {
  @Input() projectId!: number; // Nhận ID dự án từ cha
  @Output() memberAdded = new EventEmitter<void>(); // Báo cho cha biết khi xong

  isOpen = false;
  email = '';
  isInviting = false;

  constructor(
    private projectService: ProjectService,
    private toastr: ToastrService
  ) { }

  openModal() {
    this.email = '';
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }

  submitInvite() {
    if (!this.email || !this.email.includes('@')) {
      this.toastr.warning('Vui lòng nhập email hợp lệ');
      return;
    }

    if (!this.projectId) {
      this.toastr.error('Không tìm thấy ID dự án');
      return;
    }

    this.isInviting = true;
    this.projectService.inviteMember(this.projectId, this.email).subscribe({
      next: (res) => {
        this.toastr.success('Đã mời thành viên thành công!');
        this.memberAdded.emit(); // Bắn sự kiện ra ngoài
        this.isInviting = false;
        this.closeModal();
      },
      error: (err) => {
        this.isInviting = false;
        const msg = err.error?.error || 'Lỗi khi mời thành viên';
        this.toastr.error(msg);
      }
    });
  }
}
