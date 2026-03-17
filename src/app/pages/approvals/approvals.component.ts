import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../../services/app-data.service';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss']
})
export class ApprovalsComponent implements OnInit {
  title = 'Approvals';
  subtitle = 'Sales and purchase approval workflows.';

  items: { type: string; ref: string; requester: string; amount: number; currency: string; date: string; status: string; id?: string; poNo?: string }[] = [];

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const pos = this.data.getPurchaseOrders().filter(p => p.status === 'Pending' || p.status === 'Approved' || p.status === 'Rejected');
    const sos = this.data.getSalesOrders().filter(s => s.status === 'Pending' || s.status === 'Confirmed' || s.status === 'Delivered' || s.status === 'Rejected');
    this.items = [
      ...pos.map(p => ({ type: 'Purchase Order', ref: p.poNo, requester: p.vendor, amount: p.total, currency: p.currency, date: p.date, status: p.status, poNo: p.poNo })),
      ...sos.map(s => ({ type: 'Sales Order', ref: s.orderNo, requester: s.client, amount: s.total, currency: s.currency, date: s.date, status: s.status === 'Confirmed' || s.status === 'Delivered' ? 'Approved' : s.status, id: s.id }))
    ].sort((a, b) => b.date.localeCompare(a.date));
  }

  approve(item: { type: string; ref?: string; poNo?: string; id?: string }): void {
    if (item.type === 'Purchase Order' && item.poNo) this.data.updatePOStatus(item.poNo, 'Approved');
    if (item.type === 'Sales Order' && item.id) this.data.updateSalesOrderStatus(item.id, 'Confirmed');
    this.load();
  }

  reject(item: { type: string; ref?: string; poNo?: string; id?: string }): void {
    if (item.type === 'Purchase Order' && item.poNo) this.data.updatePOStatus(item.poNo, 'Rejected');
    if (item.type === 'Sales Order' && item.id) this.data.updateSalesOrderStatus(item.id, 'Rejected');
    this.load();
  }
}
