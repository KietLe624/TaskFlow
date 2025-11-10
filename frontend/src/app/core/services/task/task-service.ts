import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tasks } from '../../../models/tasks';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiTasks = `http://localhost:3000/api/task`;

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  constructor(private http: HttpClient) { }
  createTask(data: any): Observable<{ message: string; task: Tasks }> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ message: string; task: Tasks }>(`${this.apiTasks}/createTask`, data, { headers });
  }

  updateTask(taskId: number, data: any): Observable<{ message: string; task: Tasks }> {
    const headers = this.getAuthHeaders();
    return this.http.patch<{ message: string; task: Tasks }>(`${this.apiTasks}/updateTask/${taskId}`, data, { headers });
  }

  getTasksByProjectId(projectId: number): Observable<Tasks[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ message: string; tasks: Tasks[] }>(`${this.apiTasks}/getTasksByProjectId/${projectId}`, { headers })
      .pipe(map(res => res.tasks));
  }

  getStatus(): Observable<string[]> {
    const headers = this.getAuthHeaders();
    return this.http
      .get<{ message: string; statuses?: string[]; status?: string[] }>(
        `${this.apiTasks}/getStatus`,
        { headers }
      )
      .pipe(map(res => res.statuses ?? res.status ?? []));
  }

  getPriorities(): Observable<string[]> {
    const headers = this.getAuthHeaders();
    return this.http
      .get<{ message: string; priorities?: string[]; priority?: string[] }>(
        `${this.apiTasks}/getPriorities`,
        { headers }
      )
      .pipe(map(res => res.priorities ?? res.priority ?? []));
  }

}
