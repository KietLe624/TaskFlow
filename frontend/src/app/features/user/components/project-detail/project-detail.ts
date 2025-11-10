import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../../models/projects'; // <-- Bro cần import model Project
import { UserAvatarComponent } from '../../components/user-avatar/user-avatar';
import { ProjectStatusPipe } from '../../../../pipes/project-status-pipe';
import { ProjectPriorityPipe } from '../../../../pipes/project-priority-pipe';
import { ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-project-detail',
  imports: [CommonModule, UserAvatarComponent, ProjectStatusPipe, ProjectPriorityPipe, RouterLink],
  templateUrl: './project-detail.html',
  styleUrls: ['./project-detail.css']
})
export class ProjectDetailModalComponent {
  constructor(private cdr: ChangeDetectorRef) { }
  @Input() project!: Project;
  @Output() closed = new EventEmitter<void>();

  public activeTab: string = 'overview';

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.closed.emit();
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
  
  getTaskStatusColor(status: string): string {
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
        return 'bg-gray-500'; // Xám
      default:
        return 'bg-gray-400'; // Mặc định
    }
  }
}
