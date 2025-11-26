import { Component, Output, EventEmitter } from '@angular/core';
import { AdminService } from '../../../core/services/admin/admin-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { start } from 'repl';



@Component({
  selector: 'app-form-project-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './form-project-modal.html',
  styleUrl: './form-project-modal.css'
})
export class FormProjectModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  isOpen = false;
  loading = false;

  teams: any[] = [];
  users: any[] = [];

  form = {
    project_name: '',
    description: '',
    team_id: 0,
    owner_id: 0,
    start_date: '',
    due_date: '',
    status: 'to_do',
    priority: 'medium'
  };

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadTeamsAndUsers();
  }

  loadTeamsAndUsers() {
    this.adminService.getAllTeams().subscribe(res => {
      this.teams = res.teams || [];
      if (this.teams.length > 0) this.form.team_id = this.teams[0].team_id;
    });

    this.adminService.getAllUsers().subscribe(res => {
      this.users = res.users || [];
      // Mặc định owner là người đang login (nếu có)
      const currentUser = this.users.find(u => u.is_current_user); // hoặc từ auth service
      if (currentUser) this.form.owner_id = currentUser.user_id;
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
    if (!this.form.project_name.trim()) {
      alert('Vui lòng nhập tên project!');
      return;
    }
    if (!this.form.start_date || !this.form.due_date) {
      alert('Vui lòng chọn ngày bắt đầu và kết thúc!');
      return;
    }
    if (this.form.due_date < this.form.start_date) {
      alert('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!');
      return;
    }

    this.loading = true;

    // ĐẢM BẢO GỬI ĐÚNG TÊN FIELD!!!
    const payload = {
      project_name: this.form.project_name.trim(),
      description: this.form.description || '',
      team_id: this.form.team_id || null,
      owner_id: this.form.owner_id,
      start_date: this.form.start_date,
      due_date: this.form.due_date,
      status: this.form.status || 'to_do',
      priority: this.form.priority || 'medium'
    };

    console.log('Gửi tạo project:', payload); // ← DEBUG: XEM CÓ ĐÚNG KHÔNG

    this.adminService.createProject(payload).subscribe({
      next: (res) => {
        alert('Tạo project thành công!');
        this.created.emit();
        this.onClose();
      },
      error: (err) => {
        console.error('Lỗi tạo project:', err);
        alert('Lỗi: ' + (err.error?.message || 'Không thể tạo project'));
        this.loading = false;
      }
    });
  }
}
