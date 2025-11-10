import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { TeamService } from '../../../../core/services/team/team-service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Team, TeamMember } from '../../../../models/team';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-form-team',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-team.html',
  styleUrls: ['./form-team.css']
})
export class FormTeamComponent implements OnInit {
  @Input() selectedTeam: any | null = null;
  @Input() isEditMode = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() teamSaved = new EventEmitter<any>();
  isSubmitting = false;

  teamForm!: FormGroup;
  constructor(private teamService: TeamService, private fb: FormBuilder, private toastr: ToastrService) { }
  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Nếu selectedTeam thay đổi và đang ở chế độ edit, fill dữ liệu vào form
    if (changes['selectedTeam'] && this.isEditMode && this.selectedTeam) {
      // Đảm bảo form đã được khởi tạo trước khi patchValue
      if (!this.teamForm) {
        this.initForm();
      }
      this.teamForm.patchValue({
        team_name: this.selectedTeam.team_name,
        description: this.selectedTeam.description
      });
    }
  }

  initForm() {
    this.teamForm = this.fb.group({
      team_name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['']
    });
  }

  onSubmit() {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.teamForm.value;

    if (this.isEditMode && this.selectedTeam) {
      // --- CHẾ ĐỘ SỬA ---
      this.teamService.updateTeam(this.selectedTeam.team_id, formValue).subscribe({
        next: (res) => {
          this.toastr.success('Cập nhật team thành công!');
          this.teamSaved.emit(res.team || res); // Emit team đã sửa
          this.closeModal.emit();
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Cập nhật thất bại.');
          this.isSubmitting = false;
        }
      });
    } else {
      // --- CHẾ ĐỘ TẠO MỚI ---
      this.teamService.createTeam(formValue).subscribe({
        next: (res) => {
          this.toastr.success('Tạo team thành công!');
          this.teamSaved.emit(res.team || res); // Emit team mới
          this.closeModal.emit();
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Tạo team thất bại.');
          this.isSubmitting = false;
        }
      });
    }
  }

  cancel() {
    this.closeModal.emit();
  }
}

