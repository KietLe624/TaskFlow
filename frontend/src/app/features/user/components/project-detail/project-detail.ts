import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../../models/projects'; // <-- Bro cần import model Project
import { UserAvatarComponent } from '../../components/user-avatar/user-avatar';
import { ProjectStatusPipe } from '../../../../pipes/project-status-pipe';
import { ProjectPriorityPipe } from '../../../../pipes/project-priority-pipe';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-project-detail',
  imports: [CommonModule, UserAvatarComponent, ProjectStatusPipe, ProjectPriorityPipe],
  templateUrl: './project-detail.html',
  styleUrls: ['./project-detail.css']
})
export class ProjectDetailModalComponent {
  constructor(private cdr: ChangeDetectorRef) { }
  @Input() project!: Project;
  @Output() close = new EventEmitter<void>();

  public activeTab: string = 'overview';

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.close.emit();
    this.cdr.detectChanges();
  }
}
