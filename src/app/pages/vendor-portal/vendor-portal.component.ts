import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../../services/app-data.service';

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
  poForm: { vendor: string; date: string; deliveryDate: string; total: number; currency: string; items: string } = { vendor: '', date: '', deliveryDate: '', total: 0, currency: 'AED', items: '' };

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.load();
  }

  toggleAddPO(): void {
    this.showAddPO = !this.showAddPO;
    if (this.showAddPO) this.poForm = { vendor: '', date: new Date().toISOString().slice(0, 10), deliveryDate: '', total: 0, currency: 'AED', items: '' };
  }

  savePO(): void {
    this.data.addPurchaseOrder({
      poNo: this.data.getNextPONumber(),
      date: this.poForm.date,
      deliveryDate: this.poForm.deliveryDate || this.poForm.date,
      vendor: this.poForm.vendor || 'Vendor',
      items: this.poForm.items || 'Order',
      total: this.poForm.total || 0,
      currency: this.poForm.currency || 'AED',
      status: 'Pending'
    });
    this.load();
    this.showAddPO = false;
  }

  load(): void {
    const orders = this.data.getPurchaseOrders();
    const byVendor = new Map<string, { count: number; lastDate: string }>();
    orders.forEach(po => {
      const cur = byVendor.get(po.vendor) || { count: 0, lastDate: po.date };
      byVendor.set(po.vendor, { count: cur.count + 1, lastDate: po.date > cur.lastDate ? po.date : cur.lastDate });
    });
    this.vendors = Array.from(byVendor.entries()).map(([name, v]) => ({ name, poCount: v.count, lastActive: v.lastDate }));
    this.activity = orders.slice(0, 15).map(po => ({ vendor: po.vendor, action: 'PO ' + po.status, date: po.date, ref: po.poNo }));
    this.pos = orders.map(po => ({ poNo: po.poNo, vendor: po.vendor, date: po.date, total: po.total, status: po.status }));
  }
}
