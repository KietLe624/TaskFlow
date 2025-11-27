import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output, Input } from '@angular/core';
import { RouterModule } from "@angular/router";
import { UserAvatarComponent } from '../../features/user/components/user-avatar/user-avatar';
import { Project } from '../../models/projects';
import { ProjectService } from '../../core/services/project/project-service';
import { ProjectStatusPipe } from '../../pipes/project-status-pipe';

@Component({
  selector: 'app-side-bar',
  imports: [RouterModule, CommonModule, ProjectStatusPipe],
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.css']
})
export class SideBarComponent implements OnInit {

  constructor(private cdr: ChangeDetectorRef, private projectService: ProjectService) { }

  ngOnInit(): void {
    const saved = localStorage.getItem('sidebarCollapsed');
    this.isCollapsed = saved === 'true';
    this.loadRecentProjects();
  }

  isCollapsed: boolean = false;
  isDropdownOpen: boolean = false;


  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
  }
  @Input() isOpen = false;

  // Báo lại cho cha khi muốn đóng (ví dụ click vào overlay)
  @Output() closeSidebar = new EventEmitter<void>();

  close() {
    this.closeSidebar.emit();
  }
  // load recent projects
  recentProjects: Project[] = [];
  loadRecentProjects() {
    // Gọi service để lấy danh sách dự án gần đây
    this.projectService.getRecentProjects().subscribe(
      (projects) => {
        this.recentProjects = projects;
        this.cdr.detectChanges(); // Cập nhật giao diện
      },
      (error) => {
        console.error('Lỗi khi tải dự án gần đây:', error);
      }
    );
  }

  // Lấy màu theo trạng thái
  getStatusColor(status: string): string {
    switch (status) {
      case 'to_do':
        return 'bg-gray-200 text-gray-800';
      case 'in_progress':
        return 'bg-blue-200 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-200 text-yellow-800';
      case 'over_due':
        return 'bg-red-200 text-red-800';
      case 'completed':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  }
}
