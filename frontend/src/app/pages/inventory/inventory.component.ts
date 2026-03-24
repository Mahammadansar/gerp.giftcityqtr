import { Component, OnInit } from '@angular/core';
import { InventoryItem } from '../../services/app-data.service';
import { InventoryApiService } from '../../services/inventory-api.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  title = 'Inventory';
  subtitle = 'Track stock of gifts and promotional items.';
  items: InventoryItem[] = [];
  showAddForm = false;
  error = '';
  form: Partial<InventoryItem> = { sku: '', name: '', category: 'Gifts', size: '', qty: 0, unit: 'pcs', reorderLevel: 0, status: 'In Stock' };

  constructor(private inventoryApi: InventoryApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.inventoryApi.listItems().subscribe({
      next: (res) => {
        this.items = res.data;
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to load inventory';
      }
    });
  }

  get lowStockCount(): number {
    return this.items.filter(i => i.status === 'Low Stock').length;
  }

  get inStockCount(): number {
    return this.items.filter(i => i.status === 'In Stock').length;
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.form = { sku: '', name: '', category: 'Gifts', size: '', qty: 0, unit: 'pcs', reorderLevel: 0, status: 'In Stock' };
    }
  }

  saveItem(): void {
    this.error = '';
    this.inventoryApi.createItem({
      sku: this.form.sku || '',
      name: this.form.name || '',
      category: this.form.category || 'Gifts',
      size: this.form.size || '',
      qty: Number(this.form.qty || 0),
      unit: this.form.unit || 'pcs',
      reorderLevel: Number(this.form.reorderLevel || 0)
    }).subscribe({
      next: () => {
        this.showAddForm = false;
        this.load();
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to create item';
      }
    });
  }

  adjustQty(item: InventoryItem, newQty: number): void {
    if (newQty < 0) return;
    this.inventoryApi.adjustItem(item.id, { movementType: 'ADJUST', quantity: newQty }).subscribe({
      next: () => this.load(),
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to adjust quantity';
      }
    });
  }
}
