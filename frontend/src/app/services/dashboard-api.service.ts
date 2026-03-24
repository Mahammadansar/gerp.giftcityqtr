import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly api = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getOverview(): Observable<{ data: any }> {
    return this.http.get<{ data: any }>(`${this.api}/overview`);
  }

  getSummary(): Observable<{ data: any }> {
    return this.http.get<{ data: any }>(`${this.api}/summary`);
  }
}
