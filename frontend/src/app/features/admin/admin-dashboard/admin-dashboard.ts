import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth';
import { AdminService } from '../../../core/services/admin/admin-service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent {
stats: any = {
    totalUsers: 0,
    totalProjects: 0,
    totalTeams: 0,
    activeTasks: 0,
    overdueTasks: 0,
    recentActivities: []
  };
  loading = true;
  today = new Date();

  constructor(
    public authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        console.log('Dashboard stats loaded:', data);
      },
      error: (err) => {
        console.error('Lỗi load stats:', err);
        this.loading = false;
      }
    });
  }
}
