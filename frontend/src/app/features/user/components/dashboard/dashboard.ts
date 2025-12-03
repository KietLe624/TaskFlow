import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardData } from '../../../../models/dashboards';
import { BehaviorSubject } from 'rxjs';
import { DashboardService } from '../../../../core/services/dashboard/dashboard';
import { ProjectService } from '../../../../core/services/project/project-service';
import { ProjectStatusPipe } from '../../../../pipes/project-status-pipe';
import { RouterLink } from "@angular/router";
import { UserAvatarComponent } from '../user-avatar/user-avatar';
import { Project } from '../../../../models/projects';
import { Tasks } from '../../../../models/tasks';
import { FormCreateProject } from '../form-create-project/form-create-project';
import { ProjectDetailModalComponent } from '../project-detail/project-detail';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TaskService } from '../../../../core/services/task/task-service';
import { ActivityTypePipe } from '../../../../pipes/activity-type-pipe-pipe';
import { SearchModal } from '../search-modal/search-modal';
import { SearchModalService } from '../../../../core/services/search-modal/search-modal-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ProjectStatusPipe, RouterLink, UserAvatarComponent, FormCreateProject, ProjectDetailModalComponent, FormsModule, ActivityTypePipe, SearchModal],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  private dataSubject = new BehaviorSubject<DashboardData | null>(null);
  public dashboardData$ = this.dataSubject.asObservable();

  isSearchOpen = false;
  projects: Project[] = [];
  tasks: Tasks[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private dashboardService: DashboardService,
    private projectService: ProjectService,
    private toastr: ToastrService,
    private taskService: TaskService,
    private searchService: SearchModalService
  ) { }

  public openDropdownId: number | null = null;

  ngOnInit(): void {
    this.loadDashboardData();
    this.searchService.open$.subscribe(() => {
      this.isSearchOpen = true;
      this.cdr.detectChanges();
    });
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

  // Thay đổi trạng thái
  changeStatus(project_id: number, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdownId = null;

    const currentData = this.dataSubject.getValue();
    const project = currentData?.pendingProjects.find(p => p.project_id == project_id);

    if (!project) {
      this.toastr.error('Không tìm thấy dự án!');
      return;
    }

    // Định nghĩa danh sách trạng thái với Icon & Màu sắc
    const statusOptions = [
      { value: 'to_do', label: 'To Do', icon: 'fa-solid fa-list-check', color: 'text-gray-600', bg: 'bg-gray-50', border: 'peer-checked:border-gray-500 peer-checked:bg-gray-50' },
      { value: 'in_progress', label: 'In Progress', icon: 'fa-solid fa-spinner fa-spin', color: 'text-blue-600', bg: 'bg-blue-50', border: 'peer-checked:border-blue-500 peer-checked:bg-blue-50' },
      { value: 'on_hold', label: 'On Hold', icon: 'fa-solid fa-pause', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'peer-checked:border-yellow-500 peer-checked:bg-yellow-50' },
      { value: 'completed', label: 'Completed', icon: 'fa-solid fa-circle-check', color: 'text-green-600', bg: 'bg-green-50', border: 'peer-checked:border-green-500 peer-checked:bg-green-50' }
    ];

    // Tạo HTML custom (Giảm padding xuống p-3 cho nhỏ gọn)
    const inputOptionsHtml = statusOptions.map(opt => `
      <div class="relative">
        <input type="radio" name="swal-status" id="status-${opt.value}" value="${opt.value}" class="peer hidden" ${project.status === opt.value ? 'checked' : ''}>
        <label for="status-${opt.value}" class="flex items-center justify-between p-3 mb-2 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${opt.border}">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 flex items-center justify-center rounded-full ${opt.bg} ${opt.color}">
              <i class="${opt.icon} text-sm"></i>
            </div>
            <div class="text-left">
              <div class="font-semibold text-sm text-gray-700">${opt.label}</div>
            </div>
          </div>
          <div class="hidden peer-checked:block text-blue-600">
            <i class="fa-solid fa-circle-check text-lg"></i>
          </div>
        </label>
      </div>
    `).join('');

    Swal.fire({
      title: `<span class="text-lg font-bold text-gray-800">Cập nhật trạng thái</span>`,
      html: `
        <p class="text-sm text-gray-500 mb-3">Dự án: <b>${project.project_name}</b></p>
        <div class="flex flex-col gap-1 text-left">
          ${inputOptionsHtml}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu',
      cancelButtonText: 'Huỷ',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl shadow-xl w-full max-w-md', // Giới hạn chiều rộng max-w-md cho nhỏ gọn
        confirmButton: 'px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors ml-2',
        cancelButton: 'px-5 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors'
      },
      focusConfirm: false,
      preConfirm: () => {
        const selected = (document.querySelector('input[name="swal-status"]:checked') as HTMLInputElement)?.value;
        if (!selected) {
          Swal.showValidationMessage('Vui lòng chọn một trạng thái!');
          return false;
        }
        if (selected === project.status) {
          Swal.showValidationMessage('Vui lòng chọn trạng thái khác!');
          return false;
        }
        return selected;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newStatus = result.value;
        const updatedData = { status: newStatus };

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
            Swal.fire({
              title: 'Thành công!',
              text: `Đã chuyển sang: ${newStatus}`,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              customClass: { popup: 'rounded-2xl' }
            });
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Lỗi cập nhật trạng thái.');
          }
        });
      }
    });
  }

  // Đánh dấu hoàn thành
  markAsCompleted(project_id: number, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdownId = null;

    const currentData = this.dataSubject.getValue();
    const project = currentData?.pendingProjects.find(p => p.project_id == project_id);

    if (!project) {
      this.toastr.error('Không tìm thấy dự án!');
      return;
    }

    Swal.fire({
      title: `<span class="text-lg font-bold text-gray-800">Hoàn thành dự án?</span>`,
      html: `
        <div class="text-sm text-gray-600">
          Bạn muốn đánh dấu <b>"${project.project_name}"</b> là hoàn thành?
          <br><span class="text-xs text-gray-400 mt-1 block">Tiến độ sẽ được cập nhật lên 100% 🚀</span>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Để sau',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl shadow-xl w-full max-w-sm',
        confirmButton: 'px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors ml-2',
        cancelButton: 'px-5 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedData = { status: 'completed' };

        this.projectService.updateProject(project_id, updatedData).subscribe({
          next: (updatedProject) => {
            const currentData = this.dataSubject.getValue();
            if (currentData) {
              const index = currentData.pendingProjects.findIndex(p => p.project_id == project_id);
              if (index !== -1) {
                currentData.pendingProjects[index] = {
                  ...currentData.pendingProjects[index],
                  ...updatedProject,
                  status: 'completed',
                  progressPercent: 100
                };
              }
              this.dataSubject.next({ ...currentData });
            }

            Swal.fire({
              title: 'Tuyệt vời!',
              text: 'Dự án đã về đích thành công!',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: { popup: 'rounded-2xl' }
            });
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Có lỗi xảy ra.');
          }
        });
      }
    });
  }

  // Xoá dự án
  deleteProject(project: any, $event: MouseEvent) {
    $event.stopPropagation();
    this.openDropdownId = null;

    Swal.fire({
      title: `<span class="text-lg font-bold text-gray-800">Xoá dự án này?</span>`,
      html: `
        <div class="text-sm text-gray-600">
          Bạn sắp xoá <b>"${project.project_name || project.name}"</b>.
          <br><span class="text-xs text-red-500 mt-1 block">Hành động này không thể hoàn tác!</span>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xoá ngay',
      cancelButtonText: 'Huỷ',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl shadow-xl w-full max-w-sm', // Popup nhỏ gọn
        confirmButton: 'px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors ml-2',
        cancelButton: 'px-5 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.deleteProject(project.project_id).subscribe({
          next: () => {
            this.projects = this.projects.filter(p => p.project_id !== project.project_id);
            if (this.selectedProject && this.selectedProject.project_id === project.project_id) {
              this.selectedProject = null;
            }

            // Cập nhật lại Dashboard Data (DataSubject)
            const currentData = this.dataSubject.getValue();
            if (currentData) {
              currentData.pendingProjects = currentData.pendingProjects.filter(p => p.project_id !== project.project_id);
              this.dataSubject.next({ ...currentData });
            }

            Swal.fire({
              title: 'Đã xoá!',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              customClass: { popup: 'rounded-2xl' }
            });
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Lỗi khi xoá dự án.');
          }
        });
      }
    });
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

  // modal tìm kiếm
  handleSearch(filters: any) {
    this.taskService.searchTasks(filters).subscribe(data => {
      this.tasks = data; // Cập nhật danh sách task
      this.isSearchOpen = false; // Đóng modal
    });
  }
}
