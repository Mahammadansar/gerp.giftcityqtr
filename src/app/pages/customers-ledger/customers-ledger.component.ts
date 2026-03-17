import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../../services/app-data.service';

@Component({
  selector: 'app-customers-ledger',
  templateUrl: './customers-ledger.component.html',
  styleUrls: ['./customers-ledger.component.scss']
})
export class CustomersLedgerComponent implements OnInit {
  title = 'Customers Ledger';
  subtitle = 'Customer-wise outstanding and transaction history.';
  customers: { name: string; opening: number; sales: number; receipts: number; balance: number }[] = [];

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    const invoices = this.data.getInvoices();
    const byClient = new Map<string, { sales: number; paid: number }>();
    for (const inv of invoices) {
      const c = byClient.get(inv.client) || { sales: 0, paid: 0 };
      c.sales += inv.amount;
      if (inv.status === 'Paid') c.paid += inv.amount;
      byClient.set(inv.client, c);
    }
    this.customers = Array.from(byClient.entries()).map(([name, v]) => ({
      name,
      opening: 0,
      sales: v.sales,
      receipts: v.paid,
      balance: v.sales - v.paid
    }));
  }
}
