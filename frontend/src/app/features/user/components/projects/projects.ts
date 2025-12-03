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
import { TeamService } from '../../../../core/services/team/team-service';
import Swal from 'sweetalert2';



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

  isEditMode = false;
  selectedProject: Project | null = null;

  allProjects: Project[] = [];

  // Biến cho bộ lọc
  searchText: string = '';
  filterStatus: string = '';
  filterPriority: string = '';
  availableStatuses: string[] = ['to_do', 'in_progress', 'on_hold', 'completed', 'over_due'];

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private teamService: TeamService
  ) { }

  ngOnInit(): void {
    this.loadProjects();
    this.loadTeams();
    this.cdr.detectChanges();
  }

  loadTeams(): void {
    this.teamService.getAllTeamsByOwner().subscribe({
      next: (data) => {
        this.teams = data;
        console.log('Teams đã tải:', this.teams);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách teams:', err);
        this.toastr.error('Không thể tải danh sách nhóm.');
      }
    });
  }

  getProjectMembers(project: Project): any[] {
    const allMembers = new Map<number, any>();
    if (Array.isArray(project.members)) {
      for (const member of project.members) {
        allMembers.set(member.user_id, member);
      }
    }
    if (project.team && Array.isArray(project.team.members)) {
      for (const member of project.team.members) {
        // Chỉ thêm nếu họ chưa có trong danh sách
        if (!allMembers.has(member.user_id)) {
          allMembers.set(member.user_id, member);
        }
      }
    }
    return Array.from(allMembers.values());
  }

  loadProjects(): void {
    this.isLoading = true;
    const user_id = this.authService.getUserIdFromToken();

    this.projectService.getProjectsByUserId(user_id).subscribe({
      next: (projects) => {
        this.allProjects = projects; // lưu tất cả projects
        this.applyFilter(); // gọi lọc
        this.isLoading = false;
        console.log(' Projects từ backend:', projects);
      },
      error: (err) => {
        console.error(' Lỗi khi load projects:', err);
        this.isLoading = false;
      },
    });
    this.cdr.markForCheck();
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
    const index = this.projects.findIndex(
      (p) => p.project_id === updatedProject.project_id
    );
    if (this.isEditMode) {
      const index = this.projects.findIndex(
        (p) => p.project_id === updatedProject.project_id
      );
      if (index !== -1) {
        this.projects[index] = { ...this.projects[index], ...updatedProject };
        this.toastr.success('Cập nhật dự án thành công!', updatedProject.project_name);
      }
    } else {
      const exists = this.projects.some(p => p.project_id === updatedProject.project_id);
      if (!exists) {
        this.projects.push(updatedProject);
        this.toastr.success('Tạo dự án thành công!', updatedProject.project_name);
      }
    }
    this.projects = [...this.projects];
    this.isModalOpen = false; // Tự đóng modal khi save
    this.cdr.detectChanges();
  }

  toggleLayout(): void {
    this.isGrid = !this.isGrid;
    this.cdr.detectChanges();
  }

  openDropdownId: number | null = null;
  @HostListener('document:click')

  closeDropdown() {
    this.openDropdownId = null;
  }

  isDetailsModalOpen = false;
  selectedProjectForDetails: Project | null = null;

  viewProjectDetails(project_id: number, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdownId = null; // Đóng dropdown
    // Gọi service để lấy data
    this.projectService.getProjectById(project_id).subscribe({
      next: (fullProjectData) => {
        this.selectedProjectForDetails = fullProjectData;
        this.isDetailsModalOpen = true;
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
  // thay đỏi trạng thái
  changeStatus(id: number, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdownId = null;

    // Tìm project trong danh sách
    const project = this.projects.find((p) => p.project_id === id);

    if (!project) {
      this.toastr.error('Không tìm thấy dự án!');
      return;
    }

    // Danh sách trạng thái
    const statusOptions = [
      { value: 'to_do', label: 'To Do', icon: 'fa-solid fa-list-check', color: 'text-gray-600', bg: 'bg-gray-50', border: 'peer-checked:border-gray-500 peer-checked:bg-gray-50' },
      { value: 'in_progress', label: 'In Progress', icon: 'fa-solid fa-spinner fa-spin', color: 'text-blue-600', bg: 'bg-blue-50', border: 'peer-checked:border-blue-500 peer-checked:bg-blue-50' },
      { value: 'on_hold', label: 'On Hold', icon: 'fa-solid fa-pause', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'peer-checked:border-yellow-500 peer-checked:bg-yellow-50' },
      { value: 'completed', label: 'Completed', icon: 'fa-solid fa-circle-check', color: 'text-green-600', bg: 'bg-green-50', border: 'peer-checked:border-green-500 peer-checked:bg-green-50' }
    ];

    // Tạo HTML
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
        popup: 'rounded-2xl shadow-xl w-full max-w-md',
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

        this.projectService.updateProject(id, updatedData).subscribe({
          next: (updatedProject) => {
            const idxAll = this.allProjects.findIndex(p => p.project_id === id);
            if (idxAll !== -1) {
              this.allProjects[idxAll] = { ...this.allProjects[idxAll], ...updatedProject };
            }

            const idx = this.projects.findIndex(p => p.project_id === id);
            if (idx !== -1) { // idx: chỉ số trong mảng đã lọc
              this.projects[idx] = { ...this.projects[idx], ...updatedProject };
            } else {
              this.applyFilter();
            }

            // Tạo bản sao để kích hoạt thay đổi
            this.allProjects = [...this.allProjects];
            this.projects = [...this.projects];

            if (this.selectedProjectForDetails?.project_id === id) {
              this.selectedProjectForDetails = { ...this.selectedProjectForDetails, ...updatedProject };
            }
            // ép angular cập nhật giao diện
            this.cdr.markForCheck();
            this.cdr.detectChanges();

            Swal.fire({
              title: 'Thành công!',
              text: `Đã chuyển sang: ${newStatus}`,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              customClass: { popup: 'rounded-2xl' }
            });
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Lỗi cập nhật trạng thái.');
          }
        });
      }
    });
  }

  // đánh dấu hoàn thành
  markAsCompleted(id: number, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdownId = null;

    const project = this.projects.find((p) => p.project_id === id);

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

        this.projectService.updateProject(id, updatedData).subscribe({
          next: (updatedProject) => {
            const index = this.projects.findIndex(p => p.project_id === id);
            if (index !== -1) {
              this.projects[index] = {
                ...this.projects[index],
                ...updatedProject,
                status: 'completed',
                progressPercent: 100
              };
              this.projects = [...this.projects];
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

  // xoá dự án
  deleteProject(project_id: number, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdownId = null;

    const project = this.projects.find(p => p.project_id === project_id);
    const projectName = project ? project.project_name : 'dự án này';

    Swal.fire({
      title: `<span class="text-lg font-bold text-gray-800">Xoá dự án?</span>`,
      html: `
        <div class="text-sm text-gray-600">
          Bạn sắp xoá <b>"${projectName}"</b>.
          <br><span class="text-xs text-red-500 mt-1 block">Hành động này không thể hoàn tác!</span>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xoá ngay',
      cancelButtonText: 'Huỷ',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl shadow-xl w-full max-w-sm',
        confirmButton: 'px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors ml-2',
        cancelButton: 'px-5 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.deleteProject(project_id).subscribe({
          next: () => {
            this.projects = this.projects.filter(p => p.project_id !== project_id);
            // Reset modal edit nếu đang mở đúng project đó
            if (this.selectedProject && this.selectedProject.project_id === project_id) {
              this.selectedProject = null;
              this.isModalOpen = false;
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

  // Thêm biến lưu toạ độ
  dropdownPosition = { top: 0, left: 0 };

  toggleDropdown(projectId: number, event: MouseEvent) {
    event.stopPropagation();

    if (this.openDropdownId === projectId) {
      this.openDropdownId = null;
    } else {
      this.openDropdownId = projectId;
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      const dropdownWidth = 208;
      this.dropdownPosition = {
        top: rect.bottom + 5,
        left: rect.right - dropdownWidth
      };
    }
  }

  // Thêm HostListener để đóng menu khi cuộn chuột (Vì fixed không trôi theo bảng)
  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    if (this.openDropdownId !== null) {
      this.openDropdownId = null;
    }
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

  // lọc project
  applyFilter() {
    this.projects = this.allProjects.filter(project => {
      // Lọc theo tên (không phân biệt hoa thường)
      const matchesSearch = !this.searchText ||
        project.project_name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (project.client && project.client.toLowerCase().includes(this.searchText.toLowerCase()));
      // Lọc theo trạng thái
      const matchesStatus = !this.filterStatus || project.status === this.filterStatus;
      // Lọc theo độ ưu tiên
      const matchesPriority = !this.filterPriority || project.priority === this.filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  resetFilter() {
    this.searchText = '';
    this.filterStatus = '';
    this.filterPriority = '';
    this.applyFilter();
  }
}
