import { Component, OnInit } from '@angular/core';
import { OpsApiService, CreditNote } from '../../services/ops-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';

@Component({
  selector: 'app-credit-note',
  templateUrl: './credit-note.component.html',
  styleUrls: ['./credit-note.component.scss']
})
export class CreditNoteComponent implements OnInit {
  title = 'Credit Notes';
  subtitle = 'Issue and track credit notes for returns and adjustments.';
  showCreateForm = false;
  creditNotes: CreditNote[] = [];
  error = '';
  loading = false;

  form = {
    invoiceNo: '',
    client: '',
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    currency: 'AED',
    reason: ''
  };

  constructor(private opsApi: OpsApiService) {}

  ngOnInit(): void { this.loadNotes(); }

  loadNotes(): void {
    this.loading = true;
    this.opsApi.listCreditNotes().subscribe({
      next: (res) => {
        this.creditNotes = (res.data || []).map((cn) => ({ ...cn, date: String(cn.date).slice(0, 10) }));
        this.loading = false;
      },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load credit notes'); this.loading = false; }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.form = { invoiceNo: '', client: '', date: new Date().toISOString().slice(0, 10), amount: 0, currency: 'AED', reason: '' };
    }
  }

  saveCreditNote(): void {
    this.opsApi.createCreditNote({
      invoiceNo: this.form.invoiceNo || 'NA',
      client: this.form.client || 'Client',
      date: this.form.date,
      amount: this.form.amount,
      currency: this.form.currency,
      reason: this.form.reason || '-',
      status: 'Draft'
    }).subscribe({
      next: () => { this.loadNotes(); this.showCreateForm = false; },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to save credit note'); }
    });
  }
}
