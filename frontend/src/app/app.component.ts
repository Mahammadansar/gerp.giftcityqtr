import { Component, Inject, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService, AuthUser } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy, OnInit {
  isLoggedIn = false;
  currentUser: AuthUser | null = null;
  private routerSub?: Subscription;
  private userSub?: Subscription;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private auth: AuthService
  ) {
    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(() => this.closeSidebarMobile());
  }

  ngOnInit(): void {
    this.userSub = this.auth.user$.subscribe((user) => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });

    this.auth.hydrateSession().subscribe();
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  can(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }

  showShell(): boolean {
    return this.isLoggedIn && this.router.url !== '/login';
  }

  closeSidebarMobile(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 991) {
      this.document.body.classList.remove('sidebar-open');
    }
  }

  onSidebarNavClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('a[routerLink]')) this.closeSidebarMobile();
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }

  toggleSidebar() {
    const body = this.document.body;
    const isMobile = window.innerWidth <= 991;

    if (isMobile) {
      body.classList.remove('sidebar-closed');
      body.classList.toggle('sidebar-open');
    } else {
      body.classList.remove('sidebar-open');
      body.classList.toggle('sidebar-closed');
    }
  }

  ngAfterViewInit() {
    if (typeof (window as any).feather !== 'undefined') {
      (window as any).feather.replace();
    }
  }
}
