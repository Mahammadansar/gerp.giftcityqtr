import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../../services/app-data.service';

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

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    const invoices = this.data.getInvoices();
    const pos = this.data.getPurchaseOrders();
    this.salesRows = invoices
      .filter(i => i.status === 'Sent' || i.status === 'Paid')
      .slice(0, 20)
      .map(i => ({ date: i.date, ref: i.invoiceNo, client: i.client, amount: i.amount, currency: i.currency }));
    this.receiptsRows = invoices
      .filter(i => i.status === 'Paid')
      .slice(0, 20)
      .map(i => ({ date: i.date, ref: i.invoiceNo, from: i.client, amount: i.amount, mode: 'Payment' }));
    this.purchaseRows = pos
      .slice(0, 20)
      .map(p => ({ date: p.date, ref: p.poNo, vendor: p.vendor, amount: p.total, currency: p.currency }));
    this.outstandingRows = invoices
      .filter(i => i.status !== 'Paid' && i.status !== 'Draft')
      .map(i => ({ client: i.client, invoiceNo: i.invoiceNo, amount: i.amount, dueDate: i.dueDate }));
    this.paymentsRows = [
      { date: new Date().toISOString().slice(0, 10), category: 'Salary', ref: 'PAY-SAL', amount: 0, currency: 'AED' },
      { date: new Date().toISOString().slice(0, 10), category: 'Rent', ref: 'PAY-RNT', amount: 0, currency: 'AED' },
      { date: new Date().toISOString().slice(0, 10), category: 'Petty cash', ref: 'PAY-PET', amount: 0, currency: 'AED' },
      { date: new Date().toISOString().slice(0, 10), category: 'Local Purchase', ref: 'PAY-LP', amount: 0, currency: 'AED' }
    ];
  }
}
