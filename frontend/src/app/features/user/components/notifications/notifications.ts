import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification/notification-service';
import { Notification } from '../../../../models/notifications';
import { Router } from '@angular/router';
import { NotificationConfig } from '../../../../core/configs/notification.config';


@Component({
  selector: 'app-notifications',
  imports: [CommonModule, DatePipe],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
})
export class NotificationsComponent implements OnInit {// Inject Service
  private notiService = inject(NotificationService);
  private router = inject(Router);

  @Output() closeDropdown = new EventEmitter<void>();
  // State Variables
  notifications: Notification[] = [];
  unreadCount: number = 0;

  // Pagination & Loading State
  currentPage: number = 1;
  limit: number = 10;
  hasMore: boolean = false;
  isLoading: boolean = false;

  ngOnInit() {
    this.loadData();
    this.loadUnreadCount();
  }

  // Hàm load chung
  loadData() {
    if (this.isLoading) return;
    this.isLoading = true;

    this.notiService.getNotifications(this.currentPage, this.limit).subscribe({
      next: (res) => {
        // Nối mảng cũ + mảng mới
        console.log('Notifications tải về:', res);
        const newNotis = res.data || (res as any).notifications || [];
        // Nối mảng cũ + mảng mới
        this.notifications = [...this.notifications, ...newNotis];
        // this.notifications = [...this.notifications, ...res.data];
        this.hasMore = res.pagination.has_more;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải notifications:', err);
        this.isLoading = false;
      }
    });
  }

  loadUnreadCount() {
    this.notiService.getUnreadCount().subscribe(res => {
      this.unreadCount = res.unread_count;
    });
  }

  // 3. Load thêm (Phân trang)
  loadMore() {
    if (this.hasMore && !this.isLoading) {
      this.currentPage++;
      this.loadData();
    }
  }

  // 4. Helper lấy config giao diện
  getConfig(type: string) {
    return NotificationConfig[type] || NotificationConfig['system'];
  }

  onItemClick(noti: Notification) {
    // A. Đánh dấu đã đọc (UI trước)
    if (!noti.is_read) {
      noti.is_read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.notiService.markAsRead(noti.noti_id).subscribe();
    }

    // B. Đóng dropdown
    this.closeDropdown.emit();

    // C. Điều hướng
    this.navigateByEntity(noti);
  }
  // Đánh dấu tất cả đã đọc
  markAllRead() {
    if (this.unreadCount === 0) return;
    this.notifications.forEach(n => n.is_read = true);
    this.unreadCount = 0;
    this.notiService.markAllAsRead().subscribe();
  }

  // 7. Xem trang full
  viewAllPage() {
    this.router.navigate(['/app/notifications']);
    this.closeDropdown.emit();
  }
  private navigateByEntity(noti: Notification) {
    const config = this.getConfig(noti.entity_type);
    const id = noti.entity_id;

    if (!id) {
      this.router.navigate([config.route]);
      return;
    }
    switch (noti.entity_type) {
      case 'project':
        // Config là '/app/projects'
        // Kết quả: /app/projects/123 -> KHỚP với route 'projects/:id'
        this.router.navigate([config.route, id]);
        break;

      case 'task':
      case 'comment':
        // Config là '/app/tasks'
        // Kết quả: /app/tasks/123 -> Cần route 'tasks/:id'
        this.router.navigate([config.route, id]);
        break;

      default:
        this.router.navigate(['/app/dashboard']);
    }
  }
}
