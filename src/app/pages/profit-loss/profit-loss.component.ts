import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../../services/app-data.service';

@Component({
  selector: 'app-profit-loss',
  templateUrl: './profit-loss.component.html',
  styleUrls: ['./profit-loss.component.scss']
})
export class ProfitLossComponent implements OnInit {
  title = 'Profit and Loss Account';
  subtitle = 'Revenue, expenses and net profit.';
  period = '';
  revenue: { label: string; amount: number }[] = [];
  expenses: { label: string; amount: number }[] = [];
  totalRevenue = 0;
  totalExpenses = 0;
  netProfit = 0;

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    const now = new Date();
    this.period = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const inv = this.data.getInvoices();
    const pos = this.data.getPurchaseOrders();
    const sales = inv.reduce((s, i) => s + i.amount, 0);
    const cogs = pos.filter(p => p.status === 'Paid').reduce((s, p) => s + p.total, 0) * 0.7;
    this.revenue = [
      { label: 'Sales', amount: sales },
      { label: 'Other Income', amount: Math.max(0, Math.round(sales * 0.02)) }
    ];
    this.totalRevenue = this.revenue.reduce((s, r) => s + r.amount, 0);
    this.expenses = [
      { label: 'Cost of Goods Sold', amount: Math.round(cogs) },
      { label: 'Operating', amount: Math.round(this.totalRevenue * 0.1) },
      { label: 'Other', amount: Math.round(this.totalRevenue * 0.02) }
    ].filter(e => e.amount > 0);
    if (this.expenses.length === 0) this.expenses = [{ label: 'Other', amount: 0 }];
    this.totalExpenses = this.expenses.reduce((s, e) => s + e.amount, 0);
    this.netProfit = this.totalRevenue - this.totalExpenses;
  }
}
