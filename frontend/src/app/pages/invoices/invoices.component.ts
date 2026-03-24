import { Component, OnInit } from '@angular/core';
import { Invoice, InvoiceLine } from '../../services/app-data.service';
import { SqiApiService } from '../../services/sqi-api.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  title = 'Generate Invoice';
  subtitle = 'Create and manage customer invoices for Gift City Qatar.';
  showGenerateForm = false;
  invoices: Invoice[] = [];
  error = '';

  form = {
    client: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    currency: 'AED',
    taxPercent: 0,
    notes: ''
  };
  lines: InvoiceLine[] = [{ description: '', size: '', qty: 1, unitPrice: 0, amount: 0 }];

  constructor(private sqiApi: SqiApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.sqiApi.listInvoices().subscribe({
      next: (res) => {
        this.invoices = res.data.map((x) => ({ ...x, date: String(x.date).slice(0, 10), dueDate: String(x.dueDate).slice(0, 10) }));
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to load invoices';
      }
    });
  }

  get subtotal(): number { return this.lines.reduce((sum, l) => sum + (l.qty * l.unitPrice), 0); }
  get taxAmount(): number { return (this.subtotal * (this.form.taxPercent || 0)) / 100; }
  get total(): number { return this.subtotal + this.taxAmount; }

  toggleGenerateForm(): void {
    this.showGenerateForm = !this.showGenerateForm;
    if (this.showGenerateForm) {
      const today = new Date().toISOString().slice(0, 10);
      const due = new Date(); due.setDate(due.getDate() + 30);
      this.form = { client: '', invoiceDate: today, dueDate: due.toISOString().slice(0, 10), currency: 'AED', taxPercent: 0, notes: '' };
      this.lines = [{ description: '', size: '', qty: 1, unitPrice: 0, amount: 0 }];
    }
  }

  addLine(): void { this.lines.push({ description: '', size: '', qty: 1, unitPrice: 0, amount: 0 }); }
  removeLine(index: number): void { if (this.lines.length > 1) this.lines.splice(index, 1); }
  updateLineAmount(i: number): void { const l = this.lines[i]; l.amount = l.qty * l.unitPrice; }

  saveInvoice(): void {
    this.error = '';
    this.sqiApi.createInvoice({
      client: this.form.client || 'New Client',
      date: this.form.invoiceDate,
      dueDate: this.form.dueDate || this.form.invoiceDate,
      currency: this.form.currency,
      taxPercent: this.form.taxPercent,
      notes: this.form.notes || '',
      lines: this.lines.map((l) => ({ ...l, amount: l.qty * l.unitPrice }))
    }).subscribe({
      next: () => {
        this.loadInvoices();
        this.showGenerateForm = false;
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to save invoice';
      }
    });
  }

  updateStatus(inv: Invoice, status: string): void {
    this.sqiApi.updateInvoiceStatus(inv.id, status).subscribe({
      next: () => this.loadInvoices(),
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to update invoice status';
      }
    });
  }

  previewInvoice(inv: Invoice): void { this.printInvoice(inv, false); }
  downloadInvoice(inv: Invoice): void { this.printInvoice(inv, true); }

  private printInvoice(inv: Invoice, asDownload: boolean): void {
    const lines = inv.lines && inv.lines.length > 0 ? inv.lines : [];
    const subtotal = lines.reduce((s, l) => s + (l.qty * l.unitPrice), 0);
    const taxP = inv.taxPercent || 0;
    const taxAmt = (subtotal * taxP) / 100;
    const total = subtotal + taxAmt;
    const rows = lines.map(l => `\n      <tr>\n        <td>${l.description || '-'}</td>\n        <td>${l.size || '-'}</td>\n        <td>${l.qty}</td>\n        <td>${l.unitPrice.toFixed(2)}</td>\n        <td style="text-align:right">${(l.qty * l.unitPrice).toFixed(2)}</td>\n      </tr>`).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${inv.invoiceNo}</title><style>body{ font-family: Segoe UI, sans-serif; padding: 24px; max-width: 800px; margin: 0 auto; }h1{ color: #b71c1c; font-size: 1.5rem; }table{ width: 100%; border-collapse: collapse; margin: 16px 0; }th,td{ border: 1px solid #ddd; padding: 8px 12px; text-align: left; }th{ background: #f5f5f5; }.text-right{ text-align: right; }.totals{ margin-top: 16px; }.notes{ margin-top: 24px; color: #666; font-size: 0.9rem; }</style></head><body><h1>Gift City Qatar</h1><p><strong>INVOICE</strong> ${inv.invoiceNo}</p><p>Client: <strong>${inv.client}</strong></p><p>Date: ${inv.date} &nbsp; Due: ${inv.dueDate}</p><table><thead><tr><th>Description</th><th>Size</th><th>Qty</th><th>Unit Price</th><th class="text-right">Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><p>Subtotal: ${subtotal.toFixed(2)} ${inv.currency}</p>${taxP > 0 ? `<p>Tax (${taxP}%): ${taxAmt.toFixed(2)} ${inv.currency}</p>` : ''}<p><strong>Total: ${total.toFixed(2)} ${inv.currency}</strong></p></div>${inv.notes ? `<div class="notes">${inv.notes.replace(/\n/g, '<br>')}</div>` : ''}</body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => { w.print(); if (asDownload) w.close(); }, 300); }
  }
}
