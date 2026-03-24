import { Component, OnInit } from '@angular/core';
import { PqiApiService } from '../../services/pqi-api.service';
import { SqiApiService } from '../../services/sqi-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';

@Component({
  selector: 'app-daily-reports',
  templateUrl: './daily-reports.component.html',
  styleUrls: ['./daily-reports.component.scss']
})
export class DailyReportsComponent implements OnInit {
  title = 'Daily Reports';
  subtitle = 'Sales, receipts, purchase, outstanding amount, and payments.';
  activeTab: 'sales' | 'receipts' | 'purchase' | 'outstanding' | 'payments' = 'sales';

  salesRows: { date: string; ref: string; client: string; amount: number; currency: string }[] = [];
  receiptsRows: { date: string; ref: string; from: string; amount: number; mode: string }[] = [];
  purchaseRows: { date: string; ref: string; vendor: string; amount: number; currency: string }[] = [];
  outstandingRows: { client: string; invoiceNo: string; amount: number; dueDate: string }[] = [];
  paymentsRows: { date: string; category: string; ref: string; amount: number; currency: string }[] = [];
  error = '';

  constructor(private sqiApi: SqiApiService, private pqiApi: PqiApiService) {}

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.sqiApi.listInvoices().subscribe({
      next: (invRes) => {
        const invoices = (invRes.data || []).map((i) => ({ ...i, date: String(i.date).slice(0, 10), dueDate: String(i.dueDate).slice(0, 10) }));
        this.salesRows = invoices.filter((i) => i.status === 'Sent' || i.status === 'Paid').slice(0, 20).map((i) => ({ date: i.date, ref: i.invoiceNo, client: i.client, amount: i.amount, currency: i.currency }));
        this.receiptsRows = invoices.filter((i) => i.status === 'Paid').slice(0, 20).map((i) => ({ date: i.date, ref: i.invoiceNo, from: i.client, amount: i.amount, mode: 'Payment' }));
        this.outstandingRows = invoices.filter((i) => i.status !== 'Paid' && i.status !== 'Draft').map((i) => ({ client: i.client, invoiceNo: i.invoiceNo, amount: i.amount, dueDate: i.dueDate }));
      },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load invoice reports'); }
    });

    this.pqiApi.listPurchaseOrders().subscribe({
      next: (poRes) => {
        const pos = (poRes.data || []).map((p) => ({ ...p, date: String(p.date).slice(0, 10) }));
        this.purchaseRows = pos.slice(0, 20).map((p) => ({ date: p.date, ref: p.poNo, vendor: p.vendor, amount: p.total, currency: p.currency }));
      },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load purchase reports'); }
    });

    const today = new Date().toISOString().slice(0, 10);
    this.paymentsRows = [
      { date: today, category: 'Salary', ref: 'PAY-SAL', amount: 0, currency: 'AED' },
      { date: today, category: 'Rent', ref: 'PAY-RNT', amount: 0, currency: 'AED' },
      { date: today, category: 'Petty cash', ref: 'PAY-PET', amount: 0, currency: 'AED' },
      { date: today, category: 'Local Purchase', ref: 'PAY-LP', amount: 0, currency: 'AED' }
    ];
  }
}
