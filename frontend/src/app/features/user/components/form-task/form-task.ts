import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../../../core/services/task/task-service';
import { ProjectPriorityPipe } from '../../../../pipes/project-priority-pipe';
import { ProjectStatusPipe } from '../../../../pipes/project-status-pipe';
import { Tasks } from '../../../../models/tasks';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-form-task',
  imports: [ReactiveFormsModule, CommonModule, ProjectStatusPipe, ProjectPriorityPipe],
  templateUrl: './form-task.html',
  styleUrls: ['./form-task.css']
})

export class FormTask implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  constructor(private taskService: TaskService, private cdr: ChangeDetectorRef, private toastr: ToastrService) { }

  @Input() initialValue: any | null = null;

  @Input() projects: Array<{ project_id: number; project_name: string }> = [];
  @Input() parentCandidates: Array<{ task_id: number; task_name: string }> = [];
  @Input() selectedTask?: Tasks;

  @Input() defaultProjectId?: number;

  @Input() isEditMode = false;
  @Input() initialTask?: Tasks;

  @Output() saved = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() taskSaved = new EventEmitter<Tasks>();
  @Output() closeModal = new EventEmitter<void>();

  statuses: string[] = [];
  priorities: string[] = [];

  dateError = false;
  loading = false;
  isSubmitting = false;

  taskForm = this.fb.group({
    project_id: this.fb.control<number | null>(null, Validators.required),
    task_name: this.fb.control<string | null>(null, [Validators.required, Validators.maxLength(255)]),
    parent_id: this.fb.control<number | null>(null),
    description: [''],
    status: ['to_do', Validators.required],
    priority: ['medium', Validators.required],
    start_date: this.fb.control<string | null>(null),
    due_date: this.fb.control<string | null>(null),
  });

  ngOnInit(): void {
    if (!this.isEditMode && this.defaultProjectId) {
      this.taskForm.patchValue({ project_id: this.defaultProjectId });
    }
    if (this.isEditMode && this.selectedTask) {
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
    this.loadStatus();
    this.loadPriorities();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTask'] && this.selectedTask && this.isEditMode) {
      this.fillFormData();
    }
    if (changes['defaultProjectId'] && this.defaultProjectId && !this.isEditMode) {
      this.taskForm.patchValue({ project_id: this.defaultProjectId });
    }
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

  submitTaskForm() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Lấy dữ liệu form và chuẩn hoá payload gửi BE
    const formValue = this.taskForm.value;
    const payload: any = {
      project_id: this.taskForm.get('project_id')?.value,
      task_name: (formValue.task_name || '').trim(),
      parent_id: formValue.parent_id ? Number(formValue.parent_id) : null,
      description: (formValue.description ?? '').trim(),
      status: formValue.status,         // 'to_do' | 'in_progress' | 'done'
      priority: formValue.priority,     // 'low' | 'medium' | 'high' | 'urgent'
      start_date: formValue.start_date || null,
      due_date: formValue.due_date || null,
    };

    if (this.isEditMode && this.selectedTask) {
      this.taskService.updateTask(this.selectedTask.task_id, payload).subscribe({
        next: (res) => {
          const updatedTask = (res as any).task || res;
          this.taskSaved.emit(updatedTask);
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.closeModal.emit();
          this.toastr.success('Cập nhật task thành công!', this.taskForm.get('task_name')?.value || 'Thành công');
        },
        error: (err) => {
          this.toastr.error('Cập nhật task thất bại. Vui lòng thử lại.', 'Lỗi');
          this.isSubmitting = false;
        },
      });
    } else {
      this.taskService.createTask(payload).subscribe({
        next: (res) => {
          const newTask = (res as any).task || res;
          this.taskSaved.emit(newTask);
          this.closeModal.emit();
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.toastr.success('Tạo task thành công!', this.taskForm.get('task_name')?.value || 'Thành công');
        },
        error: (err) => {
          this.toastr.error('Tạo task thất bại. Vui lòng thử lại.', 'Lỗi');
          this.isSubmitting = false;
        },
      });
    }
  }

  cancel() {
    this.cancelled.emit();
    this.closeModal.emit();
  }

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
