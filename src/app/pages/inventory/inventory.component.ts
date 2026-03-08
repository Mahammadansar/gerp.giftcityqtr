import { Component } from '@angular/core';

interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  qty: number;
  unit: string;
  reorderLevel: number;
  status: string;
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {
  title = 'Inventory';
  subtitle = 'Track stock of gifts and promotional items.';

  items: InventoryItem[] = [
    { sku: 'GFT-001', name: 'Branded Pen Set', category: 'Gifts', qty: 1250, unit: 'pcs', reorderLevel: 200, status: 'In Stock' },
    { sku: 'GFT-002', name: 'Corporate Diary 2026', category: 'Gifts', qty: 890, unit: 'pcs', reorderLevel: 300, status: 'In Stock' },
    { sku: 'PRM-001', name: 'Roll-up Banner', category: 'Print', qty: 45, unit: 'pcs', reorderLevel: 20, status: 'In Stock' },
    { sku: 'GFT-003', name: 'Promo Tote Bag', category: 'Gifts', qty: 85, unit: 'pcs', reorderLevel: 100, status: 'Low Stock' },
    { sku: 'PRM-002', name: 'Standee (A-frame)', category: 'Print', qty: 22, unit: 'pcs', reorderLevel: 15, status: 'In Stock' },
    { sku: 'GFT-004', name: 'USB Branded 8GB', category: 'Gifts', qty: 320, unit: 'pcs', reorderLevel: 150, status: 'In Stock' }
  ];
}
