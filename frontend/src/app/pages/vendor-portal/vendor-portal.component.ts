import { Component, OnInit } from '@angular/core';
import { PqiApiService } from '../../services/pqi-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';

@Component({
  selector: 'app-vendor-portal',
  templateUrl: './vendor-portal.component.html',
  styleUrls: ['./vendor-portal.component.scss']
})
export class VendorPortalComponent implements OnInit {
  title = 'Vendor Portal';
  subtitle = 'Vendor activity and POs.';

  vendors: { name: string; poCount: number; lastActive: string }[] = [];
  activity: { vendor: string; action: string; date: string; ref: string }[] = [];
  pos: { poNo: string; vendor: string; date: string; total: number; status: string }[] = [];
  showAddPO = false;
  error = '';
  loading = false;
  poForm: { vendor: string; date: string; deliveryDate: string; total: number; currency: string; items: string } = { vendor: '', date: '', deliveryDate: '', total: 0, currency: 'AED', items: '' };

  constructor(private pqiApi: PqiApiService) {}

  ngOnInit(): void { this.load(); }

  toggleAddPO(): void {
    this.showAddPO = !this.showAddPO;
    if (this.showAddPO) this.poForm = { vendor: '', date: new Date().toISOString().slice(0, 10), deliveryDate: '', total: 0, currency: 'AED', items: '' };
  }

  savePO(): void {
    this.pqiApi.createPurchaseOrder({
      vendor: this.poForm.vendor || 'Vendor',
      date: this.poForm.date,
      deliveryDate: this.poForm.deliveryDate || this.poForm.date,
      currency: this.poForm.currency || 'AED',
      lines: [{ description: this.poForm.items || 'Order', size: '', qty: 1, unitPrice: this.poForm.total || 0, amount: this.poForm.total || 0 }]
    }).subscribe({
      next: () => { this.load(); this.showAddPO = false; },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to create purchase order'); }
    });
  }

  load(): void {
    this.loading = true;
    this.pqiApi.listPurchaseOrders().subscribe({
      next: (res) => {
        const orders = (res.data || []).map((po) => ({ ...po, date: String(po.date).slice(0, 10) }));
        const byVendor = new Map<string, { count: number; lastDate: string }>();
        orders.forEach((po) => {
          const cur = byVendor.get(po.vendor) || { count: 0, lastDate: po.date };
          byVendor.set(po.vendor, { count: cur.count + 1, lastDate: po.date > cur.lastDate ? po.date : cur.lastDate });
        });
        this.vendors = Array.from(byVendor.entries()).map(([name, v]) => ({ name, poCount: v.count, lastActive: v.lastDate }));
        this.activity = orders.slice(0, 15).map((po) => ({ vendor: po.vendor, action: `PO ${po.status}`, date: po.date, ref: po.poNo }));
        this.pos = orders.map((po) => ({ poNo: po.poNo, vendor: po.vendor, date: po.date, total: po.total, status: po.status }));
        this.loading = false;
      },
      error: (e) => { this.error = getApiErrorMessage(e, 'Failed to load vendor portal data'); this.loading = false; }
    });
  }
}
