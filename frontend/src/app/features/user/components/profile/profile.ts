import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserService } from '../../../../core/services/user/user-service';
import { AuthService } from '../../../../core/services/auth/auth';
import { TeamService } from '../../../../core/services/team/team-service';
import { ProfileData } from '../../../../models/profile';
import { CommonModule } from '@angular/common';
import { FormUserComponent } from '../form-user/form-user';
import { FormTeamComponent } from '../form-team/form-team';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormUserComponent, FormTeamComponent, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private teamService: TeamService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
  ) { }
  profile: ProfileData | null = null;
  loading = true;
  isEditModalOpen = false;

  ngOnInit(): void {
    const userId = this.authService.getUserIdFromToken(); // ← THÊM () Ở ĐÂY!!!
    if (userId) {
      this.loadUserProfile(userId);
    } else {
      console.error('Không lấy được userId từ token!');
      this.loading = false;
    }
  }

  loadUserProfile(userId: number): void {
    this.loading = true;
    this.userService.getUserById(userId).subscribe({
      next: (data) => {
        this.profile = data; // giờ data đã là ProfileData sạch sẽ
        this.loading = false;
        console.log('Profile tải về:', this.profile);
      },
      error: (err) => {
        console.error('Lỗi tải profile:', err);
        this.loading = false;
      },
    });
  }
  // Mở modal chỉnh sửa
  openEditModal() {
    this.isEditModalOpen = true;
    this.loading = false;
  }
  // Đóng modal chỉnh sửa
  closeEditModal() {
    this.isEditModalOpen = false;
    const userId = this.authService.getUserIdFromToken();
    if (userId) {
      this.loadUserProfile(userId);
      this.cdr.detectChanges();
    }
  }
  // create team
  isTeamModalOpen = false;

  openCreateTeam() {
    this.isTeamModalOpen = true;
    this.cdr.detectChanges();
  }

  // Hàm đóng modal
  closeTeamModal() {
    this.isTeamModalOpen = false;
  }

  handleTeamCreated(team: any) {
    this.loadTeams(team.team_id);
    this.cdr.detectChanges();
    this.closeTeamModal();
    this.toastr.success('Tạo team thành công!');
  }

  teams: any[] = []; // Biến chứa danh sách team
  isLoadingTeams = false;
  ConversationId: number | null = null;

  loadTeams(team_id: number) {
    this.isLoadingTeams = true;
    this.teamService.getTeamMembers(team_id).subscribe({
      next: (res: any) => {
        if (res && res.team && res.team.team) {
          this.teams = [res.team.team];
          this.ConversationId = res.team.conversation_id;
        } else {
          this.teams = [];
          this.ConversationId = null;
        }
        this.isLoadingTeams = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi load team:', err);
        this.teams = [];
        this.ConversationId = null;
        this.isLoadingTeams = false;
      },
    });
  }
}
