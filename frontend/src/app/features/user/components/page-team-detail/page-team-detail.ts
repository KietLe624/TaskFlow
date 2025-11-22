// team-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TeamService } from '../../../../core/services/team/team-service';
import { AuthService } from '../../../../core/services/auth/auth';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { UserAvatarComponent } from '../user-avatar/user-avatar';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-team-detail',
  imports: [CommonModule, DatePipe, TitleCasePipe, UserAvatarComponent, RouterLink, FormsModule],
  templateUrl: './page-team-detail.html',
  styleUrls: ['./page-team-detail.css']
})
export class TeamDetailComponent implements OnInit {
  team: any;
  teamProjects: any[] = [];
  loading = true;
  activeTab = 'overview';
  isOwner = false;
  teamId!: number;
  tabs = [
    { id: 'overview', label: 'Tổng quan', icon: 'fas fa-home' },
    { id: 'members', label: 'Thành viên', icon: 'fas fa-users', badge: 0 },
    { id: 'projects', label: 'Dự án', icon: 'fas fa-folder-open' },
    { id: 'chat', label: 'Chat', icon: 'fas fa-comments', badge: '99+' }
  ];

  get totalTasks() { return this.team?.stats?.totalTasks || 0; }
  get completedTasks() { return this.team?.stats?.completedTasks || 0; }
  get completionRate() {
    return this.totalTasks > 0 ? Math.round((this.completedTasks / this.totalTasks) * 100) : 0;
  }

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    // Cách đúng: dùng paramMap observable
    this.route.paramMap.subscribe(params => {
      this.teamId = Number(params.get('id')!); // chắc chắn có id vì route là /team/:id
      if (this.teamId) {
        this.loadTeamData(this.teamId);
      }
    });
  }

  // Sửa hàm isOwnerUser() thành thế này:
  isOwnerUser() {
    if (!this.team) return false;
    const currentUserId = this.authService.getUserIdFromToken();
    return this.team.owner_team_id === currentUserId; // ← ĐÚNG!
  }

  loadTeamData(teamId: number) {
    this.loading = true;
    this.teamService.getTeamOverview(teamId).subscribe({
      next: (res) => {
        this.team = res.data;
        this.team = res.data.team || {};            // chứa team_id, team_name, owner, created_at
        this.team.members = res.data.members || []; // gắn members vào team
        this.team.projects = res.data.projects || [];
        this.team.stats = res.data.stats || { members: 0, projects: 0, totalTasks: 0, completedTasks: 0, completionRate: 0 };

        this.tabs[1].badge = this.team.members.length;

        const currentUserId = this.authService.getUserIdFromToken();
        this.isOwner = !!(this.team.owner && this.team.owner.user_id === currentUserId);
        // this.isOwner = this.team.team.owner.user.user_id === currentUserId;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu team:', err);
      }

    });
    this.teamService.getTeamProjects(teamId).subscribe({
      next: (res) => this.teamProjects = res.data
    });
  }

  getProjectProgress(project: any): number {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter((t: any) => t.status === 'completed').length;
    return Math.round((completed / project.tasks.length) * 100);
  }
  // thêm thành viên
  // 1. Khai báo biến state
  isInviteModalOpen = false;
  inviteEmail = '';
  isLoading = false;

  // 2. Hàm mở Modal
  openInviteModal() {
    this.inviteEmail = ''; // Reset form
    this.isInviteModalOpen = true;
  }

  // 3. Hàm đóng Modal
  closeInviteModal() {
    this.isInviteModalOpen = false;
  }

  // 4. Hàm Gửi lời mời (Gọi API)
  submitInvite() {
    // Validate đầu vào
    if (!this.inviteEmail || this.inviteEmail.trim() === '') return;

    const email = this.inviteEmail.trim();

    this.isLoading = true;

    // Gọi Service (Sửa cú pháp object cho đúng)
    const payload = {
      team_id: this.team.team_id,
      email: email,
      owner_team_id: this.authService.getUserIdFromToken()
    };

    this.teamService.inviteMember(this.team.team_id, email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.loadTeamData(this.team.team_id);
        this.closeInviteModal(); // Đóng modal khi thành công
        this.toastr.success(`Đã gửi lời mời tới ${email} thành công!`, 'Thành công');
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Invite error', err);
        this.toastr.error('Lỗi: ' + (err?.error?.message || 'Mời thất bại'), 'Lỗi');
      }
    });
  }

  // Thay đổi role
  changeMemberRole(member: any, newRole: string) {
    if (!newRole || member.teamMemberships?.[0]?.role === newRole) return;
    if (!confirm(`Đổi vai trò của ${member.username || member.user_id} → ${newRole}?`)) return;

    const ownerId = this.authService.getUserIdFromToken();
    this.teamService.changeMemberRole(this.team.team_id, member.user_id, newRole)
      .subscribe({
        next: (res) => {
          this.loadTeamData(this.team.team_id);
        },
        error: (err) => {
          console.error('Update role error', err);
          this.toastr.error('Cập nhật vai trò thất bại: ' + (err?.error?.message || err?.message || 'Lỗi'), 'Lỗi');
        }
      });
  }

  // Xóa thành viên
  removeMember(member: any) {
    if (!confirm(`Bạn có chắc muốn xoá ${member.full_name || member.username} khỏi team?`)) return;
    const ownerId = this.authService.getUserIdFromToken();
    this.teamService.removeMember(this.team.team_id, member.user_id)
      .subscribe({
        next: (res) => {
          this.loadTeamData(this.team.team_id);
          this.toastr.success(`Đã xoá thành viên khỏi team thành công!`);
        },
        error: (err) => {
          console.error('Remove member error', err);
          this.toastr.error('Xoá thất bại: ' + (err?.error?.message || err?.message || 'Lỗi'), 'Lỗi');
        }
      });
  }
}
