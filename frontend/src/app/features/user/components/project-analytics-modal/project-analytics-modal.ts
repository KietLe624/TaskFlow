import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Project } from '../../../../models/projects';
import { UserAvatarComponent } from '../user-avatar/user-avatar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { SimpleChanges } from '@angular/core';


@Component({
  selector: 'app-project-analytics-modal',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './project-analytics-modal.html',
  styleUrl: './project-analytics-modal.css'
})
export class ProjectAnalyticsModal {
  @Input() project: Project | null = null;

  // === DATA ===
  kpiData = {
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    unassignedTasks: 0,
    completionRate: 0
  };

  // 1. Biểu đồ Trạng thái
  statusChartType: ChartType = 'doughnut';
  statusChartData: ChartData<'doughnut'> = {
    labels: ['Cần làm', 'Đang làm', 'Hoàn thành', 'Quá hạn'],
    datasets: [{ data: [], backgroundColor: ['#9CA3AF', '#3B82F6', '#22C55E', '#EF4444'] }]
  };
  statusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, color: '#6B7280' } } } // color text legend
  };

  // 2. Biểu đồ Thành viên
  memberChartType: ChartType = 'bar';
  memberChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Tasks', backgroundColor: '#6366F1', borderRadius: 4 }]
  };
  memberChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: '#6B7280' }, grid: { color: '#374151' } },
      x: { ticks: { color: '#6B7280' }, grid: { display: false } }
    },
    plugins: { legend: { display: false } }
  };

  // Khi @Input project thay đổi thì tính toán lại
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project'] && this.project) {
      this.calculateAnalytics();
    }
  }

  calculateAnalytics() {
    if (!this.project || !this.project.tasks) return;
    const tasks = this.project.tasks;

    // 1. Tính KPI
    this.kpiData.totalTasks = tasks.length;
    this.kpiData.completedTasks = tasks.filter(t => t.status === 'completed').length;
    this.kpiData.overdueTasks = tasks.filter(t => t.status === 'over_due').length;
    this.kpiData.unassignedTasks = tasks.filter(t => !t.assignees || t.assignees.length === 0).length;

    this.kpiData.completionRate = this.kpiData.totalTasks > 0
      ? Math.round((this.kpiData.completedTasks / this.kpiData.totalTasks) * 100)
      : 0;

    // 2. Data Doughnut
    const statusCounts = [
      tasks.filter(t => t.status === 'to_do').length,
      tasks.filter(t => t.status === 'in_progress').length,
      tasks.filter(t => t.status === 'completed').length,
      tasks.filter(t => t.status === 'over_due').length
    ];

    this.statusChartData = {
      ...this.statusChartData,
      datasets: [{ ...this.statusChartData.datasets[0], data: statusCounts }]
    };

    // 3. Data Bar Chart (Member Workload)
    const memberMap = new Map<string, number>();

    // Init map
    this.project.members?.forEach(m => memberMap.set(m.username, 0));
    if (this.project.team?.members) {
      this.project.team.members.forEach((m: any) => memberMap.set(m.username, 0));
    }

    // Count
    tasks.forEach(t => {
      t.assignees?.forEach((u: any) => {
        // Chỉ đếm nếu user có trong list member (đề phòng user bị kick khỏi prj)
        // Hoặc cứ đếm hết:
        const current = memberMap.get(u.username) || 0;
        memberMap.set(u.username, current + 1);
      });
    });

    this.memberChartData = {
      labels: Array.from(memberMap.keys()),
      datasets: [{ ...this.memberChartData.datasets[0], data: Array.from(memberMap.values()) }]
    };
  }
}
