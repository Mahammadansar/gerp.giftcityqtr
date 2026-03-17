import { Component, OnInit } from '@angular/core';
import { AppDataService, Retainer } from '../../services/app-data.service';

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss']
})
export class FinanceComponent implements OnInit {
  activeTab: 'bills' | 'retainers' | 'multi' | 'cashflow' = 'bills';
  title = 'Finance';
  subtitle = 'Vendor bills, payments, retainers, multi-currency.';

  vendorBills: { ref: string; vendor: string; date: string; dueDate: string; amount: number; currency: string; status: string }[] = [];
  retainers: Retainer[] = [];
  showAddRetainer = false;
  showAddBill = false;
  retainerForm: Partial<Retainer> = { client: '', amount: 0, currency: 'AED', startDate: '', status: 'Active' };
  billForm: { vendor: string; date: string; dueDate: string; amount: number; currency: string } = { vendor: '', date: '', dueDate: '', amount: 0, currency: 'AED' };

  currencies = [
    { code: 'AED', name: 'UAE Dirham', rate: 1 },
    { code: 'USD', name: 'US Dollar', rate: 0.27 },
    { code: 'EUR', name: 'Euro', rate: 0.25 }
  ];

  cashflowMonths: { month: string; inflow: number; outflow: number }[] = [];

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const pos = this.data.getPurchaseOrders();
    this.vendorBills = pos.map(po => ({
      ref: po.poNo,
      vendor: po.vendor,
      date: po.date,
      dueDate: po.deliveryDate || po.date,
      amount: po.total,
      currency: po.currency,
      status: po.status
    }));
    this.retainers = this.data.getRetainers();
    const inv = this.data.getInvoices();
    const paid = inv.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
    const pending = inv.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0);
    const out = pos.filter(p => p.status === 'Paid').reduce((s, p) => s + p.total, 0);
    this.cashflowMonths = [
      { month: 'Current', inflow: paid, outflow: out },
      { month: 'Expected', inflow: paid + pending, outflow: out + pos.filter(p => p.status === 'Pending').reduce((s, p) => s + p.total, 0) }
    ];
  }

  toggleAddBill(): void {
    this.showAddBill = !this.showAddBill;
    if (this.showAddBill) this.billForm = { vendor: '', date: new Date().toISOString().slice(0, 10), dueDate: '', amount: 0, currency: 'AED' };
  }

  saveBill(): void {
    const due = this.billForm.dueDate || this.billForm.date;
    this.data.addPurchaseOrder({
      poNo: this.data.getNextPONumber(),
      date: this.billForm.date,
      deliveryDate: due,
      vendor: this.billForm.vendor || 'Vendor',
      items: 'Vendor bill',
      total: this.billForm.amount || 0,
      currency: this.billForm.currency || 'AED',
      status: 'Pending'
    });
    this.load();
    this.showAddBill = false;
  }

  toggleAddRetainer(): void {
    this.showAddRetainer = !this.showAddRetainer;
    if (this.showAddRetainer) this.retainerForm = { client: '', amount: 0, currency: 'AED', startDate: new Date().toISOString().slice(0, 10), status: 'Active' };
  }

  saveRetainer(): void {
    const r: Retainer = {
      id: String(Date.now()),
      client: this.retainerForm.client || '',
      amount: this.retainerForm.amount || 0,
      currency: this.retainerForm.currency || 'AED',
      startDate: this.retainerForm.startDate || '',
      status: this.retainerForm.status || 'Active'
    };
    this.data.addRetainer(r);
    this.load();
    this.showAddRetainer = false;
  }
}
