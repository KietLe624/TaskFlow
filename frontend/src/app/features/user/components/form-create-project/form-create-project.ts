import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../../core/services/project/project-service';
import { Project } from '../../../../models/projects';
import { Team } from '../../../../models/team';
import { ProjectStatusPipe } from '../../../../pipes/project-status-pipe';
import { ProjectPriorityPipe } from '../../../../pipes/project-priority-pipe';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProjectStatusPipe, ProjectPriorityPipe],
  templateUrl: './form-create-project.html',
})

export class FormCreateProject {

  @Input() isEditMode = false; // nhận từ component cha (project.component.ts)
  @Input() selectedProject: Project | null = null; // nhận từ component cha (project.component.ts)
  @Output() projectSaved = new EventEmitter<Project>();
  @Output() closeModal = new EventEmitter<void>();

  projectForm: FormGroup;
  teams: Team[] = [];
  isSubmitting = false;
  selectedProjectId: number | null = null;

  statuses: string[] = [];
  priorities: string[] = [];

  ngOnInit() {
    this.loadPriorities();
    this.loadStatuses();
  }
  // khi có thay đổi ở input selectedProject load dữ liệu vào form
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedProject'] && this.selectedProject) {
      this.projectForm.patchValue(this.selectedProject);
    }
  }


  constructor(private fb: FormBuilder, private projectService: ProjectService, private cdr: ChangeDetectorRef) {
    this.projectForm = this.fb.group({
      project_name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      status: ['to_do'],
      priority: ['medium'],
      client: [''],
      budget: [0, [Validators.min(0)]],
      start_date: [new Date().toISOString().substring(0, 10), Validators.required],
      due_date: ['', Validators.required],
      team_id: [null],
    });
  }

  submitForm() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.projectForm.value;

    if (this.isEditMode && this.selectedProject) {
      // ✏️ Cập nhật dự án
      this.projectService.updateProject(this.selectedProject.project_id, formValue).subscribe({
        next: (res) => {
          const updatedProject = res.project || res; // 🔥 fallback an toàn
          this.projectSaved.emit(updatedProject); // 🔥 emit dữ liệu thực tế
          this.closeModal.emit();
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting = false;
        },
      });
    } else {
      // 🆕 Tạo mới dự án
      this.projectService.createProject(formValue).subscribe({
        next: (res) => {
          const newProject = res.project || res;
          this.projectSaved.emit(newProject);
          this.closeModal.emit();
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting = false;
        },
      });
    }
  }


  closeCreateModal() {

    this.selectedProject = null;
    this.closeModal.emit();
    this.cdr.detectChanges();
  }

  loadPriorities() {
    this.projectService.getPriorities().subscribe({
      next: (data) => {
        this.priorities = data;
        console.log(' Priorities from DB:', data);
      },
      error: (err) => {
        console.error(' Lỗi lấy priority:', err);
      },
    });
  }

  loadStatuses() {
    this.projectService.getStatuses().subscribe({
      next: (data) => {
        console.log(' Statuses from backend:', data);
        this.statuses = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(' Lỗi lấy statuses:', err)
    });
  }

  // ==================================================================================

  isModalOpen() {
    this.isEditMode = false;
    this.projectForm.reset();
    this.cdr.detectChanges();
  }

  openEditForm(project: any) {
    this.isEditMode = true;
    this.selectedProjectId = project.project_id;
    this.projectForm.patchValue(project);
    this.cdr.detectChanges();
  }
}

