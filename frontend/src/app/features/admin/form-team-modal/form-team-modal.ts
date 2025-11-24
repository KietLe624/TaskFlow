import { Component, Output, EventEmitter } from '@angular/core';
import { AdminService } from '../../../core/services/admin/admin-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-form-team-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './form-team-modal.html',
  styleUrls: ['./form-team-modal.css']
})
export class FormTeamModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  isOpen = false;
  loading = false;
  users: any[] = [];

  form = {
    team_name: '',
    owner_team_id: 0
  };

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res.users || [];
        if (this.users.length > 0) {
          this.form.owner_team_id = this.users[0].user_id;
        }
      }
    });
  }

  open() {
    this.isOpen = true;
  }

  onClose() {
    this.isOpen = false;
    this.close.emit();
  }

  onSubmit() {
    if (!this.form.team_name.trim()) {
      alert('Vui lòng nhập tên team!');
      return;
    }
    if (this.form.owner_team_id === 0) {
      alert('Vui lòng chọn owner!');
      return;
    }

    this.loading = true;

    // ĐÚNG: đổi owner_id → owner_team_id để khớp backend
    const payload = {
      team_name: this.form.team_name.trim(),
      owner_team_id: this.form.owner_team_id   // ← ĐÂY LÀ CHÌA KHÓA!!!
    };

    this.adminService.createTeamAdmin(payload).subscribe({
      next: () => {
        alert(`Tạo team "${this.form.team_name}" thành công!`);
        this.created.emit();
        this.onClose();
      },
      error: (err) => {
        alert('Lỗi: ' + (err.error?.message || 'Không thể tạo team'));
        this.loading = false;
      }
    });
  }

}
