import { Component, OnInit } from '@angular/core';
import { AppDataService, InventoryItem } from '../../services/app-data.service';

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
  form: Partial<InventoryItem> = { sku: '', name: '', category: 'Gifts', size: '', qty: 0, unit: 'pcs', reorderLevel: 0, status: 'In Stock' };

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.items = this.data.getInventory();
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
    const item: InventoryItem = {
      id: String(Date.now()),
      sku: this.form.sku || 'SKU',
      name: this.form.name || 'Item',
      category: this.form.category || 'Gifts',
      size: this.form.size || '—',
      qty: this.form.qty || 0,
      unit: this.form.unit || 'pcs',
      reorderLevel: this.form.reorderLevel || 0,
      status: (this.form.qty || 0) <= (this.form.reorderLevel || 0) ? 'Low Stock' : 'In Stock'
    };
    this.data.addInventoryItem(item);
    this.load();
    this.showAddForm = false;
  }

  adjustQty(item: InventoryItem, newQty: number): void {
    if (newQty >= 0) {
      this.data.updateInventoryItem(item.id, newQty);
      this.load();
    }
  }
}
