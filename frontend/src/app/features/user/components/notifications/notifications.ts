import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification/notification-service';
import { Notification } from '../../../../models/notifications';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, DatePipe],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
})
export class NotificationsComponent implements OnInit{// Inject Service
  private notiService = inject(NotificationService);

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
        this.notifications = [...this.notifications, ...res.notifications];
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
    this.notiService.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount = res.unread_count;
      }
    });
  }

  loadMore() {
    if (this.hasMore && !this.isLoading) {
      this.currentPage++;
      this.loadData();
    }
  }

  onItemClick(noti: Notification) {
    // Xử lý chuyển hướng nếu cần (Ví dụ: Router.navigate...)
    // console.log('Chuyển hướng tới entity:', noti.entity_type, noti.entity_id);

    if (noti.is_read) return;

    // 1. Cập nhật UI ngay lập tức (Optimistic)
    noti.is_read = true;
    this.unreadCount = Math.max(0, this.unreadCount - 1);

    // 2. Gọi API âm thầm
    this.notiService.markAsRead(noti.noti_id).subscribe({
      error: () => {
        // Revert nếu lỗi (tùy chọn)
        noti.is_read = false;
        this.unreadCount++;
      }
    });
  }

  markAllRead() {
    if (this.unreadCount === 0) return;

    // Optimistic Update
    this.notifications.forEach(n => n.is_read = true);
    this.unreadCount = 0;

    // Gọi API
    this.notiService.markAllAsRead().subscribe();
  }

}
