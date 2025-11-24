import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from '../user/user-service';
import { ProjectService } from '../project/project-service';
import { AuthService } from '../auth/auth';
import { ChangePasswordRequest, ResetPasswordRequest, User } from '../../../models/users';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private adminUrl = 'http://localhost:3000/admin';
  constructor(private http: HttpClient, private userService: UserService, private projectService: ProjectService, private authService: AuthService) { }


  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/dashboard`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllUsers(params?: any): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/user/getAllUsers`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  updateUserRole(userId: number): Observable<any> {
    return this.http.put<any>(`${this.adminUrl}/user/changeUserRole`, { userId }, {
      headers: this.getAuthHeaders()
    });
  }
  // services/admin.service.ts
  createUser(data: any): Observable<any> {
    return this.http.post(`${this.adminUrl}/user/createUser`, data, {
      headers: this.getAuthHeaders()
    });
  }
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.adminUrl}/user/deleteUser/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }
  // services/admin.service.ts
  adminResetPassword(userId: number): Observable<any> {
    return this.http.patch(`${this.adminUrl}/user/reset-password/${userId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // team
  getAllTeams(): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/team/getAllTeams`, {
      headers: this.getAuthHeaders()
    });
  }

  createTeamAdmin(data: { team_name: string; owner_team_id: number }): Observable<any> {
    return this.http.post(`${this.adminUrl}/team/createTeamAdmin`, data, {
      headers: this.getAuthHeaders()
    });
  }

  removeMember(team_id: number, user_id: number): Observable<any> {
    const owner_id = this.authService.getUserIdFromToken();
    const roles = this.authService.getUserRoles().includes('admin') ? 'admin' : 'user';
    const payload = {
      team_id,
      user_id,
      owner_team_id: owner_id,
      roles
    };
    return this.http.request<any>('delete', `${this.adminUrl}/removeMember`, {
      headers: this.getAuthHeaders(),
      body: payload
    });
  }
}


