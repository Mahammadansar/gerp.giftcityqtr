import { Component, OnInit } from '@angular/core';
import { AdminManagementService, PermissionItem, RoleItem, UserItem } from '../../services/admin-management.service';
import { OpsApiService, AppSettings } from '../../services/ops-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';
import { AuthService } from '../../auth/auth.service';

interface ModuleAccessRow {
  key: string;
  label: string;
  readPermissionId: string | null;
  writePermissionId: string | null;
}

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
  moduleRows: ModuleAccessRow[] = [];
  specialPermissions: PermissionItem[] = [];

  loading = false;
  message = '';
  error = '';

  showAddUser = false;
  showAddRole = false;

  userForm = { fullName: '', email: '', password: '', roleId: '' };
  roleForm = { name: '', permissionIds: [] as string[] };

  selectedRoleId = '';
  selectedRolePermissionIds: string[] = [];

  constructor(private opsApi: OpsApiService, private adminApi: AdminManagementService, public auth: AuthService) {}

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

  private buildPermissionViews(): void {
    const modules: Array<{ key: string; label: string }> = [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'sales', label: 'Sales' },
      { key: 'purchasing', label: 'Purchasing' },
      { key: 'inventory', label: 'Inventory' },
      { key: 'finance', label: 'Finance' },
      { key: 'hr', label: 'HR' },
      { key: 'projects', label: 'Projects' },
      { key: 'approvals', label: 'Approvals' },
      { key: 'settings', label: 'Settings' }
    ];

    const byKey = new Map<string, PermissionItem>();
    this.permissions.forEach((p) => byKey.set(`${p.action}:${p.resource}`, p));

    this.moduleRows = modules.map((m) => ({
      key: m.key,
      label: m.label,
      readPermissionId: byKey.get(`read:${m.key}`)?.id || null,
      writePermissionId: byKey.get(`write:${m.key}`)?.id || null
    }));

    this.specialPermissions = this.permissions.filter((p) => {
      const k = `${p.action}:${p.resource}`;
      return k === 'approve:purchaseOrder' || k === 'manage:users' || k === 'manage:roles' || k === 'manage:all';
    });
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
        this.buildPermissionViews();
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

  private setPermissionChecked(id: string | null, checked: boolean, target: 'selected' | 'new'): void {
    if (!id) return;
    const arr = target === 'selected' ? this.selectedRolePermissionIds : this.roleForm.permissionIds;
    const has = arr.includes(id);
    const next = checked ? (has ? arr : [...arr, id]) : arr.filter((x) => x !== id);
    if (target === 'selected') this.selectedRolePermissionIds = next;
    else this.roleForm.permissionIds = next;
  }

  setModuleAccess(module: ModuleAccessRow, access: 'read' | 'write', checked: boolean, target: 'selected' | 'new'): void {
    if (access === 'write') {
      this.setPermissionChecked(module.writePermissionId, checked, target);
      if (checked) this.setPermissionChecked(module.readPermissionId, true, target);
      return;
    }
    this.setPermissionChecked(module.readPermissionId, checked, target);
    if (!checked) this.setPermissionChecked(module.writePermissionId, false, target);
  }

  isModuleReadChecked(module: ModuleAccessRow, target: 'selected' | 'new'): boolean {
    const arr = target === 'selected' ? this.selectedRolePermissionIds : this.roleForm.permissionIds;
    const hasRead = module.readPermissionId ? arr.includes(module.readPermissionId) : false;
    const hasWrite = module.writePermissionId ? arr.includes(module.writePermissionId) : false;
    return hasRead || hasWrite;
  }

  isModuleWriteChecked(module: ModuleAccessRow, target: 'selected' | 'new'): boolean {
    const arr = target === 'selected' ? this.selectedRolePermissionIds : this.roleForm.permissionIds;
    return module.writePermissionId ? arr.includes(module.writePermissionId) : false;
  }

  toggleSpecialPermission(permissionId: string, target: 'selected' | 'new'): void {
    const arr = target === 'selected' ? this.selectedRolePermissionIds : this.roleForm.permissionIds;
    const next = arr.includes(permissionId) ? arr.filter((id) => id !== permissionId) : [...arr, permissionId];
    if (target === 'selected') this.selectedRolePermissionIds = next;
    else this.roleForm.permissionIds = next;
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
