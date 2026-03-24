import { Component, OnInit } from '@angular/core';
import { OpsApiService, DamageEntry } from '../../services/ops-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';

@Component({
  selector: 'app-damage-section',
  templateUrl: './damage-section.component.html',
  styleUrls: ['./damage-section.component.scss']
})
export class DamageSectionComponent implements OnInit {
  title = 'Damage Section';
  subtitle = 'Record and track damaged or defective inventory.';
  showCreateForm = false;
  entries: DamageEntry[] = [];
  error = '';
  loading = false;

  form = { itemName: '', sku: '', size: '', qty: 1, reason: '', reportedBy: '' };

  constructor(private opsApi: OpsApiService) {}

  ngOnInit(): void { this.loadEntries(); }

  loadEntries(): void {
    this.loading = true;
    this.opsApi.listDamageEntries().subscribe({
      next: (res) => { this.entries = (res.data || []).map((e) => ({ ...e, date: String(e.date).slice(0, 10) }));
        this.loading = false; },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load damage entries'); this.loading = false; }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) this.form = { itemName: '', sku: '', size: '', qty: 1, reason: '', reportedBy: '' };
  }

  saveEntry(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.opsApi.createDamageEntry({
      date: today,
      itemName: this.form.itemName || '-',
      sku: this.form.sku || '-',
      size: this.form.size || '-',
      qty: this.form.qty,
      reason: this.form.reason || '-',
      reportedBy: this.form.reportedBy || '-',
      status: 'Under review'
    }).subscribe({
      next: () => { this.loadEntries(); this.showCreateForm = false; },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to save damage entry'); }
    });
  }
}
