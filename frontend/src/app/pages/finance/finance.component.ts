import { Component, OnInit } from '@angular/core';
import { PqiApiService } from '../../services/pqi-api.service';
import { FinanceApiService, FinanceOverview, FinanceRetainer } from '../../services/finance-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss']
})
export class FinanceComponent implements OnInit {
  activeTab: 'bills' | 'retainers' | 'multi' | 'cashflow' = 'bills';
  title = 'Finance';
  subtitle = 'Vendor bills, payments, retainers, multi-currency.';

  vendorBills: FinanceOverview['vendorBills'] = [];
  retainers: FinanceRetainer[] = [];
  showAddRetainer = false;
  showAddBill = false;
  error = '';
  retainerForm: { client: string; amount: number; currency: string; startDate: string; status: string } = { client: '', amount: 0, currency: 'AED', startDate: '', status: 'Active' };
  billForm: { vendor: string; date: string; dueDate: string; amount: number; currency: string } = { vendor: '', date: '', dueDate: '', amount: 0, currency: 'AED' };

  currencies: FinanceOverview['currencies'] = [
    { code: 'AED', name: 'UAE Dirham', rate: 1 },
    { code: 'USD', name: 'US Dollar', rate: 0.27 },
    { code: 'EUR', name: 'Euro', rate: 0.25 }
  ];

  cashflowMonths: FinanceOverview['cashflowMonths'] = [];

  constructor(private pqiApi: PqiApiService, private financeApi: FinanceApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.financeApi.getOverview().subscribe({
      next: (res) => {
        const d = res.data;
        this.vendorBills = d.vendorBills.map((b) => ({ ...b, date: String(b.date).slice(0, 10), dueDate: String(b.dueDate).slice(0, 10) }));
        this.retainers = d.retainers || [];
        this.cashflowMonths = d.cashflowMonths || [];
        this.currencies = d.currencies || this.currencies;
      },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load finance data'); }
    });
  }

  toggleAddBill(): void {
    this.showAddBill = !this.showAddBill;
    if (this.showAddBill) this.billForm = { vendor: '', date: new Date().toISOString().slice(0, 10), dueDate: '', amount: 0, currency: 'AED' };
  }

  saveBill(): void {
    this.error = '';
    this.pqiApi.createPurchaseOrder({
      vendor: this.billForm.vendor,
      date: this.billForm.date,
      deliveryDate: this.billForm.dueDate || this.billForm.date,
      currency: this.billForm.currency,
      lines: [{ description: 'Vendor bill', size: '', qty: 1, unitPrice: this.billForm.amount, amount: this.billForm.amount }]
    }).subscribe({
      next: () => { this.load(); this.showAddBill = false; },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to save vendor bill'); }
    });
  }

  toggleAddRetainer(): void { this.showAddRetainer = !this.showAddRetainer; }
  saveRetainer(): void {
    this.error = '';
    this.financeApi.createRetainer({
      client: this.retainerForm.client || '',
      amount: Number(this.retainerForm.amount || 0),
      currency: this.retainerForm.currency || 'AED',
      startDate: this.retainerForm.startDate || new Date().toISOString().slice(0, 10),
      status: this.retainerForm.status || 'Active'
    }).subscribe({
      next: () => {
        this.load();
        this.showAddRetainer = false;
        this.retainerForm = { client: '', amount: 0, currency: 'AED', startDate: '', status: 'Active' };
      },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to save retainer'); }
    });
  }
}
