import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../../core/services/team/team-service';
import { AdminService } from '../../../core/services/admin/admin-service';

@Component({
  selector: 'app-team-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './team-detail.html',
  styleUrls: ['./team-detail.css']
})
export class TeamDetailComponent {
  @Input() isOpen = false;
  @Input() team: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  searchUser = '';
  availableUsers: any[] = []; // sẽ load từ API
  showAddMember = false;
  loading = false;

  constructor(private teamService: TeamService, private adminService: AdminService) { }

  // Mở modal thêm thành viên
  openAddMember() {
    this.showAddMember = true;
    // Gọi API lấy danh sách user chưa trong team (sẽ làm sau)
  }

  // Thêm thành viên
  addMember(user: any) {
    this.loading = true;
    this.teamService.inviteMember(this.team.team_id, user.user_id).subscribe({
      next: () => {
        this.refresh.emit();
        this.showAddMember = false;
        this.searchUser = '';
        alert(`Đã thêm ${user.full_name || user.username} vào team!`);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Lỗi khi thêm thành viên');
      }
    });
    alert(`Đã thêm ${user.full_name} vào team ${this.team.team_name}`);
    this.showAddMember = false;
    this.refresh.emit();
  }

  // Xóa thành viên
  removeMember(userId: number) {
    if (!confirm('Xóa thành viên này khỏi team?')) return;

    this.adminService.removeMember(this.team.team_id, userId).subscribe({
      next: () => {
        this.refresh.emit();
        alert('Đã xóa thành viên khỏi team');
      },
      error: (err) => alert('Lỗi: ' + err.error?.message)
    });
  }

  // Đổi owner
  changeOwner(userId: number) {
    if (!confirm('Chuyển quyền owner cho thành viên này?')) return;
    this.teamService.changeMemberRole(this.team.team_id, userId, 'owner').subscribe({
      next: () => {
        this.refresh.emit();
        alert('Đã đổi owner thành công!');
      },
      error: (err) => alert('Lỗi: ' + err.error?.message)
    });
  }

  // Xóa team
  deleteTeam() {
    if (confirm('XÓA HOÀN TOÀN TEAM NÀY? KHÔNG THỂ HOÀN TÁC!')) {
      // Gọi API xóa team
      alert('Đã xóa team');
      this.close.emit();
      this.refresh.emit();
    }
  }

  onClose() {
    this.close.emit();
  }
}
