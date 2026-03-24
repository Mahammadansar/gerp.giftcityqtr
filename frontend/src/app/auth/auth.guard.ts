import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.auth.hydrateSession().pipe(
      map((ok) => {
        if (!ok) {
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        const permission = route.data['permission'] as string | undefined;
        if (permission && !this.auth.hasPermission(permission)) {
          this.router.navigate(['/dashboard']);
          return false;
        }

        return true;
      }),
      catchError(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return of(false);
      })
    );
  }
}
