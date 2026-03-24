import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PermissionItem {
  id: string;
  action: string;
  resource: string;
}

export interface RoleItem {
  id: string;
  name: string;
  users: number;
  permissions: PermissionItem[];
}

export interface UserItem {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  roles: { id: string; name: string }[];
}

@Injectable({ providedIn: 'root' })
export class AdminManagementService {
  private readonly api = `${environment.apiBaseUrl}/admin`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<{ data: UserItem[] }> {
    return this.http.get<{ data: UserItem[] }>(`${this.api}/users`);
  }

  createUser(payload: { fullName: string; email: string; password: string; roleId: string }): Observable<any> {
    return this.http.post(`${this.api}/users`, payload);
  }

  updateUserRole(userId: string, roleId: string): Observable<any> {
    return this.http.patch(`${this.api}/users/${userId}/role`, { roleId });
  }

  getRoles(): Observable<{ data: RoleItem[] }> {
    return this.http.get<{ data: RoleItem[] }>(`${this.api}/roles`);
  }

  createRole(payload: { name: string; permissionIds: string[] }): Observable<any> {
    return this.http.post(`${this.api}/roles`, payload);
  }

  updateRolePermissions(roleId: string, permissionIds: string[]): Observable<any> {
    return this.http.patch(`${this.api}/roles/${roleId}/permissions`, { permissionIds });
  }

  getPermissions(): Observable<{ data: PermissionItem[] }> {
    return this.http.get<{ data: PermissionItem[] }>(`${this.api}/permissions`);
  }
}
