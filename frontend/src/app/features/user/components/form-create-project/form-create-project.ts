import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../../core/services/project/project-service';
import { Project } from '../../../../models/projects';
import { Team } from '../../../../models/team';
import { ProjectStatusPipe } from '../../../../pipes/project-status-pipe';
import { ProjectPriorityPipe } from '../../../../pipes/project-priority-pipe';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TeamService } from '../../../../core/services/team/team-service';

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProjectStatusPipe,
    ProjectPriorityPipe,
  ],
  templateUrl: './form-create-project.html',
})
export class FormCreateProject {
  @Input() isEditMode = false; // nhận từ component cha (project.component.ts)
  @Input() selectedProject: Project | null = null; // nhận từ component cha (project.component.ts)
  @Input() teams: Team[] = [];
  @Output() projectSaved = new EventEmitter<Project>();
  @Output() closeModal = new EventEmitter<void>();

  projectForm: FormGroup;
  isSubmitting = false;
  selectedProjectId: number | null = null;

  statuses: string[] = [];
  priorities: string[] = [];

  ngOnInit() {
    this.loadPriorities();
    this.loadStatuses();
    this.loadTeamByOwner();
  }
  // khi có thay đổi ở input selectedProject load dữ liệu vào form
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedProject'] && this.selectedProject) {
      this.projectForm.patchValue(this.selectedProject);
    }
  }

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private teamService: TeamService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.projectForm = this.fb.group({
      project_name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      status: ['to_do'],
      priority: ['medium'],
      client: [''],
      budget: [0, [Validators.min(0)]],
      start_date: [
        new Date().toISOString().substring(0, 10),
        Validators.required,
      ],
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
      this.projectService
        .updateProject(this.selectedProject.project_id, formValue)
        .subscribe({
          next: (res) => {
            const updatedProject = res.project || res;
            this.projectSaved.emit(updatedProject);
            this.closeModal.emit();
            this.isSubmitting = false;
            this.cdr.detectChanges();
            this.toastr.success(
              'Cập nhật dự án thành công!',
              this.projectForm.get('project_name')?.value || 'Thành công'
            );
          },
          error: (err) => {
            this.isSubmitting = false;
            this.toastr.error(
              'Cập nhật dự án thất bại!',
              this.projectForm.get('project_name')?.value || 'Thất bại'
            );
          },
        });
    } else {
      this.projectService.createProject(formValue).subscribe({
        next: (res) => {
          const newProject = res.project || res;
          this.projectSaved.emit(newProject);
          this.closeModal.emit();
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.toastr.success(
            'Tạo dự án thành công!',
            this.projectForm.get('project_name')?.value || 'Thành công'
          );
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastr.error(
            'Tạo dự án thất bại!',
            this.projectForm.get('project_name')?.value || 'Thất bại'
          );
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
      },
      error: (err) => {
        console.error(' Lỗi lấy priority:', err);
      },
    });
  }

  loadStatuses() {
    this.projectService.getStatuses().subscribe({
      next: (data) => {
        this.statuses = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(' Lỗi lấy statuses:', err),
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

  // form-create-project.ts

  loadTeamByOwner() {
    this.teamService.getAllTeamsByOwner().subscribe({
      next: (res: any) => { // Dùng 'res' (response) thay vì 'data' để rõ nghĩa hơn
        console.log("API response:", res);

        // Kiểm tra và lấy mảng teams từ response
        if (res && Array.isArray(res.teams)) {
          this.teams = res.teams;
        } else if (Array.isArray(res)) {
          // Phòng trường hợp backend sửa lại trả về mảng trực tiếp
          this.teams = res;
        } else {
          this.teams = [];
          console.warn("API không trả về định dạng mảng mong đợi:", res);
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi lấy teams:', err);
        this.teams = [];
      },
    });
  }
}
