import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectMember } from '../../../models/projects';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  // private apiProjects = `http://localhost:3000/api/project`;
  private apiProjects = (window as any).__env?.apiUrl ? `${(window as any).__env.apiUrl}/api/project` : 'http://localhost:3000/api/project';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  getAllProjects(): Observable<Project[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ message: string; projects: Project[] }>(`${this.apiProjects}/getAllProjects`, { headers })
      .pipe(map(res => res.projects));
  }

  getProjectsByUserId(userId: number): Observable<Project[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ message: string; projects: Project[] }>(
      `${this.apiProjects}/getProjectsByUserId/${userId}`, { headers }
    ).pipe(map(res => res.projects));
  }

  createProject(data: any): Observable<{ message: string; project: Project }> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ message: string; project: Project }>(`${this.apiProjects}/createProject`, data, { headers });
  }

  updateProject(project_id: number, data: Partial<Project>): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch<{ message: string; project: Project }>(`${this.apiProjects}/updateProject/${project_id}`, data, { headers });
  }

  deleteProject(project_id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiProjects}/deleteProject/${project_id}`, { headers });
  }

  getStatuses(): Observable<string[]> {
    const headers = this.getAuthHeaders();
    return this.http
      .get<{ message: string; status: string[] }>(
        `${this.apiProjects}/getStatus`,
        { headers }
      )
      .pipe(map(res => res.status || []));
  }

  getPriorities(): Observable<string[]> {
    const headers = this.getAuthHeaders();
    return this.http
      .get<{ message: string; priorities: string[] }>(`${this.apiProjects}/getPriorities`, { headers })
      .pipe(map(res => res.priorities || []));
  }

  getProjectById(projectId: number): Observable<Project> {
    const headers = this.getAuthHeaders();
    return this.http
      .get<{ message: string; project: Project }>(`${this.apiProjects}/getProjectById/${projectId}`, { headers })
      .pipe(map(res => res.project));
  }

  getProjectMembers(project_id: number): Observable<ProjectMember[]> {
    const headers = this.getAuthHeaders();
    return this.http
      .get<{ message: string; members: ProjectMember[] }>(`${this.apiProjects}/getProjectMembers/${project_id}`, { headers })
      .pipe(map(res => res.members || []));
  }

  inviteMember(projectId: number, email: string): Observable<any> {
    return this.http.post(`${this.apiProjects}/inviteMemberToProject/${projectId}`, { memberEmail: email }, { headers: this.getAuthHeaders() });
  }

  getRecentProjects(): Observable<Project[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ recentProjects: Project[] }>(`${this.apiProjects}/getRecentProjects`, { headers })
      .pipe(map(res => res.recentProjects));
  }
}


