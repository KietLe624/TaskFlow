import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { TaskService } from '../../../../core/services/task/task-service';
import { ProjectPriorityPipe } from '../../../../pipes/project-priority-pipe';
import { ProjectStatusPipe } from '../../../../pipes/project-status-pipe';
import { Tasks } from '../../../../models/tasks';
import { ToastrService } from 'ngx-toastr';
import { UserAvatarComponent } from '../user-avatar/user-avatar';
import { ProjectService } from '../../../../core/services/project/project-service';

@Component({
  selector: 'app-form-task',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, ProjectStatusPipe, ProjectPriorityPipe, UserAvatarComponent],
  templateUrl: './form-task.html',
  styleUrls: ['./form-task.css']
})

export class FormTask implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  constructor(private taskService: TaskService, private cdr: ChangeDetectorRef, private toastr: ToastrService, private projectService: ProjectService) { }

  @Input() initialValue: any | null = null;
  @Input() projects: Array<{ project_id: number; project_name: string }> = [];
  @Input() parentCandidates: Array<{ task_id: number; task_name: string }> = [];
  @Input() selectedTask: Tasks | null | undefined = null;
  @Input() defaultProjectId?: number | null = null;
  @Input() isEditMode = false;

  @Output() taskSaved = new EventEmitter<Tasks>();
  @Output() closed = new EventEmitter<void>();

  statuses: string[] = [];
  priorities: string[] = [];
  projectMembers: any[] = [];
  selectedAssignees: any[] = [];

  dateError = false;
  loading = false;
  isSubmitting = false;

  taskForm = this.fb.group({
    project_id: this.fb.control<number | null>(null),
    task_name: this.fb.control<string | null>(null, [Validators.required, Validators.maxLength(255)]),
    parent_id: this.fb.control<number | null>(null),
    description: [''],
    status: ['to_do', Validators.required],
    priority: ['medium', Validators.required],
    start_date: this.fb.control<string | null>(null),
    due_date: this.fb.control<string | null>(null),
  });

  ngOnInit(): void {
    this.loadStatus();
    this.loadPriorities();

    this.taskForm.get('project_id')?.valueChanges.subscribe(projectId => {
      this.loadProjectMembers(projectId);
    });

    if (this.defaultProjectId) {
      this.taskForm.patchValue({ project_id: this.defaultProjectId });
      this.loadProjectMembers(this.defaultProjectId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTask'] && this.isEditMode && this.selectedTask) {
      this.fillFormData();
      if (this.selectedTask.project_id) {
        this.loadProjectMembers(this.selectedTask.project_id);
      }
      if (this.selectedTask.assignees?.length) {
        this.selectedAssignees = this.selectedTask.assignees;
      }
    }
  }

  private loadProjectMembers(projectId: number | null) {
    if (!projectId) {
      this.projectMembers = [];
      return;
    }
    this.projectService.getProjectMembers(projectId).subscribe({
      next: (members) => {
        this.projectMembers = members;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi load members:', err);
        this.projectMembers = [];
      }
    });
  }

  private fillFormData() {
    if (!this.selectedTask) return;
    const t = this.selectedTask;
    this.taskForm.patchValue({
      project_id: t.project_id,
      parent_id: t.parent_id ?? null,
      task_name: t.task_name,
      description: t.description ?? '',
      status: t.status,
      priority: t.priority,
      start_date: this.toDateInput(t.start_date),
      due_date: this.toDateInput(t.due_date),
    });
  }

  private toDateInput(v: string | Date | null | undefined) {
    if (!v) return null;
    const d = new Date(v);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  // getter cho form controls
  get f() {
    return this.taskForm.controls;
  }

  submitTaskForm() {
    // nếu invalid -> show lỗi ngay
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload: any = {
      ...this.taskForm.value,
      assignee_ids: this.selectedAssignees.map(m => m.user_id)
    };

    if (this.isEditMode && this.selectedTask) {
      this.taskService.updateTask(this.selectedTask.task_id!, payload).subscribe({
        next: (res) => {
          const updatedTask = (res as any).task || res;
          this.taskSaved.emit(updatedTask);
          this.isSubmitting = false;
          this.close();
        },
        error: (err) => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.taskService.createTask(payload).subscribe({
        next: (res) => {
          const newTask = (res as any).task || res;
          this.taskSaved.emit(newTask);
          this.isSubmitting = false;
          this.close();
        },
        error: (err) => {
          this.isSubmitting = false;
        }
      });
    }
  }

  private close() {
    this.closed.emit();
  }

  cancel() {
    this.close();  // Chỉ gọi cái này
  }
  // Toggle chọn/gỡ thành viên
  toggleAssignee(member: any) {
    const index = this.selectedAssignees.findIndex(m => m.user_id === member.user_id);
    if (index > -1) {
      this.selectedAssignees.splice(index, 1);
    } else {
      this.selectedAssignees.push(member);
    }
  }

  // Kiểm tra đã chọn chưa (dùng trong template)
  isAssigneeSelected(member: any): boolean {
    return this.selectedAssignees.some(m => m.user_id === member.user_id);
  }

  // load thêm trạng thái và độ ưu tiên từ backend
  loadStatus() {
    this.taskService.getStatus().subscribe(statuses => {
      this.statuses = statuses;
      this.cdr.detectChanges();
      console.log('Statuses loaded:', this.statuses);
    });
  }

  loadPriorities() {
    this.taskService.getPriorities().subscribe(priorities => {
      this.priorities = priorities;
      this.cdr.detectChanges();
      console.log('Priorities loaded:', this.priorities);
    });
  }
}
