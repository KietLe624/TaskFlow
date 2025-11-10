import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Project } from '../../../../models/projects';
import { ProjectService } from '../../../../core/services/project/project-service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectStatusPipe } from '../../../../pipes/project-status-pipe';
import { ProjectPriorityPipe } from '../../../../pipes/project-priority-pipe';
import { TaskService } from '../../../../core/services/task/task-service';
import { FormTask } from '../../components/form-task/form-task';
import { Tasks } from '../../../../models/tasks';
import { FormTeamComponent } from '../form-team/form-team';
import { TeamService } from '../../../../core/services/team/team-service';
import { ToastrService } from 'ngx-toastr';
import { UserAvatarComponent } from '../user-avatar/user-avatar';

@Component({
  selector: 'app-page-project-detail',
  imports: [
    CommonModule,
    ProjectStatusPipe,
    ProjectPriorityPipe,
    FormTask,
    FormTeamComponent,
    UserAvatarComponent
  ],
  templateUrl: './page-project-detail.html',
  styleUrls: ['./page-project-detail.css'],
})
export class PageProjectDetailComponent implements OnInit {
  isLoadingDetail: boolean = true;
  projectDetail: any = null;
  errMsg: string = '';
  isTaskModalOpen = false;
  isSavingTask = false;
  tasksInProject: any[] = [];
  isEdit = false;
  selectedTask?: Tasks;
  projectTasks: Tasks[] = [];
  currentProgress: number = 0;

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private taskService: TaskService,
    private teamService: TeamService,
    private toastr: ToastrService
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

    this.projectService.getProjectById(project_id).subscribe({
      next: (data: Project) => {
        this.projectDetail = data;
        if (this.projectDetail && this.projectDetail.team_id) {
          this.loadTeams(this.projectDetail.team_id);
        }
        this.isLoadingDetail = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errMsg = 'Lỗi tải chi tiết dự án: ' + err.message;
        this.isLoadingDetail = false;
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

  // create task
  loadTasks() {
    const projectId = this.projectDetail?.project_id;
    this.taskService.getTasksByProjectId(projectId).subscribe({
      next: (res) => (this.tasksInProject = res || []),
      error: (err) => console.error('Load tasks error:', err),
    });
    this.cdr.detectChanges();
  }

  openCreateTask() {
    this.isEdit = false;
    this.selectedTask = undefined;
    this.isTaskModalOpen = true;
    this.cdr.detectChanges();
  }

  openEditTask(t: Tasks) {
    this.isEdit = true;
    this.loadTasks();
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
    if (this.isEdit) {
      const idx = this.tasksInProject.findIndex(
        (x) => x.task_id === task.task_id
      );
      if (idx > -1) this.tasksInProject[idx] = task;
    } else {
      this.tasksInProject.unshift(task);
    }
    this.closeTaskModal();
    this.cdr.detectChanges();
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
  // ===============================
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
    this.loadProjectDetails(this.projectDetail.project_id);
    this.loadTeams(team.team_id);
    this.cdr.detectChanges();
    this.closeTeamModal();
    this.toastr.success('Tạo team thành công!');
  }

  teams: any[] = []; // Biến chứa danh sách team
  isLoadingTeams = false;

loadTeams(team_id: number) {
  this.isLoadingTeams = true;
  this.teamService.getTeamMembers(team_id).subscribe({
    next: (res: any) => {
      if (res && res.team) {
          // Quan trọng: Bọc res.team vào mảng [] vì HTML đang dùng vòng lặp @for
          this.teams = [res.team];
      } else {
          this.teams = [];
      }
      this.isLoadingTeams = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Lỗi load team:', err);
      this.teams = [];
      this.isLoadingTeams = false;
    }
  });
}

}
