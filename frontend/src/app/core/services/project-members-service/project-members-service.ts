// src/app/core/services/project-member.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectMembersService {
  private apiProjects = `http://localhost:3000/api/project`;

  constructor(private http: HttpClient) { }
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }
  // Đổi role – gọi đúng route backend
  changeRole(projectId: number, userId: number, role: 'owner' | 'member'): Observable<any> {
    return this.http.patch(`${this.apiProjects}/changeMemberRole/${projectId}/${userId}`, { role }, { headers: this.getAuthHeaders() });
  }

  // Xóa thành viên
  removeMember(projectId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiProjects}/removeMemberFromProject/${projectId}/${userId}`, { headers: this.getAuthHeaders() });
  }
}
