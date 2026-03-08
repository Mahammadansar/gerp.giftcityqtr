import { Component } from '@angular/core';

interface VendorBill {
  ref: string;
  vendor: string;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: string;
}

interface Retainer {
  client: string;
  amount: number;
  currency: string;
  startDate: string;
  status: string;
}

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss']
})
export class FinanceComponent {
  activeTab: 'bills' | 'retainers' | 'multi' | 'budgets' | 'cashflow' = 'bills';
  title = 'Finance';
  subtitle = 'Vendor bills, payments, retainers, multi-currency. Professional: budgets, cashflow forecasting.';

  vendorBills: VendorBill[] = [
    { ref: 'INV-2026-001', vendor: 'Global Gifts Supplies', date: '2026-02-20', dueDate: '2026-03-22', amount: 8500, currency: 'AED', status: 'Paid' },
    { ref: 'INV-2026-002', vendor: 'Print Masters LLC', date: '2026-02-22', dueDate: '2026-03-24', amount: 12000, currency: 'AED', status: 'Pending' },
    { ref: 'INV-2026-003', vendor: 'Brand Merchandise Co', date: '2026-02-24', dueDate: '2026-03-26', amount: 6200, currency: 'AED', status: 'Paid' }
  ];

  retainers: Retainer[] = [
    { client: 'Al Raha Events', amount: 5000, currency: 'AED', startDate: '2026-01-01', status: 'Active' },
    { client: 'Gulf Advertising LLC', amount: 10000, currency: 'AED', startDate: '2025-06-01', status: 'Active' },
    { client: 'Expo 2026 Pavilion', amount: 2500, currency: 'USD', startDate: '2026-02-01', status: 'Active' }
  ];

  currencies = [
    { code: 'AED', name: 'UAE Dirham', rate: 1 },
    { code: 'USD', name: 'US Dollar', rate: 0.27 },
    { code: 'EUR', name: 'Euro', rate: 0.25 }
  ];

  cashflowMonths = [
    { month: 'Mar 2026', inflow: 125000, outflow: 98000 },
    { month: 'Apr 2026', inflow: 142000, outflow: 105000 },
    { month: 'May 2026', inflow: 138000, outflow: 112000 }
  ];
}
