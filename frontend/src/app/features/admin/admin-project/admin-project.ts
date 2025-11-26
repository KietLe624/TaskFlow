import { Component } from '@angular/core';
import { AdminService } from '../../../core/services/admin/admin-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserAvatarComponent } from '../../user/components/user-avatar/user-avatar';
import { ProjectDetailComponent } from '../project-detail/project-detail';
import { ProjectPriorityPipe } from '../../../pipes/project-priority-pipe';
import { ProjectStatusPipe } from '../../../pipes/project-status-pipe';
import { FormProjectModalComponent } from '../form-project-modal/form-project-modal';


@Component({
  selector: 'app-admin-project',
  imports: [CommonModule, FormsModule, ProjectDetailComponent, UserAvatarComponent, ProjectStatusPipe, FormProjectModalComponent],
  templateUrl: './admin-project.html',
  styleUrls: ['./admin-project.css']
})
export class AdminProjectComponent {
  projects: any[] = [];
  filteredProjects: any[] = [];
  loading = true;
  searchTerm = '';
  selectedProject: any = null;

  constructor(private adminService: AdminService,) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  projectStats: { total: number; completed: number; over_due: number; in_progress: number } = {
    total: 0,
    completed: 0,
    over_due: 0,
    in_progress: 0,
  };

  loadProjects() {
    this.loading = true;
    this.adminService.getAllProjects().subscribe({
      next: (res: any) => {
        const payload = res?.projects ?? {};
        const projects = Array.isArray(payload.projects) ? payload.projects : [];

        // Gán projects và filteredProjects (clone)
        this.projects = projects;
        this.filteredProjects = [...this.projects];

        // Parse stats (api trả về string trong ví dụ)
        const s = payload.stats ?? {};
        this.projectStats = {
          total: Number(s.total ?? this.projects.length ?? 0),
          completed: Number(s.completed ?? 0),
          over_due: Number(s.over_due ?? 0),
          in_progress: Number(s.in_progress ?? 0),
        };

        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi lấy projects', err);
        this.projects = [];
        this.filteredProjects = [];
        this.projectStats = { total: 0, completed: 0, over_due: 0, in_progress: 0 };
        this.loading = false;
      }
    });
  }

  filterProjects() {
    const termRaw = this.searchTerm ?? '';
    const term = termRaw.trim().toLowerCase();

    if (!term) {
      this.filteredProjects = [...this.projects];
      return;
    }
    // Lọc dựa trên tên project và mô tả
    this.filteredProjects = this.projects.filter(p => {
      const name = (p.project_name ?? '').toString().toLowerCase();
      const desc = (p.description ?? '').toString().toLowerCase();
      // Bạn có thể mở rộng search sang owner username, client, ... nếu cần
      const ownerUsername = (p.owner?.username ?? '').toString().toLowerCase();
      const client = (p.client ?? '').toString().toLowerCase();

      return (
        name.includes(term) ||
        desc.includes(term) ||
        ownerUsername.includes(term) ||
        client.includes(term)
      );
    });
  }
  // project create
  openCreateProject() {
    // Implement the logic to open the create project modal or navigate to the create project page
  }

  // project detail
  openProjectDetail(project: any) {
    this.selectedProject = project;
  }

  closeProjectDetail() {
    this.selectedProject = null;
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
