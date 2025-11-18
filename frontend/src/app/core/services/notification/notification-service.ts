import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationResponse } from '../../../models/notifications';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiNoti = 'http://localhost:3000/api/notifications'; // Đổi port nếu cần

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  getNotifications(page: number = 1, limit: number = 10): Observable<NotificationResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    // Cập nhật đường dẫn tại đây
    return this.http.get<NotificationResponse>(`${this.apiNoti}/getNotifications`, {
      params,
      headers: this.getAuthHeaders()
    });
  }

  getUnreadCount(): Observable<{ unread_count: number }> {
    // Thêm headers
    return this.http.get<{ unread_count: number }>(`${this.apiNoti}/unreadCount`, {
      headers: this.getAuthHeaders()
    });
  }

  markAsRead(id: number): Observable<any> {
    // Thêm headers
    return this.http.patch(`${this.apiNoti}/${id}/read`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  markAllAsRead(): Observable<any> {
    // Thêm headers
    return this.http.patch(`${this.apiNoti}/readAll`, {}, {
      headers: this.getAuthHeaders()
    });
  }
}
