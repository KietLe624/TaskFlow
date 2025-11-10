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

@Component({
  selector: 'app-page-project-detail',
  imports: [CommonModule, ProjectStatusPipe, ProjectPriorityPipe, FormTask],
  templateUrl: './page-project-detail.html',
  styleUrls: ['./page-project-detail.css']
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

  constructor(private projectService: ProjectService, private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef, private taskService: TaskService) { }

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
        this.isLoadingDetail = false;
      },
      error: (err) => {
        this.errMsg = 'Failed to load project details.';
        this.isLoadingDetail = false;
      }
    });
  }
  // chuyển tab
  activeTab: string = 'overview';

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  // color status badge
  getStatusClasses(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700';
      case 'over_due':
        return 'bg-red-100 text-red-700';
      case 'to_do':
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  // color priority badge
  getPriorityClasses(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  private statusTitle: Record<string, string> = {
    to_do: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    completed: 'Completed'
  };

  taskColumns() {
    const tasks = this.projectDetail?.tasks ?? [];

    const groups: Record<string, any[]> = {
      to_do: [],
      in_progress: [],
      in_review: [],
      completed: []
    };

    for (const t of tasks) {
      const k = (t.status ?? 'to_do') as keyof typeof groups;
      (groups[k] ?? groups['to_do']).push(t);
    }

    return [
      { key: 'to_do', title: this.statusTitle['to_do'], items: groups['to_do'] },
      { key: 'in_progress', title: this.statusTitle['in_progress'], items: groups['in_progress'] },
      { key: 'in_review', title: this.statusTitle['in_review'], items: groups['in_review'] },
      { key: 'completed', title: this.statusTitle['completed'], items: groups['completed'] },
    ];
  }

  // format
  taskPriorityBadge(p?: string) {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
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
    console.log('Open create task modal');
  }

  openEditTask(t: Tasks) {
    this.isEdit = true;
    this.selectedTask = t;
    this.isTaskModalOpen = true;
  }

  closeTaskModal() {
    this.isTaskModalOpen = false;
    this.selectedTask = undefined;
  }

  handleTaskSaved(task: Tasks) {
    if (this.isEdit) {
      const idx = this.tasksInProject.findIndex(x => x.task_id === task.task_id);
      if (idx > -1) this.tasksInProject[idx] = task;
    } else {
      this.tasksInProject.unshift(task);
    }
    this.closeTaskModal();
    this.cdr.detectChanges();
  }

}
