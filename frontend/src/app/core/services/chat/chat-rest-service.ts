import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatRestService {
  // private apiChat = `http://localhost:3000/api/chat`;
  private apiChat = (window as any).__env?.apiUrl ? `${(window as any).__env.apiUrl}/api/chat` : 'http://localhost:3000/api/chat';
  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  getMessages(conve_id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiChat}/messages/${conve_id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
