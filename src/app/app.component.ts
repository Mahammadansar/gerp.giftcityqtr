import { Component, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  isLoggedIn = true;
  private routerSub: any;

  user_data = {
    userID: 'giftcity-admin',
    type: 'ADMIN',
    first_name: 'Admin',
    last_name: 'User',
    job: 'Admin',
    company: 'Gift City Qatar',
    dp: null as string | null
  };

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) {
    // On mobile, close sidebar when navigation completes (so menu tap navigates and closes)
    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(() => this.closeSidebarMobile());
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  closeSidebarMobile(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 991) {
      this.document.body.classList.remove('sidebar-open');
    }
  }

  logout(): void {
    this.isLoggedIn = false;
    this.router.navigate(['/dashboard']);
  }

  signInAgain(): void {
    this.isLoggedIn = true;
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
