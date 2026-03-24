import { Component, OnInit } from '@angular/core';
import { AppDataService, DamageEntry } from '../../services/app-data.service';

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

  form = {
    itemName: '',
    sku: '',
    size: '',
    qty: 1,
    reason: '',
    reportedBy: ''
  };

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.entries = this.data.getDamageEntries();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.form = { itemName: '', sku: '', size: '', qty: 1, reason: '', reportedBy: '' };
    }
  }

  saveEntry(): void {
    const today = new Date().toISOString().slice(0, 10);
    const d: DamageEntry = {
      id: String(Date.now()),
      refNo: this.data.getNextDamageRef(),
      date: today,
      itemName: this.form.itemName || '—',
      sku: this.form.sku || '—',
      size: this.form.size || '—',
      qty: this.form.qty,
      reason: this.form.reason || '—',
      reportedBy: this.form.reportedBy || '—',
      status: 'Under review'
    };
    this.data.addDamageEntry(d);
    this.loadEntries();
    this.showCreateForm = false;
  }
}
