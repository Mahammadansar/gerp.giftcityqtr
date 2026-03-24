import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  orgId: string;
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiBaseUrl}/auth`;
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser;
    if (!user) return false;
    return user.permissions.includes('manage:all') || user.permissions.includes(permission);
  }

  loginAndLoad(email: string, password: string): Observable<AuthUser> {
    return this.http.post(`${this.api}/login`, { email, password }, { withCredentials: true }).pipe(
      switchMap(() => this.fetchMe())
    );
  }

  fetchMe(): Observable<AuthUser> {
    return this.http.get<{ data: AuthUser }>(`${this.api}/me`, { withCredentials: true }).pipe(
      map((r) => r.data),
      tap((user) => this.userSubject.next(user))
    );
  }

  refresh(): Observable<boolean> {
    return this.http.post(`${this.api}/refresh`, {}, { withCredentials: true }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  hydrateSession(): Observable<boolean> {
    return this.fetchMe().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  logout(): Observable<boolean> {
    return this.http.post(`${this.api}/logout`, {}, { withCredentials: true }).pipe(
      map(() => true),
      tap(() => this.userSubject.next(null)),
      catchError(() => {
        this.userSubject.next(null);
        return of(true);
      })
    );
  }
}
