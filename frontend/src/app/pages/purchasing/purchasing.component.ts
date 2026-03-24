import { Component, OnInit } from '@angular/core';
import { PurchaseOrder } from '../../services/app-data.service';
import { PqiApiService } from '../../services/pqi-api.service';
import { AuthService } from '../../auth/auth.service';

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
  error = '';

  form = {
    vendor: '',
    orderDate: new Date().toISOString().slice(0, 10),
    deliveryDate: '',
    currency: 'AED',
    notes: ''
  };
  poLines: POLine[] = [{ description: '', size: '', qty: 1, unitPrice: 0, amount: 0 }];

  constructor(private pqiApi: PqiApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.pqiApi.listPurchaseOrders().subscribe({
      next: (res) => {
        this.orders = res.data.map((o) => ({ ...o, date: String(o.date).slice(0, 10), deliveryDate: o.deliveryDate ? String(o.deliveryDate).slice(0, 10) : undefined }));
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to load purchase orders';
      }
    });
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

  addPOLine(): void { this.poLines.push({ description: '', size: '', qty: 1, unitPrice: 0, amount: 0 }); }
  removePOLine(index: number): void { if (this.poLines.length > 1) this.poLines.splice(index, 1); }
  updatePOLineAmount(i: number): void { const l = this.poLines[i]; l.amount = l.qty * l.unitPrice; }

  savePO(): void {
    this.error = '';
    this.pqiApi.createPurchaseOrder({
      vendor: this.form.vendor,
      date: this.form.orderDate,
      deliveryDate: this.form.deliveryDate || this.form.orderDate,
      currency: this.form.currency,
      notes: this.form.notes,
      lines: this.poLines.map((l) => ({ ...l, amount: l.qty * l.unitPrice }))
    }).subscribe({
      next: () => {
        this.loadOrders();
        this.showCreateForm = false;
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to create purchase order';
      }
    });
  }
}
