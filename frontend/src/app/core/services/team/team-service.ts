import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// Import AuthService để lấy currentUserId cho owner_team_id
import { AuthService } from '../auth/auth';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private apiTeam = `http://localhost:3000/api/team`;

  constructor(private http: HttpClient, private authService: AuthService) { }
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }
  // Create Team
  createTeam(data: { team_name: string; description?: string }): Observable<any> {
    const owner_id = this.authService.getUserIdFromToken();
    const payload = {
      ...data,
      owner_team_id: owner_id
    };
    return this.http.post(`${this.apiTeam}/createTeam`, payload, { headers: this.getAuthHeaders() });
  }

  inviteMember(team_id: number, user_id: number): Observable<any> {
    const owner_id = this.authService.getUserIdFromToken();
    const payload = {
      team_id,
      user_id,
      owner_team_id: owner_id
    };

    return this.http.post(
      `${this.apiTeam}/inviteMember`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  updateTeam(team_id: number, data: { team_name: string; description?: string }): Observable<any> {
    const owner_id = this.authService.getUserIdFromToken();
    const payload = {
      team_id,
      ...data,
      owner_team_id: owner_id
    };
    return this.http.patch(`${this.apiTeam}/updateTeam`, payload, { headers: this.getAuthHeaders() });
  }

  getTeamMembers(team_id: number): Observable<any> {
    const owner_id = this.authService.getUserIdFromToken();
    const payload = {
      team_id,
      owner_team_id: owner_id
    };
    return this.http.get<any>(`${this.apiTeam}/getTeamMembers/${team_id}`, { headers: this.getAuthHeaders() });
  }

  getAllTeamsByOwner(): Observable<any> {
    const owner_id = this.authService.getUserIdFromToken();
    const user_id = owner_id;
    const payload = {
      owner_team_id: owner_id
    };
    return this.http.get<any>(`${this.apiTeam}/getAllTeamsByOwner/${user_id}`, { headers: this.getAuthHeaders() });
  }
}
