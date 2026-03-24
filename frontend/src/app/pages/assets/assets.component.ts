import { Component, OnInit } from '@angular/core';
import { AppDataService, Asset } from '../../services/app-data.service';

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
  form: Partial<Asset> = { name: '', category: 'Equipment', purchaseDate: '', value: 0, status: 'Active' };

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.assets = this.data.getAssets();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) this.form = { name: '', category: 'Equipment', purchaseDate: new Date().toISOString().slice(0, 10), value: 0, status: 'Active' };
  }

  saveAsset(): void {
    const a: Asset = {
      id: 'FA-' + String(this.assets.length + 1).padStart(3, '0'),
      name: this.form.name || 'Asset',
      category: this.form.category || 'Equipment',
      purchaseDate: this.form.purchaseDate || '',
      value: this.form.value || 0,
      status: this.form.status || 'Active'
    };
    this.data.addAsset(a);
    this.load();
    this.showAddForm = false;
  }
}
