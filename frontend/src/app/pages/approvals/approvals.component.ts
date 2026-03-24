import { Component, OnInit } from '@angular/core';
import { PqiApiService, ApprovalItem } from '../../services/pqi-api.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss']
})
export class ApprovalsComponent implements OnInit {
  title = 'Approvals';
  subtitle = 'Sales and purchase approval workflows.';
  items: ApprovalItem[] = [];
  error = '';

  constructor(private pqiApi: PqiApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.pqiApi.listApprovals().subscribe({
      next: (res) => {
        this.items = res.data.map((x) => ({ ...x, date: String(x.date).slice(0, 10) }));
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to load approvals';
      }
    });
  }

  approve(item: ApprovalItem): void {
    if (item.type !== 'Purchase Order') return;
    this.pqiApi.approvePurchaseOrder(item.id).subscribe({
      next: () => this.load(),
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to approve item';
      }
    });
  }

  reject(item: ApprovalItem): void {
    if (item.type !== 'Purchase Order') return;
    this.pqiApi.rejectPurchaseOrder(item.id).subscribe({
      next: () => this.load(),
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to reject item';
      }
    });
  }
}
