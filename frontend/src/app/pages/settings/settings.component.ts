import { Component, OnInit } from '@angular/core';
import { AppDataService, AppSettings } from '../../services/app-data.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  title = 'Settings';
  subtitle = 'Company and application settings.';

  roles = [
    { name: 'Admin', users: 2, description: 'Full access' },
    { name: 'Sales Manager', users: 3, description: 'Sales, orders, clients' },
    { name: 'Finance', users: 1, description: 'Bills, payments, reports' },
    { name: 'Vendor', users: 5, description: 'Portal only' }
  ];
  workflows = [
    { name: 'PO Approval', type: 'Purchase', steps: 2, status: 'Active' },
    { name: 'Sales Discount', type: 'Sales', steps: 1, status: 'Active' },
    { name: 'Vendor Onboarding', type: 'Setup', steps: 3, status: 'Active' }
  ];

  settings: AppSettings = { companyName: '', currency: 'AED' };
  companyName = '';
  currency = 'AED';
  showAddRole = false;
  showAddWorkflow = false;
  roleForm: { name: string; users: number; description: string } = { name: '', users: 0, description: '' };
  workflowForm: { name: string; type: string; steps: number; status: string } = { name: '', type: '', steps: 1, status: 'Active' };

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.settings = this.data.getSettings();
    this.companyName = this.settings.companyName;
    this.currency = this.settings.currency;
  }

  saveCompany(): void {
    this.data.saveSettings({ companyName: this.companyName, currency: this.currency });
  }

  toggleAddRole(): void {
    this.showAddRole = !this.showAddRole;
    if (this.showAddRole) this.roleForm = { name: '', users: 0, description: '' };
  }

  addRole(): void {
    this.roles.push({ name: this.roleForm.name || 'Role', users: this.roleForm.users || 0, description: this.roleForm.description || '' });
    this.showAddRole = false;
  }

  toggleAddWorkflow(): void {
    this.showAddWorkflow = !this.showAddWorkflow;
    if (this.showAddWorkflow) this.workflowForm = { name: '', type: 'General', steps: 1, status: 'Active' };
  }

  addWorkflow(): void {
    this.workflows.push({ name: this.workflowForm.name || 'Workflow', type: this.workflowForm.type || 'General', steps: this.workflowForm.steps || 1, status: this.workflowForm.status || 'Active' });
    this.showAddWorkflow = false;
  }
}
