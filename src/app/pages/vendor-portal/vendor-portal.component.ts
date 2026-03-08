import { Component } from '@angular/core';

interface VendorActivity {
  vendor: string;
  action: string;
  date: string;
  ref: string;
}

@Component({
  selector: 'app-vendor-portal',
  templateUrl: './vendor-portal.component.html',
  styleUrls: ['./vendor-portal.component.scss']
})
export class VendorPortalComponent {
  title = 'Vendor Portal';
  subtitle = 'Self-service portal for vendors (Professional +).';

  vendors = [
    { name: 'Global Gifts Supplies', poCount: 12, lastActive: '2026-02-26' },
    { name: 'Print Masters LLC', poCount: 8, lastActive: '2026-02-25' },
    { name: 'Brand Merchandise Co', poCount: 15, lastActive: '2026-02-24' }
  ];

  activity: VendorActivity[] = [
    { vendor: 'Print Masters LLC', action: 'Uploaded invoice', date: '2026-02-26', ref: 'INV-PM-442' },
    { vendor: 'Global Gifts Supplies', action: 'Viewed PO', date: '2026-02-25', ref: 'PO-2026-001' },
    { vendor: 'Brand Merchandise Co', action: 'Confirmed delivery', date: '2026-02-24', ref: 'PO-2026-003' }
  ];
}
