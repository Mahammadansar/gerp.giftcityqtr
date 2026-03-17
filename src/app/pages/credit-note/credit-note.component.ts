import { Component, OnInit } from '@angular/core';
import { AppDataService, CreditNote } from '../../services/app-data.service';

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

  form = {
    invoiceNo: '',
    client: '',
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    currency: 'AED',
    reason: ''
  };

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.creditNotes = this.data.getCreditNotes();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.form = {
        invoiceNo: '',
        client: '',
        date: new Date().toISOString().slice(0, 10),
        amount: 0,
        currency: 'AED',
        reason: ''
      };
    }
  }

  saveCreditNote(): void {
    const cn: CreditNote = {
      id: String(Date.now()),
      cnNo: this.data.getNextCreditNoteNumber(),
      invoiceNo: this.form.invoiceNo || '—',
      client: this.form.client || 'Client',
      date: this.form.date,
      amount: this.form.amount,
      currency: this.form.currency,
      reason: this.form.reason || '—',
      status: 'Draft'
    };
    this.data.addCreditNote(cn);
    this.loadNotes();
    this.showCreateForm = false;
  }
}
