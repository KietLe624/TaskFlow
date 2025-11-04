import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../../../models/projects';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiProjects = `http://localhost:3000/api/project`;

  constructor(private http: HttpClient) { }

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

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }
}


