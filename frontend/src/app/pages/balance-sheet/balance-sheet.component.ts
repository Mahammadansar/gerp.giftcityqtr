import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../../services/app-data.service';

@Component({
  selector: 'app-balance-sheet',
  templateUrl: './balance-sheet.component.html',
  styleUrls: ['./balance-sheet.component.scss']
})
export class BalanceSheetComponent implements OnInit {
  title = 'Balance Sheet';
  subtitle = 'Assets, liabilities and equity at a glance.';

  asOfDate = '';
  assets: { label: string; amount: number }[] = [];
  liabilities: { label: string; amount: number }[] = [];
  equity: { label: string; amount: number }[] = [];
  totalAssets = 0;
  totalLiabilitiesAndEquity = 0;

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.asOfDate = new Date().toISOString().slice(0, 10);
    const inv = this.data.getInvoices();
    const pos = this.data.getPurchaseOrders();
    const bank = this.data.getBankEntries();
    const assetsList = this.data.getAssets();
    const invValue = this.data.getInventory().reduce((s, i) => s + i.qty * 10, 0);

    const cash = bank.filter(e => e.type === 'deposit').reduce((s, e) => s + e.amount, 0) - bank.filter(e => e.type === 'withdrawal' || e.type === 'cheque').reduce((s, e) => s + e.amount, 0);
    const receivables = inv.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0);
    const fixedAssets = assetsList.reduce((s, a) => s + a.value, 0);

    this.assets = [
      { label: 'Cash and Bank', amount: Math.max(0, cash) },
      { label: 'Accounts Receivable', amount: receivables },
      { label: 'Inventory', amount: invValue },
      { label: 'Fixed Assets', amount: fixedAssets }
    ].filter(a => a.amount > 0 || a.label === 'Cash and Bank');
    if (this.assets.length === 0) this.assets = [{ label: 'Cash and Bank', amount: 0 }];

    const payables = pos.filter(p => p.status !== 'Paid').reduce((s, p) => s + p.total, 0);
    this.liabilities = [
      { label: 'Accounts Payable', amount: payables },
      { label: 'Other Liabilities', amount: 0 }
    ].filter(l => l.amount > 0 || l.label === 'Accounts Payable');
    if (this.liabilities.length === 0) this.liabilities = [{ label: 'Accounts Payable', amount: 0 }];

    const totalLiab = this.liabilities.reduce((s, l) => s + l.amount, 0);
    this.totalAssets = this.assets.reduce((s, a) => s + a.amount, 0);
    const eq = Math.max(0, this.totalAssets - totalLiab);
    this.equity = [{ label: "Owner's Equity", amount: eq }];
    this.totalLiabilitiesAndEquity = totalLiab + eq;
  }
}
