import { ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DashboardData,
} from '../../../../models/dashboards';
import { Observable } from 'rxjs/internal/Observable';
import { DashboardService } from '../../../../core/services/dashboard/dashboard';
import { ProjectService } from '../../../../core/services/project/project-service';
import { ProjectStatusPipe } from '../../../../pipes/project-status-pipe';
import { RouterLink } from "@angular/router";
import { UserAvatarComponent } from '../user-avatar/user-avatar';
import { Project } from '../../../../models/projects';
import { FormCreateProject } from '../form-create-project/form-create-project';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ProjectStatusPipe, RouterLink, UserAvatarComponent, FormCreateProject],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  constructor(private cdr: ChangeDetectorRef, private dashboardService: DashboardService, private projectService: ProjectService) { }

  public openDropdownId: number | null = null;

  ngOnInit(): void {
    this.dashboardData$ = this.dashboardService.getDashboardData();
  }

  public dashboardData$!: Observable<DashboardData>;

  toggleDropdown(itemId: number, $event: MouseEvent) {
    $event.stopPropagation(); // Ngăn click lan ra ngoài, đóng menu ngay lập tức

    if (this.openDropdownId === itemId) {
      this.openDropdownId = null; // Đóng lại nếu đang mở
    } else {
      this.openDropdownId = itemId; // Mở cái mới
    }
  }

  @HostListener('document:click')
  closeDropdownOnOutsideClick() {
    this.openDropdownId = null; // Đóng bất kỳ dropdown nào đang mở
  }

  viewProjectDetails(taskId: number, $event: MouseEvent) {
    $event.stopPropagation(); // Ngăn menu tự đóng
    console.log("Xem chi tiết công việc:", taskId);
    this.openDropdownId = null; // Đóng menu sau khi click
    // TODO: Thêm logic (ví dụ: mở modal hoặc điều hướng)
  }

  deleteProject(projectId: number, $event: MouseEvent) {
    $event.stopPropagation(); // Ngăn menu tự đóng
    console.log("Xóa dự án:", projectId);
    this.openDropdownId = null; // Đóng menu sau khi click
  }


  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-400';
      case 'on_hold': return 'bg-orange-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-blue-500'; // active
    }
  }

  markAsCompleted(id: number, event: MouseEvent) {
    event.stopPropagation();
    console.log(' Đánh dấu hoàn thành:', id);
    this.openDropdownId = null;
  }

  changeStatus(id: number, event: MouseEvent) {
    event.stopPropagation();
    console.log(' Thay đổi trạng thái:', id);
    this.openDropdownId = null;
  }

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
    this.projectService.getProjectById(project_id).subscribe({
      next: (fullProjectData) => {
        this.selectedProject = fullProjectData; // <-- Đây là data đầy đủ
        this.isEditMode = true;
        this.isModalOpen = true; // <-- Mở modal SAU KHI có data
        this.openDropdownId = null;
        this.cdr.detectChanges(); // Báo cho Angular cập nhật UI
      },
      error: (err) => {
        console.error("Lỗi khi lấy chi tiết dự án:", err);
        // TODO: Báo lỗi cho user (ví dụ: Toastr)
      }
    });
  }
  // 6. Thêm các hàm xử lý modal
  closeModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.selectedProject = null;
    this.cdr.detectChanges();
  }

  onProjectSaved(updatedProject: Project) {
    this.dashboardData$ = this.dashboardService.getDashboardData();
    this.closeModal(); // Đóng modal sau khi lưu
    this.cdr.detectChanges();
  }
}
