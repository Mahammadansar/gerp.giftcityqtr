import { Component } from '@angular/core';

interface ApprovalItem {
  type: string;
  ref: string;
  requester: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
}

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss']
})
export class ApprovalsComponent {
  title = 'Approvals';
  subtitle = 'Sales and purchase approval workflows.';

  items: ApprovalItem[] = [
    { type: 'Purchase Order', ref: 'PO-2026-006', requester: 'John Doe', amount: 15000, currency: 'AED', date: '2026-02-26', status: 'Pending' },
    { type: 'Sales Order', ref: 'SO-2026-008', requester: 'Jane Smith', amount: 32000, currency: 'AED', date: '2026-02-25', status: 'Approved' },
    { type: 'Purchase Order', ref: 'PO-2026-005', requester: 'Ahmed Ali', amount: 4200, currency: 'AED', date: '2026-02-24', status: 'Approved' },
    { type: 'Sales Order', ref: 'SO-2026-007', requester: 'Sara Khan', amount: 18500, currency: 'AED', date: '2026-02-23', status: 'Rejected' }
  ];
}
