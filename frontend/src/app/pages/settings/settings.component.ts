import { Component, OnInit } from '@angular/core';
import { AdminManagementService, PermissionItem, RoleItem, UserItem } from '../../services/admin-management.service';
import { OpsApiService, AppSettings } from '../../services/ops-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  title = 'Settings';
  subtitle = 'Company, users, and role access control.';

  settings: AppSettings = { companyName: '', currency: 'AED' };
  companyName = '';
  currency = 'AED';

  users: UserItem[] = [];
  roles: RoleItem[] = [];
  permissions: PermissionItem[] = [];

  loading = false;
  message = '';
  error = '';

  showAddUser = false;
  showAddRole = false;

  userForm = { fullName: '', email: '', password: '', roleId: '' };
  roleForm = { name: '', permissionIds: [] as string[] };

  selectedRoleId = '';
  selectedRolePermissionIds: string[] = [];

  constructor(private opsApi: OpsApiService, private adminApi: AdminManagementService) {}

  ngOnInit(): void {
    this.opsApi.getCompanySettings().subscribe({
      next: (res) => {
        this.settings = res.data;
        this.companyName = this.settings.companyName;
        this.currency = this.settings.currency;
      },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load company settings'); }
    });
    this.loadAdminData();
  }

  saveCompany(): void {
    this.opsApi.saveCompanySettings({ companyName: this.companyName, currency: this.currency }).subscribe({
      next: () => { this.message = 'Company settings saved'; },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to save company settings'); }
    });
  }

  loadAdminData(): void {
    this.loading = true;
    this.error = '';

    this.adminApi.getPermissions().subscribe({
      next: (p) => {
        this.permissions = p.data;
        this.adminApi.getRoles().subscribe({
          next: (r) => {
            this.roles = r.data;
            if (this.roles.length && !this.selectedRoleId) this.onRoleSelected(this.roles[0].id);
            this.adminApi.getUsers().subscribe({
              next: (u) => { this.users = u.data; this.loading = false; },
              error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load users'); this.loading = false; }
            });
          },
          error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load roles'); this.loading = false; }
        });
      },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load permissions'); this.loading = false; }
    });
  }

  toggleAddUser(): void {
    this.showAddUser = !this.showAddUser;
    if (this.showAddUser) this.userForm = { fullName: '', email: '', password: '', roleId: this.roles[0]?.id || '' };
  }

  createUser(): void {
    this.error = '';
    this.message = '';
    this.adminApi.createUser(this.userForm).subscribe({
      next: () => { this.message = 'User created'; this.showAddUser = false; this.loadAdminData(); },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to create user'); }
    });
  }

  onChangeUserRole(userId: string, roleId: string): void {
    this.adminApi.updateUserRole(userId, roleId).subscribe({
      next: () => { this.message = 'User role updated'; this.loadAdminData(); },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to update user role'); }
    });
  }

  toggleAddRole(): void {
    this.showAddRole = !this.showAddRole;
    if (this.showAddRole) this.roleForm = { name: '', permissionIds: [] };
  }

  createRole(): void {
    this.adminApi.createRole(this.roleForm).subscribe({
      next: () => { this.message = 'Role created'; this.showAddRole = false; this.loadAdminData(); },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to create role'); }
    });
  }

  onRoleSelected(roleId: string): void {
    this.selectedRoleId = roleId;
    const role = this.roles.find((r) => r.id === roleId);
    this.selectedRolePermissionIds = role ? role.permissions.map((p) => p.id) : [];
  }

  togglePermission(permissionId: string): void {
    this.selectedRolePermissionIds = this.selectedRolePermissionIds.includes(permissionId)
      ? this.selectedRolePermissionIds.filter((id) => id !== permissionId)
      : [...this.selectedRolePermissionIds, permissionId];
  }

  toggleNewRolePermission(permissionId: string): void {
    this.roleForm.permissionIds = this.roleForm.permissionIds.includes(permissionId)
      ? this.roleForm.permissionIds.filter((id) => id !== permissionId)
      : [...this.roleForm.permissionIds, permissionId];
  }

  saveRolePermissions(): void {
    if (!this.selectedRoleId) return;
    this.adminApi.updateRolePermissions(this.selectedRoleId, this.selectedRolePermissionIds).subscribe({
      next: () => { this.message = 'Role permissions updated'; this.loadAdminData(); },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to update role permissions'); }
    });
  }

  roleOf(user: UserItem): string {
    return user.roles[0]?.name || 'Unassigned';
  }
}
