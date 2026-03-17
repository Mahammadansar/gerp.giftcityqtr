import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../../services/app-data.service';

@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.scss']
})
export class CashFlowComponent implements OnInit {
  title = 'Cash Flow Statement';
  subtitle = 'Operating, investing and financing activities.';
  period = '';
  operating: { label: string; amount: number }[] = [];
  investing: { label: string; amount: number }[] = [];
  financing: { label: string; amount: number }[] = [];
  netOperating = 0;
  netInvesting = 0;
  netFinancing = 0;
  netChange = 0;
  openingBalance = 0;
  closingBalance = 0;

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    const now = new Date();
    this.period = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const inv = this.data.getInvoices();
    const pos = this.data.getPurchaseOrders();
    const bank = this.data.getBankEntries();
    const fromCustomers = inv.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
    const toSuppliers = pos.filter(p => p.status === 'Paid').reduce((s, p) => s + p.total, 0);
    const deposits = bank.filter(e => e.type === 'deposit').reduce((s, e) => s + e.amount, 0);
    const withdrawals = bank.filter(e => e.type === 'withdrawal' || e.type === 'cheque').reduce((s, e) => s + e.amount, 0);
    this.operating = [
      { label: 'Cash from customers', amount: fromCustomers },
      { label: 'Cash to suppliers', amount: -toSuppliers },
      { label: 'Other operating', amount: deposits - withdrawals - fromCustomers + toSuppliers }
    ].filter(x => x.amount !== 0);
    if (this.operating.length === 0) this.operating = [{ label: 'Net operating', amount: 0 }];
    this.netOperating = this.operating.reduce((s, o) => s + o.amount, 0);
    this.investing = [{ label: 'Equipment / assets', amount: -this.data.getAssets().reduce((s, a) => s + Math.round(a.value * 0.1), 0) }].filter(i => i.amount !== 0);
    if (this.investing.length === 0) this.investing = [{ label: '—', amount: 0 }];
    this.netInvesting = this.investing.reduce((s, i) => s + i.amount, 0);
    this.financing = [{ label: 'Net financing', amount: 0 }];
    this.netFinancing = 0;
    this.netChange = this.netOperating + this.netInvesting + this.netFinancing;
    this.openingBalance = Math.max(0, fromCustomers - toSuppliers - this.netChange);
    this.closingBalance = this.openingBalance + this.netChange;
  }
}
