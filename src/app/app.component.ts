import { Component, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  isLoggedIn = true;

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
  ) {}

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
