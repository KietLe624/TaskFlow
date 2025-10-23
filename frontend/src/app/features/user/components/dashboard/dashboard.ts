import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DashboardData,
} from '../../../../models/dashboards';
import { Observable } from 'rxjs/internal/Observable';
import { DashboardService } from '../../../../core/services/dashboard/dashboard';
import { ProjectStatusPipe } from '../../../../pipes/project-status-pipe';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ProjectStatusPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef, private dashboardService: DashboardService) { }

  public openDropdownId: string | null = null;

  ngOnInit(): void {
    this.dashboardData$ = this.dashboardService.getDashboardData();
  }
  public dashboardData$!: Observable<DashboardData>;

  toggleDropdown(itemId: string, $event: MouseEvent) {
    $event.stopPropagation(); // Ngăn click lan ra ngoài, đóng menu ngay lập tức

    if (this.openDropdownId === itemId) {
      this.openDropdownId = null; // Đóng lại nếu đang mở
    } else {
      this.openDropdownId = itemId; // Mở cái mới
    }
  }

  @HostListener('document:click')
  closeDropdownOnOutsideClick() {
    this.openDropdownId = null; // Đóng bất kỳ dropdown nào đang mở
  }
  viewProjectDetails(taskId: string, $event: MouseEvent) {
    $event.stopPropagation(); // Ngăn menu tự đóng
    console.log("Xem chi tiết công việc:", taskId);
    this.openDropdownId = null; // Đóng menu sau khi click
    // TODO: Thêm logic (ví dụ: mở modal hoặc điều hướng)
  }

  deleteProject(projectId: string, $event: MouseEvent) {
    $event.stopPropagation(); // Ngăn menu tự đóng
    console.log("Xóa dự án:", projectId);
    this.openDropdownId = null; // Đóng menu sau khi click
  }

}
