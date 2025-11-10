import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { Project } from '../../../../models/projects';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from '../user-avatar/user-avatar';
import { ProjectService } from '../../../../core/services/project/project-service';
import { FormCreateProject } from '../form-create-project/form-create-project';
import { ProjectStatusPipe } from '../../../../pipes/project-status-pipe';
import { ProjectPriorityPipe } from '../../../../pipes/project-priority-pipe';
import { ProjectDetailModalComponent } from '../project-detail/project-detail';
import { AuthService } from '../../../../core/services/auth/auth';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-projects',
  imports: [
    CommonModule,
    UserAvatarComponent,
    FormCreateProject,
    ProjectStatusPipe,
    ProjectPriorityPipe,
    ProjectDetailModalComponent,
    FormsModule,
  ],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css'],
})
export class ProjectsComponent implements OnInit {
  isGrid = true;
  projects: Project[] = [];
  isLoading = true;
  teams: any[] = [];
  isModalOpen = false;

  // Thuộc tính này sẽ được dùng bởi <app-create-project>
  isEditMode = false;
  selectedProject: Project | null = null;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadTeams();
    this.cdr.detectChanges();
  }

  loadTeams(): void {
    // ...
  }

  loadProjects(): void {
    this.isLoading = true;
    const user_id = this.authService.getUserIdFromToken();

    this.projectService.getProjectsByUserId(user_id).subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
        console.log(' Projects từ backend:', projects);
      },
      error: (err) => {
        console.error(' Lỗi khi load projects:', err);
        this.isLoading = false;
      },
    });
    this.cdr.detectChanges();
  }

  openCreateModal() {
    this.isEditMode = false;
    this.selectedProject = null;
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  openEditProjectModal(project: Project) {
    console.log(' Mở modal chỉnh sửa project:', project);
    this.isEditMode = true;
    this.selectedProject = project;
    this.isModalOpen = true;
    this.cdr.detectChanges();
    this.openDropdownId = null; // Đóng dropdown
  }

  onProjectSaved(updatedProject: Project) {
    let succcessMsg = '';
    const index = this.projects.findIndex(
      (p) => p.project_id === updatedProject.project_id
    );
    if (index !== -1) {
      this.projects[index] = { ...this.projects[index], ...updatedProject };
      this.cdr.detectChanges();
      this.toastr.success('Cập nhật dự án thành công!');
    } else {
      this.projects.push(updatedProject);
      this.cdr.detectChanges();
      this.toastr.success('Tạo dự án thành công!');
    }

    this.projects = [...this.projects];
    this.isModalOpen = false; // Tự đóng modal khi save
    this.cdr.detectChanges();
    alert(succcessMsg);
  }

  deleteProject(project_id: number, event: MouseEvent) {
    event.stopPropagation();
    console.log('Xoá project:', project_id);
    try {
      this.projectService.deleteProject(project_id).subscribe({
        next: () => {
          this.projects = this.projects.filter(
            (p) => p.project_id !== project_id
          );
          this.cdr.detectChanges();
        },
        error: (err) => console.error(' Lỗi khi xoá project:', err),
      });
    } catch (error) {
      console.error(' Lỗi khi xoá project:', error);
    }
    this.openDropdownId = null;
  }

  toggleLayout(): void {
    this.isGrid = !this.isGrid;
    this.cdr.detectChanges();
  }

  openDropdownId: number | null = null;

  toggleDropdown(id: number, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  @HostListener('document:click')
  closeDropdown() {
    this.openDropdownId = null;
  }

  isDetailsModalOpen = false;
  selectedProjectForDetails: Project | null = null;

  viewProjectDetails(project_id: number, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdownId = null; // Đóng dropdown
    // Gọi service để lấy data đầy đủ
    this.projectService.getProjectById(project_id).subscribe({
      next: (fullProjectData) => {
        this.selectedProjectForDetails = fullProjectData;
        this.isDetailsModalOpen = true; // <-- Mở modal
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Lỗi khi lấy chi tiết project:', err),
    });
  }

  closeDetailsModal() {
    this.isDetailsModalOpen = false;
    this.selectedProjectForDetails = null;
    console.log(' Đóng modal chi tiết project');
    this.cdr.detectChanges();
  }
  // ========= Thay đổi trạng thái project ==========

  isChangeStatusModalOpen = false;
  projectToChangeStatus: Project | null = null;
  newSelectedStatus: string = '';
  availableStatuses: string[] = ['to_do', 'in_progress', 'on_hold', 'over_due'];

  changeStatus(id: number, event: MouseEvent) {
    event.stopPropagation();
    console.log(' Mở modal thay đổi trạng thái cho:', id);
    this.openDropdownId = null; // Đóng dropdown

    const project = this.projects.find((p) => p.project_id === id);

    if (project) {
      this.projectToChangeStatus = project;
      // Set trạng thái đang chọn là trạng thái hiện tại
      this.newSelectedStatus = project.status;
      this.isChangeStatusModalOpen = true; // Mở modal
      this.cdr.detectChanges();
    } else {
      console.error('Không tìm thấy project để thay đổi trạng thái!');
    }
  }

  cancelChangeStatus() {
    this.isChangeStatusModalOpen = false;
    this.projectToChangeStatus = null;
    this.newSelectedStatus = '';
    this.cdr.detectChanges();
  }

  confirmChangeStatus() {
    if (!this.projectToChangeStatus || !this.newSelectedStatus) return;
    const project_id = this.projectToChangeStatus.project_id;
    if (this.projectToChangeStatus.status === this.newSelectedStatus) {
      this.cancelChangeStatus();
      return;
    }

    const updatedData = { status: this.newSelectedStatus };
    console.log(`Đang cập nhật project ${project_id} thành:`, updatedData);

    this.projectService.updateProject(project_id, updatedData).subscribe({
      next: (updatedProject) => {
        const index = this.projects.findIndex(
          (p) => p.project_id === project_id
        );
        if (index !== -1) {
          this.projects[index] = { ...this.projects[index], ...updatedProject };
          this.projects = [...this.projects];
          this.cdr.detectChanges();
        }

        this.cancelChangeStatus();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi thay đổi trạng thái:', err);
        this.cancelChangeStatus();
      },
    });
  }

  // ========== Lấy class màu theo status ==========
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

  // ========== Đánh dấu hoàn thành project ==========
  isCompleteModalOpen = false;
  projectToComplete: Project | null = null;

  markAsCompleted(id: number, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdownId = null; // Đóng dropdown

    // Tìm project để hiển thị tên trong modal
    const project = this.projects.find((p) => p.project_id === id);

    if (project) {
      this.projectToComplete = project;
      this.isCompleteModalOpen = true; // Mở modal
      this.cdr.detectChanges(); // Cập nhật UI
    } else {
      console.error('Không tìm thấy project để hoàn thành!');
    }
  }

  confirmComplete() {
    if (!this.projectToComplete) return; // Kiểm tra an toàn

    const project_id = this.projectToComplete.project_id;
    const updatedData = { status: 'completed' };

    this.projectService.updateProject(project_id, updatedData).subscribe({
      next: (updatedProject) => {
        const index = this.projects.findIndex(
          (p) => p.project_id === project_id
        );

        if (index !== -1) {
          // Lấy project CŨ
          const oldProject = this.projects[index];
          // Gộp data (giữ nguyên tên, client...) và CẬP NHẬT TƯỜNG MINH
          this.projects[index] = {
            ...oldProject,
            ...updatedProject,
            status: 'completed', // Đảm bảo status là completed
            progressPercent: 100, // Đảm bảo tiến độ là 100%
          };

          this.projects = [...this.projects];
          this.cdr.detectChanges();
        }

        this.cancelComplete(); // Đóng modal sau khi thành công
      },
      error: (err) => {
        console.error('Lỗi khi đánh dấu hoàn thành:', err);
        this.cancelComplete(); // Đóng modal khi lỗi
      },
    });
  }

  cancelComplete() {
    this.isCompleteModalOpen = false;
    this.projectToComplete = null;
  }
}
