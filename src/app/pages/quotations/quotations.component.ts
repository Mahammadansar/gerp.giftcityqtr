import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppDataService, Quotation, QuoteLine, Invoice, InvoiceLine } from '../../services/app-data.service';

@Component({
  selector: 'app-quotations',
  templateUrl: './quotations.component.html',
  styleUrls: ['./quotations.component.scss']
})
export class QuotationsComponent implements OnInit {
  title = 'Quotations';
  subtitle = 'Create and manage customer quotations.';
  showCreateForm = false;
  quotations: Quotation[] = [];

  form = {
    client: '',
    quoteDate: new Date().toISOString().slice(0, 10),
    validUntil: '',
    currency: 'AED',
    notes: ''
  };
  lines: QuoteLine[] = [{ description: '', size: '', qty: 1, unitPrice: 0, amount: 0 }];

  constructor(private data: AppDataService, private router: Router) {}

  ngOnInit(): void {
    this.loadQuotations();
  }

  loadQuotations(): void {
    this.quotations = this.data.getQuotations();
  }

  get subtotal(): number {
    return this.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      const today = new Date().toISOString().slice(0, 10);
      const valid = new Date();
      valid.setDate(valid.getDate() + 30);
      this.form = { client: '', quoteDate: today, validUntil: valid.toISOString().slice(0, 10), currency: 'AED', notes: '' };
      this.lines = [{ description: '', size: '', qty: 1, unitPrice: 0, amount: 0 }];
    }
  }

  addLine(): void {
    this.lines.push({ description: '', size: '', qty: 1, unitPrice: 0, amount: 0 });
  }

  removeLine(index: number): void {
    if (this.lines.length > 1) this.lines.splice(index, 1);
  }

  updateLineAmount(i: number): void {
    const l = this.lines[i];
    l.amount = l.qty * l.unitPrice;
  }

  saveQuotation(): void {
    const q: Quotation = {
      id: String(Date.now()),
      quoteNo: this.data.getNextQuotationNumber(),
      client: this.form.client || 'New Client',
      date: this.form.quoteDate,
      validUntil: this.form.validUntil || this.form.quoteDate,
      amount: this.subtotal,
      currency: this.form.currency,
      status: 'Draft',
      notes: this.form.notes || '',
      lines: this.lines.map(l => ({ ...l, amount: l.qty * l.unitPrice }))
    };
    this.data.addQuotation(q);
    this.loadQuotations();
    this.showCreateForm = false;
  }

  updateStatus(q: Quotation, status: string): void {
    this.data.updateQuotationStatus(q.id, status);
    this.loadQuotations();
  }

  convertToInvoice(q: Quotation): void {
    const due = new Date(q.date);
    due.setDate(due.getDate() + 30);
    const invLines: InvoiceLine[] = (q.lines && q.lines.length > 0)
      ? q.lines.map(l => ({ description: l.description, size: l.size, qty: l.qty, unitPrice: l.unitPrice, amount: l.qty * l.unitPrice }))
      : [{ description: 'From Quotation ' + q.quoteNo, size: '', qty: 1, unitPrice: q.amount, amount: q.amount }];
    const inv: Invoice = {
      id: String(Date.now()),
      invoiceNo: this.data.getNextInvoiceNumber(),
      client: q.client,
      date: new Date().toISOString().slice(0, 10),
      dueDate: due.toISOString().slice(0, 10),
      amount: q.amount,
      currency: q.currency,
      status: 'Draft',
      notes: q.notes || '',
      lines: invLines
    };
    this.data.addInvoice(inv);
    this.data.updateQuotationStatus(q.id, 'Accepted');
    this.loadQuotations();
    this.router.navigate(['/invoices']);
  }
}
