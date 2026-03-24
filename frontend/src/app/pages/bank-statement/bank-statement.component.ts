import { Component, OnInit } from '@angular/core';
import { AppDataService, BankEntry } from '../../services/app-data.service';

@Component({
  selector: 'app-bank-statement',
  templateUrl: './bank-statement.component.html',
  styleUrls: ['./bank-statement.component.scss']
})
export class BankStatementComponent implements OnInit {
  title = 'Bank Statement';
  subtitle = 'Cheque, deposits, withdrawals, and transfers.';
  activeTab: 'cheque' | 'deposits' | 'withdrawals' | 'transfer' = 'cheque';

  /** Map UI tab to BankEntry type */
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

  showAdd = false;
  form: Partial<BankEntry> & { payee?: string; purpose?: string; from?: string; to?: string } = { type: 'cheque', date: '', ref: '', description: '', amount: 0, status: 'Pending' };

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.entries = this.data.getBankEntries();
    this.chequeRows = this.entries.filter(e => e.type === 'cheque');
    this.depositsRows = this.entries.filter(e => e.type === 'deposit');
    this.withdrawalsRows = this.entries.filter(e => e.type === 'withdrawal');
    this.transferRows = this.entries.filter(e => e.type === 'transfer');
  }

  openAdd(): void {
    this.showAdd = true;
    this.form = { type: this.entryType, date: new Date().toISOString().slice(0, 10), ref: '', description: '', amount: 0, status: 'Pending', toFrom: '' };
  }

  saveEntry(): void {
    const type = this.entryType;
    const ref = this.form.ref || (type === 'cheque' ? 'CHQ-' + Date.now() : type === 'deposit' ? 'DEP-' + Date.now() : type === 'withdrawal' ? 'WD-' + Date.now() : 'TRF-' + Date.now());
    const desc = this.form.description || (this.form.payee || this.form.purpose || this.form.from || '');
    const be: BankEntry = {
      id: String(Date.now()),
      type: this.entryType,
      date: this.form.date || '',
      ref,
      description: desc,
      amount: this.form.amount || 0,
      toFrom: this.form.toFrom,
      status: this.form.status
    };
    this.data.addBankEntry(be);
    this.load();
    this.showAdd = false;
  }
}
