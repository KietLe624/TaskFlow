import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth'

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  private apiUrl = 'http://localhost:3000/api/upload';

  private getAuthHeadersForUpload(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Header cho JSON (dùng khi delete)
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  uploadFile(file: File, context: { conve_id?: number, task_id?: number }): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); // Khớp với 'upload.single("file")'

    // Gửi kèm ID bối cảnh (conve_id hoặc task_id)
    if (context.conve_id) {
      formData.append('conve_id', context.conve_id.toString());
    }
    if (context.task_id) {
      formData.append('task_id', context.task_id.toString());
    }

    // Gọi đúng API endpoint
    return this.http.post(`${this.apiUrl}/upload`, formData, {
      headers: this.getAuthHeadersForUpload(),
    });
  }

  deleteAttachmentS3(attach_id: number): Observable<any> {
    // Middleware 'authenticateToken' sẽ lấy user_id từ token,
    // nên không cần gửi user_id trong body khi delete.
    return this.http.delete(`${this.apiUrl}/deleteS3/${attach_id}/force`, {
      headers: this.getAuthHeaders()
    });
  }

  uploadFileForChat(file: File, conve_id: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conve_id', conve_id.toString());

    return this.http.post(`${this.apiUrl}/upload`, formData, {
      headers: this.getAuthHeadersForUpload(),
    });
  }

}
