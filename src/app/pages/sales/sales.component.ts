import { Component } from '@angular/core';

interface SalesOrder {
  orderNo: string;
  date: string;
  client: string;
  items: string;
  total: number;
  currency: string;
  status: string;
}

interface PriceList {
  name: string;
  type: string;
  validFrom: string;
  items: number;
  status: string;
}

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent {
  activeTab: 'orders' | 'pricelists' = 'orders';
  title = 'Sales';
  subtitle = 'Track sales orders and manage price lists for gifts and advertisements.';

  salesOrders: SalesOrder[] = [
    { orderNo: 'SO-2026-001', date: '2026-02-25', client: 'Al Raha Events', items: 'Promo gifts, Branded items', total: 18500, currency: 'AED', status: 'Confirmed' },
    { orderNo: 'SO-2026-002', date: '2026-02-24', client: 'Gulf Advertising LLC', items: 'Banners, Standees', total: 42000, currency: 'AED', status: 'Delivered' },
    { orderNo: 'SO-2026-003', date: '2026-02-23', client: 'Corporate Gifts Co', items: 'Diaries, Pens, Bags', total: 12500, currency: 'AED', status: 'Pending' },
    { orderNo: 'SO-2026-004', date: '2026-02-22', client: 'Expo 2026 Pavilion', items: 'Merchandise pack', total: 68000, currency: 'USD', status: 'Confirmed' },
    { orderNo: 'SO-2026-005', date: '2026-02-21', client: 'Retail Plus', items: 'Display units, POS', total: 28900, currency: 'AED', status: 'Delivered' }
  ];

  priceLists: PriceList[] = [
    { name: 'Standard Gift Catalog 2026', type: 'Gifts', validFrom: '2026-01-01', items: 120, status: 'Active' },
    { name: 'Advertisement Print Rates', type: 'Print', validFrom: '2026-01-01', items: 45, status: 'Active' },
    { name: 'Corporate Bulk (500+)', type: 'Gifts', validFrom: '2025-06-01', items: 85, status: 'Active' },
    { name: 'Event Promo Pack', type: 'Bundle', validFrom: '2026-02-01', items: 12, status: 'Active' }
  ];
}
