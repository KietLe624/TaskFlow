import { ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardData } from '../../../../models/dashboards';
import { BehaviorSubject } from 'rxjs'; // Import BehaviorSubject
import { DashboardService } from '../../../../core/services/dashboard/dashboard';
import { ProjectService } from '../../../../core/services/project/project-service';
import { ProjectStatusPipe } from '../../../../pipes/project-status-pipe';
import { RouterLink } from "@angular/router";
import { UserAvatarComponent } from '../user-avatar/user-avatar';
import { Project } from '../../../../models/projects';
import { FormCreateProject } from '../form-create-project/form-create-project';
import { ProjectDetailModalComponent } from '../project-detail/project-detail';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivityTypePipe } from '../../../../pipes/activity-type-pipe-pipe';


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ProjectStatusPipe, RouterLink, UserAvatarComponent, FormCreateProject, ProjectDetailModalComponent, FormsModule, ActivityTypePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  private dataSubject = new BehaviorSubject<DashboardData | null>(null);
  public dashboardData$ = this.dataSubject.asObservable();

  constructor(
    private cdr: ChangeDetectorRef,
    private dashboardService: DashboardService,
    private projectService: ProjectService,
    private toastr: ToastrService
  ) { }

  public openDropdownId: number | null = null;

  ngOnInit(): void {
    this.loadDashboardData(); // Gọi hàm load data mới
  }

  loadDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => (console.log("Dashboard data loaded successfully", data), this.dataSubject.next(data)),
      error: (err) => {
        console.error("Lỗi khi tải dashboard data:", err);
      },
      complete: () => {
        this.cdr.detectChanges();
      }
    });
  }

  toggleDropdown(itemId: number, $event: MouseEvent) {
    $event.stopPropagation();
    this.openDropdownId = this.openDropdownId === itemId ? null : itemId;
  }

  @HostListener('document:click')
  closeDropdownOnOutsideClick() {
    this.openDropdownId = null;
  }

  // (Modal "Chi tiết" của bro đã đúng, không cần sửa)
  isDetailsModalOpen = false;
  selectedProjectForDetails: Project | null = null;
  viewProjectDetails(project_id: number, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdownId = null;
    this.projectService.getProjectById(project_id).subscribe({
      next: (fullProjectData) => {
        this.selectedProjectForDetails = fullProjectData;
        this.isDetailsModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Lỗi khi lấy chi tiết project:", err);
      }
    });
  }

  closeDetailsModal() {
    this.isDetailsModalOpen = false;
    this.selectedProjectForDetails = null;
  }

  projectToDelete: any | null = null;
  isDeleteModalOpen = false;

  deleteProject(project: any, $event: MouseEvent) {
    $event.stopPropagation();
    this.projectToDelete = project;
    this.isDeleteModalOpen = true;
    this.openDropdownId = null;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.isDeleteModalOpen = false;
    this.projectToDelete = null;
  }

  confirmDelete() {
    if (!this.projectToDelete) return;
    const project_id = this.projectToDelete.project_id;

    this.projectService.deleteProject(project_id).subscribe({
      next: () => {
        const currentData = this.dataSubject.getValue();
        if (currentData) {
          // Lọc project đã xoá ra khỏi 'pendingProjects'
          const updatedProjects = currentData.pendingProjects.filter(
            (p) => p.project_id != project_id
          );
          // Đẩy data mới vào subject
          this.dataSubject.next({ ...currentData, pendingProjects: updatedProjects });
        }
        this.cancelDelete(); // Đóng modal
        this.toastr.success('Dự án đã được xoá thành công!', this.projectToDelete.project_name || 'Thành công');
      },
      error: (err) => {
        this.toastr.error('Có lỗi xảy ra khi xoá dự án.', 'Lỗi');
        this.cancelDelete(); // Đóng modal
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'to_do':
        return 'bg-gray-200 text-gray-800';
      case 'in_progress':
        return 'bg-blue-200 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-200 text-yellow-800';
      case 'over_due':
        return 'bg-red-200 text-red-800';
      case 'completed':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
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

  isChangeStatusModalOpen = false;
  projectToChangeStatus: any | null = null;
  newSelectedStatus: string = '';
  availableStatuses: string[] = ['to_do', 'in_progress', 'on_hold', 'over_due'];

  changeStatus(project_id: number, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdownId = null;

    const currentData = this.dataSubject.getValue();
    const project = currentData?.pendingProjects.find(p => p.project_id == project_id);

    if (project) {
      this.projectToChangeStatus = project;
      this.newSelectedStatus = project.status;
      this.isChangeStatusModalOpen = true;
      this.cdr.detectChanges();
    } else {
      this.toastr.error('Không tìm thấy project để thay đổi trạng thái!', 'Lỗi');
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

    this.projectService.updateProject(project_id, updatedData).subscribe({
      next: (updatedProject) => {
        const currentData = this.dataSubject.getValue();
        if (currentData) {
          const index = currentData.pendingProjects.findIndex(p => p.project_id == project_id);
          if (index !== -1) {
            currentData.pendingProjects[index] = { ...currentData.pendingProjects[index], ...updatedProject };
          }
          this.dataSubject.next({ ...currentData });
        }
        this.cancelChangeStatus();
        this.toastr.success('Thay đổi trạng thái dự án thành công!', this.projectToChangeStatus.project_name || 'Thành công');
      },
      error: (err) => {
        this.toastr.error('Có lỗi xảy ra khi thay đổi trạng thái dự án.', 'Lỗi');
        this.cancelChangeStatus();
      }
    });
  }

  isCompleteModalOpen = false;
  projectToComplete: any | null = null;

  markAsCompleted(project_id: number, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdownId = null;
    const currentData = this.dataSubject.getValue();
    const project = currentData?.pendingProjects.find(p => p.project_id == project_id);

    if (project) {
      this.projectToComplete = project;
      this.isCompleteModalOpen = true;
      this.cdr.detectChanges();
    } else {
      console.error("Không tìm thấy project để hoàn thành!");
    }
  }

  confirmComplete() {
    if (!this.projectToComplete) return;

    const project_id = this.projectToComplete.project_id;
    const updatedData = { status: 'completed' };

    this.projectService.updateProject(project_id, updatedData).subscribe({
      next: (updatedProject) => {
        const currentData = this.dataSubject.getValue();
        if (currentData) {
          const index = currentData.pendingProjects.findIndex(p => p.project_id == project_id);
          if (index !== -1) {
            const oldProject = currentData.pendingProjects[index];
            currentData.pendingProjects[index] = {
              ...oldProject,
              ...updatedProject,
              status: 'completed',
              progressPercent: 100
            };
            this.toastr.success('Dự án đã được hoàn thành!', oldProject.project_name || 'Thành công');
          }
          // Đẩy data mới vào subject
          this.dataSubject.next({ ...currentData });
        }
        this.cancelComplete();
      },
      error: (err) => {
        this.toastr.error('Có lỗi xảy ra khi hoàn thành dự án.', 'Lỗi');
        this.cancelComplete();
      }
    });
  }

  cancelComplete() {
    this.isCompleteModalOpen = false;
    this.projectToComplete = null;
  }

  // ========= Mở modal tạo/sửa project ==========
  isEditMode = false;
  selectedProject: Project | null = null;
  isModalOpen = false;

  openCreateModal() {
    this.isEditMode = false;
    this.selectedProject = null;
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  openEditProjectModal(project_id: number, event: MouseEvent) {
    this.openDropdownId = null;
    this.projectService.getProjectById(project_id).subscribe({
      next: (fullProjectData) => {
        this.selectedProject = fullProjectData;
        this.isEditMode = true;
        this.isModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Lỗi khi lấy chi tiết dự án:", err);
      }
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.selectedProject = null;
    this.cdr.detectChanges();
  }

  onProjectSaved(updatedProject: Project) {
    this.loadDashboardData();
    this.closeModal();
  }
}
