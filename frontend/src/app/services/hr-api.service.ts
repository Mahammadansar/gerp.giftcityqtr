import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HrStaff {
  id: string;
  name: string;
  role: string;
  department: string;
  joinDate: string;
  email: string;
}

export interface CreateStaffPayload {
  name: string;
  role: string;
  department: string;
  joinDate: string;
  email: string;
  createUser?: boolean;
  userEmail?: string;
  userPassword?: string;
  userRoleId?: string;
}

export interface HrLeaveType {
  id: string;
  name: string;
  daysPerYear: number;
  carryOver: number;
  description: string;
}

export interface HrLeaveRequest {
  id: string;
  employee: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class HrApiService {
  private readonly api = `${environment.apiBaseUrl}/hr`;

  constructor(private http: HttpClient) {}

  listStaff(): Observable<{ data: HrStaff[] }> { return this.http.get<{ data: HrStaff[] }>(`${this.api}/staff`); }
  createStaff(payload: CreateStaffPayload): Observable<{ data: { staff: HrStaff; user?: { id: string; email: string } | null } }> {
    return this.http.post<{ data: { staff: HrStaff; user?: { id: string; email: string } | null } }>(`${this.api}/staff`, payload);
  }

  listLeaveTypes(): Observable<{ data: HrLeaveType[] }> { return this.http.get<{ data: HrLeaveType[] }>(`${this.api}/leave-types`); }
  createLeaveType(payload: { name: string; daysPerYear: number; carryOver: number; description: string }): Observable<{ data: HrLeaveType }> {
    return this.http.post<{ data: HrLeaveType }>(`${this.api}/leave-types`, payload);
  }

  listLeaveRequests(): Observable<{ data: HrLeaveRequest[] }> { return this.http.get<{ data: HrLeaveRequest[] }>(`${this.api}/leave-requests`); }
  createLeaveRequest(payload: { employee: string; type: string; from: string; to: string; days: number }): Observable<{ data: HrLeaveRequest }> {
    return this.http.post<{ data: HrLeaveRequest }>(`${this.api}/leave-requests`, payload);
  }

  updateLeaveRequestStatus(id: string, status: 'Approved' | 'Rejected'): Observable<{ data: HrLeaveRequest }> {
    return this.http.patch<{ data: HrLeaveRequest }>(`${this.api}/leave-requests/${id}/status`, { status });
  }
}
