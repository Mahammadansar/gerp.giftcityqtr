import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TimesheetRow {
  id: string;
  project: string;
  date: string;
  hours: number;
  task: string;
  billable: boolean;
}

export interface ProfitabilityRow {
  id: string;
  project: string;
  client: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  private readonly api = `${environment.apiBaseUrl}/projects`;

  constructor(private http: HttpClient) {}

  listTimesheets(): Observable<{ data: TimesheetRow[] }> {
    return this.http.get<{ data: TimesheetRow[] }>(`${this.api}/timesheets`);
  }

  createTimesheet(payload: { project: string; date: string; hours: number; task: string; billable: boolean }): Observable<{ data: TimesheetRow }> {
    return this.http.post<{ data: TimesheetRow }>(`${this.api}/timesheets`, payload);
  }

  listProfitability(): Observable<{ data: ProfitabilityRow[] }> {
    return this.http.get<{ data: ProfitabilityRow[] }>(`${this.api}/profitability`);
  }

  createProfitability(payload: { project: string; client: string; revenue: number; cost: number }): Observable<{ data: ProfitabilityRow }> {
    return this.http.post<{ data: ProfitabilityRow }>(`${this.api}/profitability`, payload);
  }
}
