import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin/admin-service';


@Component({
  selector: 'app-admin-activity',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-activity.html',
  styleUrls: ['./admin-activity.css']
})
export class AdminActivityComponent implements OnInit {

  loading = false;
  activities: any[] = [];
  currentPage = 1;
  loadingMore = false;
  hasMore = true;
  limit = 20;
  constructor(private adminService: AdminService) { }
  // Bộ lọc
  filter = {
    search: '',
    type: 'all',
    action: 'all'
  };

  ngOnInit() {
    this.loadActivities();
  }

  fetchData(reset: boolean = false) {
    if (reset) {
      this.currentPage = 1;
      this.hasMore = true;
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    const params = {
      page: this.currentPage,
      limit: this.limit,
      search: this.filter.search,
      type: this.filter.type === 'all' ? '' : this.filter.type,
      action: this.filter.action === 'all' ? '' : this.filter.action
    };

    this.adminService.getActivities(params).subscribe({
      next: (res: any) => {
        const newActivities = res.data || [];

        if (reset) {
          // Nếu là filter/search -> Gán mới hoàn toàn
          this.activities = newActivities;
        } else {
          // Nếu là Load More -> Nối vào mảng cũ
          this.activities = [...this.activities, ...newActivities];
        }

        // Kiểm tra xem còn dữ liệu không (Dựa vào Meta từ Backend)
        // Nếu số lượng trả về < limit hoặc trang hiện tại >= tổng số trang
        if (newActivities.length < this.limit || this.currentPage >= res.meta?.totalPages) {
          this.hasMore = false;
        }

        this.loading = false;
        this.loadingMore = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.loadingMore = false;
      }
    });
  }

  loadActivities() {
    this.loading = true;

    // Giả sử bạn có activityService ở frontend
    this.adminService.getActivities({
      page: this.currentPage,
      limit: 20,
      search: this.filter.search,
      type: this.filter.type === 'all' ? '' : this.filter.type,
      action: this.filter.action === 'all' ? '' : this.filter.action
    }).subscribe({
      next: (res: any) => {
        this.activities = res.data;
        // Lưu meta để làm phân trang nếu cần
        // this.totalItems = res.meta.totalItems;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.fetchData(true);
  }

  // Khi bấm nút "Xem thêm" -> Tăng page và load tiếp
  loadMore() {
    if (!this.hasMore || this.loadingMore) return;

    this.currentPage++;
    this.fetchData(false); // False nghĩa là nối thêm, không reset
  }

  // --- HELPER: Chọn icon dựa trên hành động ---
  getActionIcon(action: string): string {
    switch (action) {
      case 'created': return 'fa-plus';
      case 'updated': return 'fa-pen';
      case 'deleted': return 'fa-trash';
      case 'invited': return 'fa-user-plus';
      case 'login': return 'fa-sign-in-alt';
      default: return 'fa-bolt';
    }
  }

  // --- HELPER: Chọn màu nền icon ---
  getActionColor(action: string): string {
    switch (action) {
      case 'created': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'updated': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'deleted': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'invited': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  }

  // --- HELPER: Màu chữ hành động ---
  getActionTextColor(action: string): string {
    switch (action) {
      case 'created': return 'text-indigo-600 dark:text-indigo-400';
      case 'deleted': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-700 dark:text-gray-300';
    }
  }
}
