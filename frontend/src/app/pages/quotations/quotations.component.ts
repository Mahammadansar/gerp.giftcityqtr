import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Quotation, QuoteLine } from '../../services/app-data.service';
import { SqiApiService } from '../../services/sqi-api.service';

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
  error = '';

  form = {
    client: '',
    quoteDate: new Date().toISOString().slice(0, 10),
    validUntil: '',
    currency: 'AED',
    notes: ''
  };
  lines: QuoteLine[] = [{ description: '', size: '', qty: 1, unitPrice: 0, amount: 0 }];

  constructor(private sqiApi: SqiApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadQuotations();
  }

  loadQuotations(): void {
    this.sqiApi.listQuotations().subscribe({
      next: (res) => {
        this.quotations = res.data.map((q) => ({ ...q, date: String(q.date).slice(0, 10), validUntil: String(q.validUntil).slice(0, 10) }));
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to load quotations';
      }
    });
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

  addLine(): void { this.lines.push({ description: '', size: '', qty: 1, unitPrice: 0, amount: 0 }); }
  removeLine(index: number): void { if (this.lines.length > 1) this.lines.splice(index, 1); }
  updateLineAmount(i: number): void { const l = this.lines[i]; l.amount = l.qty * l.unitPrice; }

  saveQuotation(): void {
    this.error = '';
    this.sqiApi.createQuotation({
      client: this.form.client || 'New Client',
      date: this.form.quoteDate,
      validUntil: this.form.validUntil || this.form.quoteDate,
      currency: this.form.currency,
      notes: this.form.notes || '',
      lines: this.lines.map((l) => ({ ...l, amount: l.qty * l.unitPrice }))
    }).subscribe({
      next: () => {
        this.loadQuotations();
        this.showCreateForm = false;
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to save quotation';
      }
    });
  }

  updateStatus(q: Quotation, status: string): void {
    this.sqiApi.updateQuotationStatus(q.id, status).subscribe({
      next: () => this.loadQuotations(),
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to update quotation status';
      }
    });
  }

  convertToInvoice(q: Quotation): void {
    this.sqiApi.convertQuotationToInvoice(q.id).subscribe({
      next: () => {
        this.loadQuotations();
        this.router.navigate(['/invoices']);
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to convert quotation';
      }
    });
  }
}
