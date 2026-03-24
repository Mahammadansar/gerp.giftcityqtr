import { Component, OnInit } from '@angular/core';
import { PqiApiService } from '../../services/pqi-api.service';
import { SqiApiService } from '../../services/sqi-api.service';
import { OpsApiService } from '../../services/ops-api.service';
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
  loading = false;

  constructor(private sqiApi: SqiApiService, private pqiApi: PqiApiService, private opsApi: OpsApiService) {}

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.loading = true;
    let pending = 3;
    const done = () => { pending -= 1; if (pending <= 0) this.loading = false; };
    this.sqiApi.listInvoices().subscribe({
      next: (invRes) => {
        const invoices = (invRes.data || []).map((i) => ({ ...i, date: String(i.date).slice(0, 10), dueDate: String(i.dueDate).slice(0, 10) }));
        this.salesRows = invoices.filter((i) => i.status === 'Sent' || i.status === 'Paid').slice(0, 20).map((i) => ({ date: i.date, ref: i.invoiceNo, client: i.client, amount: i.amount, currency: i.currency }));
        this.receiptsRows = invoices.filter((i) => i.status === 'Paid').slice(0, 20).map((i) => ({ date: i.date, ref: i.invoiceNo, from: i.client, amount: i.amount, mode: 'Payment' }));
        this.outstandingRows = invoices.filter((i) => i.status !== 'Paid' && i.status !== 'Draft').map((i) => ({ client: i.client, invoiceNo: i.invoiceNo, amount: i.amount, dueDate: i.dueDate }));
        done();
      },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load invoice reports'); done(); }
    });

    this.pqiApi.listPurchaseOrders().subscribe({
      next: (poRes) => {
        const pos = (poRes.data || []).map((p) => ({ ...p, date: String(p.date).slice(0, 10) }));
        this.purchaseRows = pos.slice(0, 20).map((p) => ({ date: p.date, ref: p.poNo, vendor: p.vendor, amount: p.total, currency: p.currency }));
        done();
      },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load purchase reports'); done(); }
    });

    this.opsApi.listBankEntries().subscribe({
      next: (bankRes) => {
        const outflows = (bankRes.data || [])
          .filter((e) => e.type === 'cheque' || e.type === 'withdrawal' || e.type === 'transfer')
          .map((e) => ({
            date: String(e.date).slice(0, 10),
            category: e.type === 'cheque' ? 'Cheque' : e.type === 'withdrawal' ? 'Withdrawal' : 'Transfer',
            ref: e.ref,
            amount: e.amount,
            currency: 'AED'
          }));
        this.paymentsRows = outflows;
        done();
      },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load payment transactions'); done(); }
    });
  }
}
