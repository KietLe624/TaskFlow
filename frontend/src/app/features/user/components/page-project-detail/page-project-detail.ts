import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { Project, ProjectMember } from '../../../../models/projects';
import { ProjectService } from '../../../../core/services/project/project-service';
import { ProjectMembersService } from '../../../../core/services/project-members-service/project-members-service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectStatusPipe } from '../../../../pipes/project-status-pipe';
import { ProjectPriorityPipe } from '../../../../pipes/project-priority-pipe';
import { FormTask } from '../../components/form-task/form-task';
import { Tasks } from '../../../../models/tasks';
import { TeamService } from '../../../../core/services/team/team-service';
import { ToastrService } from 'ngx-toastr';
import { UserAvatarComponent } from '../user-avatar/user-avatar';
import { ChatboxComponent } from '../chatbox/chatbox';
import { InviteMemberComponent } from '../invite-member/invite-member';
import { ProjectAnalyticsModal } from '../project-analytics-modal/project-analytics-modal';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-page-project-detail',
  imports: [
    CommonModule,
    ProjectStatusPipe,
    ProjectPriorityPipe,
    FormTask,
    UserAvatarComponent,
    ChatboxComponent,
    InviteMemberComponent,
    ProjectAnalyticsModal
  ],
  templateUrl: './page-project-detail.html',
  styleUrls: ['./page-project-detail.css'],
})
export class PageProjectDetailComponent implements OnInit {
  isLoadingDetail: boolean = true;
  projectDetail: any = null;
  errMsg: string = '';
  isTaskModalOpen: boolean = false;
  isSavingTask = false;
  isEdit = false;
  selectedTask?: Tasks;
  projectTasks: Tasks[] = [];
  currentProgress: number = 0;
  ConversationId: number | null = null;

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private teamService: TeamService,
    private toastr: ToastrService,
    private projectMembersService: ProjectMembersService
  ) { }

  ngOnInit(): void {
    const projectIdStr = this.route.snapshot.paramMap.get('id');
    if (projectIdStr) {
      const projectId = Number(projectIdStr);
      this.loadProjectDetails(projectId);
    } else {
      this.errMsg = 'Không tìm thấy ID dự án hợp lệ.';
      this.isLoadingDetail = false;
    }
  }

  loadProjectDetails(project_id: number): void {
    this.isLoadingDetail = true;
    this.cdr.markForCheck();

    this.projectService.getProjectById(project_id).subscribe({
      next: (data: Project) => {
        this.projectDetail = data;
        if (data.conversation) {
          this.ConversationId = data.conversation.conve_id;
        }
        this.loadProjectMembers(project_id);
        this.isLoadingDetail = false;
        this.cdr.markForCheck();
        console.log('Chi tiết dự án:', this.projectDetail);
      },
      error: (err) => {
        this.errMsg = 'Lỗi tải chi tiết dự án: ' + err.message;
        this.isLoadingDetail = false;
        this.cdr.markForCheck();
      },
    });
  }
  // chuyển tab
  activeTab: string = 'overview';

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.cdr.detectChanges();
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

  private statusTitle: Record<string, string> = {
    to_do: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    completed: 'Completed',
  };

  taskColumns() {
    const tasks = this.projectDetail?.tasks ?? [];

    const groups: Record<string, any[]> = {
      to_do: [],
      in_progress: [],
      in_review: [],
      completed: [],
    };

    for (const t of tasks) {
      const k = (t.status ?? 'to_do') as keyof typeof groups;
      (groups[k] ?? groups['to_do']).push(t);
    }

    return [
      {
        key: 'to_do',
        title: this.statusTitle['to_do'],
        items: groups['to_do'],
      },
      {
        key: 'in_progress',
        title: this.statusTitle['in_progress'],
        items: groups['in_progress'],
      },
      {
        key: 'in_review',
        title: this.statusTitle['in_review'],
        items: groups['in_review'],
      },
      {
        key: 'completed',
        title: this.statusTitle['completed'],
        items: groups['completed'],
      },
    ];
  }

  // Màu thanh progress (gradient khi tiến độ cao)
  progressBarClass(progress?: number) {
    const p = progress ?? 0;
    if (p >= 100) return 'bg-green-500';
    if (p >= 60) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    if (p >= 30) return 'bg-blue-500';
    return 'bg-gray-400 dark:bg-gray-500';
  }

  openCreateTask() {
    this.isEdit = false;
    this.selectedTask = undefined;
    this.isTaskModalOpen = true;
    this.cdr.detectChanges();
  }

  openEditTask(t: Tasks) {
    this.isEdit = true;
    console.log('Edit task:', t);
    this.selectedTask = t;
    this.isTaskModalOpen = true;
    this.cdr.detectChanges();
  }

  closeTaskModal() {
    this.isTaskModalOpen = false;
    this.selectedTask = undefined;
    this.cdr.detectChanges();
  }

  handleTaskSaved(task: Tasks) {
    this.loadProjectDetails(this.projectDetail.project_id);
    this.closeTaskModal();
    if (this.isEdit) {
      this.toastr.success(
        `Task "${task.task_name}" đã được cập nhật thành công!`,
        'Cập nhật task',
      );
    } else {
      this.toastr.success(
        `Task "${task.task_name}" đã được tạo thành công!`,
        'Tạo task mới',
      );
    }
  }

  updateProgress() {
    this.currentProgress = this.calculateProgress(this.projectTasks);
    this.cdr.detectChanges();
  }

  calculateProgress(tasks: Tasks[]): number {
    if (!tasks || tasks.length === 0) {
      return 0;
    }
    const completedCount = tasks.filter((t) => t.status === 'completed').length;
    const progress = (completedCount / tasks.length) * 100;
    return Math.round(progress);
  }

  // members

  members: ProjectMember[] = [];
  isLoadingMembers = false;

  loadProjectMembers(project_id: number) {
    this.isLoadingMembers = true;
    this.projectService.getProjectMembers(project_id).subscribe({
      next: (res: any[]) => {
        this.members = res;
        this.isLoadingMembers = false;
        this.cdr.detectChanges();
        console.log('Members (Data đã nhận):', this.members);
      },
      error: (err) => {
        console.error('Lỗi load members:', err);
        this.members = [];
        this.isLoadingMembers = false;
      },
    });
  }

  onMemberAdded() {
    if (this.projectDetail?.project_id) {
      this.loadProjectMembers(this.projectDetail.project_id);
    }
  }

  openPrivateChat(user_id: number) {
    this.toastr.info('Tính năng chat riêng đang phát triển 🚀');
  }

  // Thêm vào class
  selectedMemberForRole: any = null; // member đang mở dropdown role
  roleDropdownOpen = false;
  projectOwnerId: number | null = null;

  // Đóng dropdown khi click ngoài
  @HostListener('document:click')
  closeRoleDropdown() {
    this.roleDropdownOpen = false;
    this.selectedMemberForRole = null;
  }

  // Hàm đổi role thật (gọi API)
  changeMemberRole(member: any, newRole: 'owner' | 'member') {
    this.projectMembersService.changeRole(this.projectDetail.project_id, member.user_id, newRole)
      .subscribe({
        next: () => {
          this.toastr.success(`Đã đổi thành ${newRole === 'owner' ? 'Owner' : 'Member'}`);
          this.loadProjectMembers(this.projectDetail.project_id); // refresh list
          this.roleDropdownOpen = false;
        },
        error: (err) => {
          this.toastr.error(err.error.message || 'Đổi vai trò thất bại');
        }
      });
  }

  // xoá member
  removeMember(member: any) {
    Swal.fire({
      title: 'Xoá thành viên?',
      html: `Bạn có chắc muốn mời <b>${member.username || member.email}</b> ra khỏi dự án này không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Màu đỏ báo hiệu nguy hiểm
      cancelButtonColor: '#3085d6', // Màu xanh
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Huỷ'
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectMembersService.removeMember(this.projectDetail.project_id, member.user_id)
          .subscribe({
            next: () => {
              this.toastr.success(`Đã xóa ${member.username} khỏi dự án`);
              this.loadProjectMembers(this.projectDetail.project_id);
              Swal.fire({
                title: 'Đã xoá!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              });
            },
            error: (err) => {
              this.toastr.error(err.error.message || 'Xóa thành viên thất bại');
            }
          });
      }
    });
  }
  // dropdown
  dropdownPosition: 'up' | 'down' = 'down';

  openRoleMenu(event: MouseEvent, member: any) {
    event.stopPropagation();
    this.selectedMemberForRole = member;
    this.roleDropdownOpen = true;

    // --- LOGIC TÍNH TOÁN VỊ TRÍ ---
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect(); // Lấy tọa độ nút bấm
    const spaceBelow = window.innerHeight - rect.bottom; // Khoảng trống bên dưới
    const dropdownHeight = 256; // Chiều cao ước lượng của menu (px)

    // Nếu khoảng trống bên dưới < chiều cao menu -> Hiển thị lên trên
    if (spaceBelow < dropdownHeight) {
      this.dropdownPosition = 'up';
    } else {
      this.dropdownPosition = 'down';
    }
    this.cdr.detectChanges();
  }

}
