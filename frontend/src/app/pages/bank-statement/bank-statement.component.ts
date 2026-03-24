import { Component, OnInit } from '@angular/core';
import { OpsApiService, BankEntry } from '../../services/ops-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';

@Component({
  selector: 'app-bank-statement',
  templateUrl: './bank-statement.component.html',
  styleUrls: ['./bank-statement.component.scss']
})
export class BankStatementComponent implements OnInit {
  title = 'Bank Statement';
  subtitle = 'Cheque, deposits, withdrawals, and transfers.';
  activeTab: 'cheque' | 'deposits' | 'withdrawals' | 'transfer' = 'cheque';

  get entryType(): 'cheque' | 'deposit' | 'withdrawal' | 'transfer' {
    if (this.activeTab === 'deposits') return 'deposit';
    if (this.activeTab === 'withdrawals') return 'withdrawal';
    return this.activeTab;
  }

  entries: BankEntry[] = [];
  chequeRows: BankEntry[] = [];
  depositsRows: BankEntry[] = [];
  withdrawalsRows: BankEntry[] = [];
  transferRows: BankEntry[] = [];
  error = '';
  loading = false;
  submitting = false;

  showAdd = false;
  form: Partial<BankEntry> = { type: 'cheque', date: '', ref: '', description: '', amount: 0, status: 'Pending' };

  constructor(private opsApi: OpsApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.opsApi.listBankEntries().subscribe({
      next: (res) => {
        this.entries = (res.data || []).map((e) => ({ ...e, date: String(e.date).slice(0, 10) }));
        this.chequeRows = this.entries.filter((e) => e.type === 'cheque');
        this.depositsRows = this.entries.filter((e) => e.type === 'deposit');
        this.withdrawalsRows = this.entries.filter((e) => e.type === 'withdrawal');
        this.transferRows = this.entries.filter((e) => e.type === 'transfer');
        this.loading = false;
      },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load bank entries'); this.loading = false; }
    });
  }

  openAdd(): void {
    this.showAdd = true;
    this.form = { type: this.entryType, date: new Date().toISOString().slice(0, 10), ref: '', description: '', amount: 0, status: 'Pending', toFrom: '' };
  }

  saveEntry(): void {
    if (this.submitting) return;
    this.submitting = true;
    const type = this.entryType;
    const ref = this.form.ref || (type === 'cheque' ? `CHQ-${Date.now()}` : type === 'deposit' ? `DEP-${Date.now()}` : type === 'withdrawal' ? `WD-${Date.now()}` : `TRF-${Date.now()}`);
    this.opsApi.createBankEntry({
      type,
      date: this.form.date || new Date().toISOString().slice(0, 10),
      ref,
      description: this.form.description || '-',
      amount: this.form.amount || 0,
      toFrom: this.form.toFrom,
      status: this.form.status
    }).subscribe({
      next: () => { this.load(); this.showAdd = false; this.submitting = false; },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to save bank entry'); this.submitting = false; }
    });
  }
}
