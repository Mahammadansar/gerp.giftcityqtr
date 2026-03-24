import { Component, OnInit } from '@angular/core';
import { OpsApiService, Asset } from '../../services/ops-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit {
  title = 'Fixed Assets';
  subtitle = 'Manage long-term assets.';

  assets: Asset[] = [];
  showAddForm = false;
  error = '';
  loading = false;
  submitting = false;
  form: Partial<Asset> = { name: '', category: 'Equipment', purchaseDate: '', value: 0, status: 'Active' };

  constructor(private opsApi: OpsApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.opsApi.listAssets().subscribe({
      next: (res) => { this.assets = (res.data || []).map((a) => ({ ...a, purchaseDate: String(a.purchaseDate).slice(0, 10) }));
        this.loading = false; },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load assets'); this.loading = false; }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) this.form = { name: '', category: 'Equipment', purchaseDate: new Date().toISOString().slice(0, 10), value: 0, status: 'Active' };
  }

  saveAsset(): void {
    if (this.submitting) return;
    this.submitting = true;
    this.opsApi.createAsset({
      name: this.form.name || 'Asset',
      category: this.form.category || 'Equipment',
      purchaseDate: this.form.purchaseDate || new Date().toISOString().slice(0, 10),
      value: this.form.value || 0,
      status: this.form.status || 'Active'
    }).subscribe({
      next: () => { this.load(); this.showAddForm = false; this.submitting = false; },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to save asset'); this.submitting = false; }
    });
  }
}
