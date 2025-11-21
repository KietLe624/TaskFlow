import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProfileData, ProfileResponse } from '../../../models/profile';
import { map } from 'rxjs/internal/operators/map';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUsers = `http://localhost:3000/api/user`;
  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  getUserById(user_id: number): Observable<ProfileData> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUsers}/getUserById/${user_id}`, { headers }).pipe(
      map(res => res.user)  // ← chỉ 1 dòng này là đủ vì backend bọc "user": { ... }
    );
  }

  updateUser(user_id: number, updateData: Partial<ProfileData['user']>): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put<any>(`${this.apiUsers}/updateUser/${user_id}`, updateData, { headers });
  }
}
