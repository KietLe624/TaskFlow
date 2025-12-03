// SỬA TRONG TASK.TS (KANBAN COMPONENT)
import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../../core/services/task/task-service';
import { Tasks } from '../../../../models/tasks';
import { AuthService } from '../../../../core/services/auth/auth';
import { ProjectService } from '../../../../core/services/project/project-service';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { UserAvatarComponent } from '../user-avatar/user-avatar';
import { FormTask } from '../form-task/form-task';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskDetailComponent } from '../task-detail/task-detail';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task',
  imports: [CommonModule, DragDropModule, UserAvatarComponent, FormTask, FormsModule, TaskDetailComponent],
  templateUrl: './task.html',
  styleUrls: ['./task.css']
})
export class TaskComponent implements OnInit {
  project_id: number | null = null;
  tasks: Tasks[] = [];
  isLoadingTasks: boolean = false;
  isSavingTask = false;
  isEdit = false;
  connectedTo: string[] = [];
  projects: any[] = [];
  filter = {
    search: '',
    priority: '',
    assignee: ''
  }
  allUsers: any[] = [];

  constructor(private taskService: TaskService, private authService: AuthService, private toastr: ToastrService, private cdr: ChangeDetectorRef, private projectService: ProjectService) { }

  kanbanColumns = [
    { status: 'to_do', title: 'To Do' },
    { status: 'in_progress', title: 'In Progress' },
    { status: 'in_review', title: 'In Review' },
    { status: 'completed', title: 'Done' },
  ];

  ngOnInit(): void {
    const user_id = this.authService.getUserIdFromToken();
    console.log('User ID lấy từ token:', user_id); // Debug user_id
    if (user_id) {
      this.loadTasks(user_id);
      this.loadProjects(user_id);
    }
    this.connectedTo = this.kanbanColumns.map(c => c.status);

  }
  // load tasks
  loadTasks(user_id: number) {
    this.taskService.getTaskByUserId(user_id).subscribe({
      next: (tasks) => {
        this.tasks = tasks;

        // SIÊU QUAN TRỌNG: LẤY project_id TỪ TASK ĐẦU TIÊN
        if (tasks.length > 0 && !this.project_id) {
          this.project_id = tasks[0].project_id!;
          console.log("Lấy project_id từ task:", this.project_id);

          // GỌI NGAY LẬP TỨC KHI CÓ projectId
          this.loadProjectMembers();
        }
      },
      error: (err) => {
        console.error('Lỗi load tasks:', err);
      }
    });
  }

  // load projects
  loadProjects(user_id: number) {
    this.projectService.getProjectsByUserId(user_id).subscribe({
      next: (projects) => {
        this.projects = projects; // gán vào biến projects
      },
      error: (err) => {
        console.error('Lỗi load projects:', err);
        this.toastr.error('Không tải được danh sách dự án');
      }
    });
  }

  // load project members
  loadProjectMembers() {
    const project_id = this.project_id;

    this.projectService.getProjectMembers(project_id!).subscribe({
      next: (response: any) => {
        this.allUsers = response;
        console.log("Danh sách thành viên:", this.allUsers);
      },
      error: (err) => {
        console.error("Lỗi lấy thành viên:", err);
        this.allUsers = [];
      }
    });
  }

  // Hàm lấy màu priority
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
  // Hàm lấy màu status
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
        return 'bg-gray-300'; // Xám

      default:
        return 'bg-gray-300'; // Mặc định
    }
  }
  // Map status thành tiêu đề hiển thị
  private statusTitle: Record<string, string> = {
    to_do: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    completed: 'Completed',
  };

  // đếm task trong từng cột
  tasksInColumn = (status: string) =>
    this.tasks.filter(t => t.status === status).length;

  // Kéo thả
  onDragStart(event: CdkDragStart) {
    console.log('Drag started', event);
  }

  onDragEnd(event: CdkDragEnd) {
    console.log('Drag ended', event);
  }

  drop(event: CdkDragDrop<Tasks[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const task = event.item.data as Tasks;
    const newStatus = event.container.id as string;

    // Optimistic update UI trước
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    // Cập nhật status trong object task
    task.status = newStatus;

    // GỌI API
    this.taskService.updateTask(task.task_id!, { status: newStatus }).subscribe({
      next: (res) => {
        console.log('Cập nhật status thành công:', res);
      },
      error: (err) => {
        console.error('Lỗi cập nhật status:', err);
        alert('Không thể cập nhật trạng thái task!');

        // Hoàn tác nếu lỗi
        task.status = event.previousContainer.id as string;
        this.tasks = [...this.tasks];
      }
    });
  }
  // end drag drop

  // dropdown
  openDropdownId: number | null = null;

  toggleDropdown(taskId: number) {
    this.openDropdownId = this.openDropdownId === taskId ? null : taskId;
  }

  isTaskDetailModalOpen = false;
  selectedTaskForDetail: Tasks | null = null;

  // Hàm mở modal
  viewDetail(task: Tasks) {
    this.selectedTaskForDetail = task;
    this.isTaskDetailModalOpen = true;
    this.openDropdownId = null;
  }

  // Hàm đóng modal
  closeDetailModal() {
    this.isTaskDetailModalOpen = false;
    this.selectedTaskForDetail = null;
  }

  isCompleteTaskModalOpen = false;
  taskToComplete: Tasks | null = null;

  isChangeStatusModalOpen = false;
  taskToChangeStatus: Tasks | null = null;
  newTaskStatus: string = '';

  // Danh sách trạng thái task
  taskStatuses = ['to_do', 'in_progress', 'in_review', 'completed'];

  // Hàm mở modal hoàn thành
  markAsDone(task: Tasks) {
    this.taskToComplete = task;
    this.isCompleteTaskModalOpen = true;
    this.openDropdownId = null;
  }

  confirmCompleteTask() {
    if (this.taskToComplete) {
      this.updateTaskStatus(this.taskToComplete, 'completed');
    }
    this.isCompleteTaskModalOpen = false;
  }

  cancelCompleteTask() {
    this.isCompleteTaskModalOpen = false;
    this.taskToComplete = null;
  }

  // Hàm thay đổi trạng thái
  changeStatus(task: Tasks) {
    this.taskToChangeStatus = task;
    this.newTaskStatus = task.status;
    this.isChangeStatusModalOpen = true;
    this.openDropdownId = null;
  }

  confirmChangeStatusTask() {
    if (this.taskToChangeStatus && this.newTaskStatus) {
      this.updateTaskStatus(this.taskToChangeStatus, this.newTaskStatus);
    }
    this.isChangeStatusModalOpen = false;
  }

  cancelChangeStatusTask() {
    this.isChangeStatusModalOpen = false;
    this.taskToChangeStatus = null;
  }

  // Hàm chung gọi API
  private updateTaskStatus(task: Tasks, newStatus: string) {
    this.taskService.updateTask(task.task_id!, { status: newStatus }).subscribe({
      next: () => {
        this.loadTasks(this.authService.getUserIdFromToken()!);
        this.toastr.success('Cập nhật trạng thái task thành công!', task.task_name);
      },
      error: () => this.toastr.error('Cập nhật thất bại', task.task_name),
    });
  }

  // Quản lý modal tạo/sửa task
  isTaskModalOpen: boolean = false;
  selectedTaskForEdit: Tasks | undefined = undefined;
  defaultProjectId: number | undefined = undefined;

  // Mở modal tạo task mới
  openCreateTaskModal(projectId?: number) {
    this.openDropdownId = null;
    this.defaultProjectId = projectId;
    this.selectedTaskForEdit = undefined;
    this.isTaskModalOpen = true;
    this.cdr.detectChanges();
  }

  // Mở modal sửa task
  openEditTaskModal(task: Tasks) {
    this.openDropdownId = null;
    this.selectedTaskForEdit = task;
    this.isTaskModalOpen = true;
    this.isEdit = true;
    this.cdr.detectChanges();
  }

  // Đóng modal
  closeTaskForm() {
    this.isTaskModalOpen = false;
    this.selectedTaskForEdit = undefined;
    this.defaultProjectId = undefined;
    this.cdr.detectChanges();
  }

  // Khi task được tạo/sửa thành công → reload danh sách
  onTaskSaved(savedTask: Tasks) {
    this.closeTaskForm();
    this.loadTasks(this.authService.getUserIdFromToken()!);
    if (this.isEdit) {
      this.toastr.success(
        `Task "${savedTask.task_name}" đã được cập nhật thành công!`,
        'Cập nhật task',
      );
    } else {
      this.toastr.success(
        `Task "${savedTask.task_name}" đã được tạo thành công!`,
        'Tạo task mới',
      );
    }
  }

  deleteTask(task: Tasks) {
    // Thay thế confirm() bằng Swal.fire()
    Swal.fire({
      title: 'Bạn chắc chắn chứ?',
      text: `Bạn sắp xoá công việc "${task.task_name}". Hành động này không thể hoàn tác!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Màu đỏ cho nút xoá
      cancelButtonColor: '#3085d6', // Màu xanh cho nút huỷ
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Huỷ bỏ'
    }).then((result) => {
      if (result.isConfirmed) {

        // Gọi API xoá
        this.taskService.deleteTask(task.task_id).subscribe({
          next: () => {
            // 1. Cập nhật UI
            this.tasks = this.tasks.filter(t => t.task_id !== task.task_id);
            this.openDropdownId = null;

            // 2. Hiện thông báo thành công nhỏ gọn
            Swal.fire({
              title: 'Đã xoá!',
              text: `Công việc "${task.task_name}" đã được xoá thành công.`,
              icon: 'success',
              timer: 2000, // Tự tắt sau 2 giây
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Lỗi!', `Không thể xoá công việc "${task.task_name}".`, 'error');
          }
        });
      }
    });
  }

  // Hàm lọc tasks
  tasksByStatus(status: string): Tasks[] {
    let tasks = this.tasks.filter(t => t.status === status);

    // Lọc theo từ khóa
    if (this.filter.search.trim()) {
      const keyword = this.filter.search.toLowerCase();
      tasks = tasks.filter(t =>
        t.task_name.toLowerCase().includes(keyword) ||
        (t.description && t.description.toLowerCase().includes(keyword))
      );
    }

    // Lọc theo ưu tiên
    if (this.filter.priority) {
      tasks = tasks.filter(t => t.priority === this.filter.priority);
    }

    // Lọc theo người được giao
    if (this.filter.assignee) {
      const selectedUserId = Number(this.filter.assignee);
      tasks = tasks.filter(task =>
        task.assignees?.some((a: any) => a.user_id === selectedUserId)
      );
    }

    return tasks;
  }

  // ÁP DỤNG LỌC
  applyFilter() {
    // Tự động cập nhật do tasksByStatus() được gọi lại
  }

  // xoá bộ lọc
  clearFilter() {
    this.filter = { search: '', priority: '', assignee: '' };
  }
  // Đếm tổng số task sau khi lọc
  filteredTaskCount(): number {
    return this.tasksByStatus('to_do').length +
      this.tasksByStatus('in_progress').length +
      this.tasksByStatus('in_review').length +
      this.tasksByStatus('completed').length;
  }
}
