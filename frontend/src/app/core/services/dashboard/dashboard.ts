import { Injectable } from '@angular/core';
import { DashboardData } from '../../../models/dashboards';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // private apiDashboard = 'http://localhost:3000/api/dashboard/dashboard';
  private apiDashboard = (window as any).__env?.apiUrl ? `${(window as any).__env.apiUrl}/api/dashboard/dashboard` : 'http://localhost:3000/api/dashboard/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<DashboardData> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<DashboardData>(`${this.apiDashboard}`, { headers });
  }

}
