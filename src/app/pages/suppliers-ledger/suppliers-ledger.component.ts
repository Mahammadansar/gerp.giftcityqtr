import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../../services/app-data.service';

@Component({
  selector: 'app-suppliers-ledger',
  templateUrl: './suppliers-ledger.component.html',
  styleUrls: ['./suppliers-ledger.component.scss']
})
export class SuppliersLedgerComponent implements OnInit {
  title = 'Suppliers Ledger';
  subtitle = 'Supplier-wise payables and payment history.';
  suppliers: { name: string; opening: number; purchases: number; payments: number; balance: number }[] = [];

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    const pos = this.data.getPurchaseOrders();
    const byVendor = new Map<string, { purchases: number; paid: number }>();
    for (const p of pos) {
      const v = byVendor.get(p.vendor) || { purchases: 0, paid: 0 };
      v.purchases += p.total;
      if (p.status === 'Received' || p.status === 'Approved') v.paid += p.total;
      byVendor.set(p.vendor, v);
    }
    this.suppliers = Array.from(byVendor.entries()).map(([name, v]) => ({
      name,
      opening: 0,
      purchases: v.purchases,
      payments: v.paid,
      balance: v.purchases - v.paid
    }));
  }
}
