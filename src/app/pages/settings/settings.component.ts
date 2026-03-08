import { Component } from '@angular/core';

interface Role {
  name: string;
  users: number;
  description: string;
}

interface Workflow {
  name: string;
  type: string;
  steps: number;
  status: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  title = 'Settings';
  subtitle = 'Workflows, roles, custom domain, custom modules, validation, embed, custom functions.';

  roles: Role[] = [
    { name: 'Admin', users: 2, description: 'Full access' },
    { name: 'Sales Manager', users: 3, description: 'Sales, orders, clients' },
    { name: 'Finance', users: 1, description: 'Bills, payments, reports' },
    { name: 'Vendor', users: 5, description: 'Portal only' }
  ];

  workflows: Workflow[] = [
    { name: 'PO Approval', type: 'Purchase', steps: 2, status: 'Active' },
    { name: 'Sales Discount', type: 'Sales', steps: 1, status: 'Active' },
    { name: 'Vendor Onboarding', type: 'Setup', steps: 3, status: 'Active' }
  ];
}
