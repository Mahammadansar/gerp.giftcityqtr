import { Component } from '@angular/core';

interface PurchaseOrder {
  poNo: string;
  date: string;
  vendor: string;
  items: string;
  total: number;
  currency: string;
  status: string;
}

@Component({
  selector: 'app-purchasing',
  templateUrl: './purchasing.component.html',
  styleUrls: ['./purchasing.component.scss']
})
export class PurchasingComponent {
  title = 'Purchase Orders';
  subtitle = 'Track and manage purchase orders from vendors.';

  orders: PurchaseOrder[] = [
    { poNo: 'PO-2026-001', date: '2026-02-26', vendor: 'Global Gifts Supplies', items: 'Promo items, packaging', total: 8500, currency: 'AED', status: 'Pending' },
    { poNo: 'PO-2026-002', date: '2026-02-25', vendor: 'Print Masters LLC', items: 'Brochures, flyers', total: 12000, currency: 'AED', status: 'Approved' },
    { poNo: 'PO-2026-003', date: '2026-02-24', vendor: 'Brand Merchandise Co', items: 'Branded pens, diaries', total: 6200, currency: 'AED', status: 'Received' },
    { poNo: 'PO-2026-004', date: '2026-02-23', vendor: 'Expo Materials Ltd', items: 'Standees, banners', total: 18500, currency: 'AED', status: 'Approved' },
    { poNo: 'PO-2026-005', date: '2026-02-22', vendor: 'Premium Packaging', items: 'Gift boxes, ribbons', total: 4200, currency: 'AED', status: 'Received' }
  ];
}
