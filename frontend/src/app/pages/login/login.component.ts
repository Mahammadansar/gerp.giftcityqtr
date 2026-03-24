import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = 'admin@giftcity.qa';
  password = 'Admin@12345';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  submit(): void {
    this.loading = true;
    this.error = '';

    this.auth.loginAndLoad(this.email, this.password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.error = 'Invalid login credentials';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
