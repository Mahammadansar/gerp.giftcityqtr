import { Component, OnInit } from '@angular/core';
import { HrApiService, HrStaff } from '../../services/hr-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';
import { AdminManagementService, RoleItem } from '../../services/admin-management.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.scss']
})
export class StaffDetailsComponent implements OnInit {
  title = 'Staff Details';
  subtitle = 'Employee information and roles.';
  staff: HrStaff[] = [];
  roles: RoleItem[] = [];
  showAddForm = false;
  error = '';
  loading = false;
  form: {
    name: string;
    department: string;
    joinDate: string;
    email: string;
    createUser: boolean;
    userPassword: string;
    roleId: string;
  } = {
    name: '', department: '', joinDate: '', email: '',
    createUser: false, userPassword: '', roleId: ''
  };

  constructor(private hrApi: HrApiService, private adminApi: AdminManagementService, public auth: AuthService) {}

  ngOnInit(): void {
    this.load();
    this.adminApi.getRoles().subscribe({
      next: (res) => { this.roles = res.data || []; },
      error: () => {}
    });
  }

  load(): void {
    this.loading = true;
    this.hrApi.listStaff().subscribe({
      next: (res) => {
        this.staff = (res.data || []).map((s) => ({ ...s, joinDate: String(s.joinDate).slice(0, 10) }));
        this.loading = false;
      },
      error: (e) => {
        this.error = getApiErrorMessage(e, 'Failed to load staff');
        this.loading = false;
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.form = {
        name: '', department: '', joinDate: new Date().toISOString().slice(0, 10), email: '',
        createUser: false, userPassword: '', roleId: this.roles[0]?.id || ''
      };
    }
  }

  saveStaff(): void {
    this.error = '';
    const selectedRole = this.roles.find((r) => r.id === this.form.roleId);
    this.hrApi.createStaff({
      name: this.form.name || '',
      role: selectedRole?.name || '',
      department: this.form.department || '',
      joinDate: this.form.joinDate || new Date().toISOString().slice(0, 10),
      email: this.form.email || '',
      createUser: this.form.createUser,
      userEmail: this.form.createUser ? this.form.email : undefined,
      userPassword: this.form.createUser ? this.form.userPassword : undefined,
      userRoleId: this.form.createUser ? this.form.roleId : undefined
    }).subscribe({
      next: () => {
        this.load();
        this.showAddForm = false;
      },
      error: (e) => {
        this.error = getApiErrorMessage(e, 'Failed to save staff');
      }
    });
  }
}
