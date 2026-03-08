import { Component } from '@angular/core';

export interface Invoice {
  id: string;
  invoiceNo: string;
  client: string;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: string;
}

export interface InvoiceLine {
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent {
  title = 'Generate Invoice';
  subtitle = 'Create and manage customer invoices for Gift City Qatar.';
  showGenerateForm = false;

  invoices: Invoice[] = [
    { id: '1', invoiceNo: 'INV-GCQ-2026-001', client: 'Al Raha Events', date: '2026-02-20', dueDate: '2026-03-22', amount: 18500, currency: 'AED', status: 'Paid' },
    { id: '2', invoiceNo: 'INV-GCQ-2026-002', client: 'Gulf Advertising LLC', date: '2026-02-22', dueDate: '2026-03-24', amount: 42000, currency: 'AED', status: 'Sent' },
    { id: '3', invoiceNo: 'INV-GCQ-2026-003', client: 'Corporate Gifts Co', date: '2026-02-24', dueDate: '2026-03-26', amount: 12500, currency: 'AED', status: 'Draft' },
    { id: '4', invoiceNo: 'INV-GCQ-2026-004', client: 'Expo 2026 Pavilion', date: '2026-02-25', dueDate: '2026-03-27', amount: 68000, currency: 'USD', status: 'Sent' },
    { id: '5', invoiceNo: 'INV-GCQ-2026-005', client: 'Retail Plus', date: '2026-02-26', dueDate: '2026-03-28', amount: 28900, currency: 'AED', status: 'Overdue' }
  ];

  // Generate form model
  form = {
    client: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    currency: 'AED',
    taxPercent: 0,
    notes: ''
  };
  lines: InvoiceLine[] = [
    { description: '', qty: 1, unitPrice: 0, amount: 0 }
  ];

  get subtotal(): number {
    return this.lines.reduce((sum, l) => sum + (l.qty * l.unitPrice), 0);
  }
  get taxAmount(): number {
    return (this.subtotal * this.form.taxPercent) / 100;
  }
  get total(): number {
    return this.subtotal + this.taxAmount;
  }

  toggleGenerateForm(): void {
    this.showGenerateForm = !this.showGenerateForm;
    if (this.showGenerateForm) {
      const today = new Date().toISOString().slice(0, 10);
      const due = new Date();
      due.setDate(due.getDate() + 30);
      this.form = {
        client: '',
        invoiceDate: today,
        dueDate: due.toISOString().slice(0, 10),
        currency: 'AED',
        taxPercent: 0,
        notes: ''
      };
      this.lines = [{ description: '', qty: 1, unitPrice: 0, amount: 0 }];
    }
  }

  addLine(): void {
    this.lines.push({ description: '', qty: 1, unitPrice: 0, amount: 0 });
  }

  removeLine(index: number): void {
    if (this.lines.length > 1) {
      this.lines.splice(index, 1);
  }
  }

  updateLineAmount(i: number): void {
    const l = this.lines[i];
    l.amount = l.qty * l.unitPrice;
  }

  saveInvoice(): void {
    const nextNo = 'INV-GCQ-2026-' + String(this.invoices.length + 1).padStart(3, '0');
    const due = this.form.dueDate || this.form.invoiceDate;
    this.invoices.unshift({
      id: String(Date.now()),
      invoiceNo: nextNo,
      client: this.form.client || 'New Client',
      date: this.form.invoiceDate,
      dueDate: due,
      amount: this.total,
      currency: this.form.currency,
      status: 'Draft'
    });
    this.showGenerateForm = false;
  }

  downloadInvoice(inv: Invoice): void {
    console.log('Download invoice', inv.invoiceNo);
  }

  previewInvoice(inv: Invoice): void {
    console.log('Preview invoice', inv.invoiceNo);
  }
}
