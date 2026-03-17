import { Component, OnInit } from '@angular/core';
import { AppDataService, PurchaseOrder } from '../../services/app-data.service';

interface POLine {
  description: string;
  size: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

@Component({
  selector: 'app-purchasing',
  templateUrl: './purchasing.component.html',
  styleUrls: ['./purchasing.component.scss']
})
export class PurchasingComponent implements OnInit {
  title = 'Purchase Orders';
  subtitle = 'Create and manage purchase orders from vendors.';
  showCreateForm = false;
  orders: PurchaseOrder[] = [];

  form = {
    vendor: '',
    orderDate: new Date().toISOString().slice(0, 10),
    deliveryDate: '',
    currency: 'AED',
    notes: ''
  };
  poLines: POLine[] = [{ description: '', size: '', qty: 1, unitPrice: 0, amount: 0 }];

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orders = this.data.getPurchaseOrders();
  }

  get poSubtotal(): number {
    return this.poLines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      const today = new Date().toISOString().slice(0, 10);
      const delivery = new Date();
      delivery.setDate(delivery.getDate() + 14);
      this.form = { vendor: '', orderDate: today, deliveryDate: delivery.toISOString().slice(0, 10), currency: 'AED', notes: '' };
      this.poLines = [{ description: '', size: '', qty: 1, unitPrice: 0, amount: 0 }];
    }
  }

  addPOLine(): void {
    this.poLines.push({ description: '', size: '', qty: 1, unitPrice: 0, amount: 0 });
  }

  removePOLine(index: number): void {
    if (this.poLines.length > 1) this.poLines.splice(index, 1);
  }

  updatePOLineAmount(i: number): void {
    const l = this.poLines[i];
    l.amount = l.qty * l.unitPrice;
  }

  savePO(): void {
    const itemsSummary = this.poLines.map(l => l.description || 'Item').filter(Boolean).slice(0, 3).join(', ');
    const po: PurchaseOrder = {
      poNo: this.data.getNextPONumber(),
      date: this.form.orderDate,
      deliveryDate: this.form.deliveryDate || this.form.orderDate,
      vendor: this.form.vendor || 'Vendor',
      items: itemsSummary || '—',
      total: this.poSubtotal,
      currency: this.form.currency,
      status: 'Pending',
      notes: this.form.notes || '',
      lines: this.poLines.map(l => ({ ...l, amount: l.qty * l.unitPrice }))
    };
    this.data.addPurchaseOrder(po);
    this.loadOrders();
    this.showCreateForm = false;
  }
}
