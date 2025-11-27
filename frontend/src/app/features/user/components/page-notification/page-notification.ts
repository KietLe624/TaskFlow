import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification/notification-service';

@Component({
  selector: 'app-page-notification',
  imports: [CommonModule, RouterLink],
  templateUrl: './page-notification.html',
  styleUrls: ['./page-notification.css']
})
export class PageNotificationComponent {
  notifications: any[] = [];
  page = 1;
  limit = 10; // Load 10 cái một lần cho nhẹ
  hasMore = true;
  isLoading = false;
  isLoadingMore = false;

  constructor(private notiService: NotificationService) { }

  ngOnInit(): void {
    this.loadData(true); // true = reset lại từ đầu
  }

  loadData(reset: boolean = false) {
    if (reset) {
      this.page = 1;
      this.notifications = [];
      this.isLoading = true;
    } else {
      this.page++;
      this.isLoadingMore = true;
    }

    this.notiService.getNotifications(this.page, this.limit).subscribe({
      next: (res) => {
        const newItems = res.data;
        this.notifications = reset ? newItems : [...this.notifications, ...newItems];
        // Kiểm tra xem còn trang sau không
        this.hasMore = res.pagination.has_more;
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: () => {
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  onMarkAllRead() {
    this.notiService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.is_read = true);
    });
  }

  onDelete(id: string, event: Event) {
    event.stopPropagation(); // Chặn click lan ra ngoài

    this.notiService.deleteNotification(id).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.noti_id !== id);
    });
  }

  // Hàm lấy màu icon
  getTypeColor(type: string): string {
    switch (type) {
      case 'TASK_ASSIGN': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'TASK_DONE': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'TASK_ASSIGN': return 'fa-user-tag';
      case 'TASK_DONE': return 'fa-check-double';
      case 'PROJECT_INVITE': return 'fa-user-plus';
      case 'COMMENT': return 'fa-comment-dots';
      default: return 'fa-bell';
    }
  }
}
