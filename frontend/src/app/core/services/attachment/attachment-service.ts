// attachment-service.ts – SỬA XONG 100%
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from '../auth/auth';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  // private apiUrl = 'http://localhost:3000/api/attachment';
  private apiUrl = (window as any).__env?.apiUrl ? `${(window as any).__env.apiUrl}/api/attachment` : 'http://localhost:3000/api/attachment';
  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
      // Không set Content-Type khi dùng FormData → browser tự set boundary
    });
  }

  // Upload chung cho task, project, comment
  uploadFile(file: File, context: { conve_id?: number, task_id?: number, project_id?: number } = {}): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    if (context.conve_id) formData.append('conve_id', context.conve_id.toString());
    if (context.task_id) formData.append('task_id', context.task_id.toString());
    if (context.project_id) formData.append('project_id', context.project_id.toString());

    // ← ĐÚNG ENDPOINT: /api/upload (KHÔNG CÓ /upload NỮA)
    return this.http.post(`${this.apiUrl}/upload`, formData, {
      headers: this.getAuthHeaders(),
      reportProgress: true,
      observe: 'events'
    });
  }

  // Xử lý progress + response
  private handleUploadEvent(event: HttpEvent<any>, file: File): any {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        const progress = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
        return { type: 'progress', progress, file };
      case HttpEventType.Response:
        return {
          type: 'success',
          data: event.body,
          file
        };
      default:
        return { type: 'unknown' };
    }
  }

  // Xóa file S3
  deleteAttachment(attach_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteS3/${attach_id}/force`, {
      headers: this.getAuthHeaders()
    });
  }
}
