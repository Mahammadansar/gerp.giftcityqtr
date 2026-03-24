import { Component, OnInit } from '@angular/core';
import { SalesOrder, PriceList } from '../../services/app-data.service';
import { SqiApiService } from '../../services/sqi-api.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  activeTab: 'orders' | 'pricelists' = 'orders';
  title = 'Sales';
  subtitle = 'Track sales orders and manage price lists for gifts and advertisements.';
  salesOrders: SalesOrder[] = [];
  priceLists: PriceList[] = [];
  showAddOrder = false;
  showAddPriceList = false;
  error = '';

  orderForm: Partial<SalesOrder> = { client: '', items: '', total: 0, currency: 'AED', date: '', status: 'Draft' };
  priceListForm: Partial<PriceList> = { name: '', type: 'Gifts', validFrom: '', items: 0, status: 'Active' };

  constructor(private sqiApi: SqiApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.sqiApi.listSalesOrders().subscribe({
      next: (res) => {
        this.salesOrders = res.data.map((o) => ({ ...o, date: String(o.date).slice(0, 10) }));
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to load sales orders';
      }
    });
    this.priceLists = [];
  }

  toggleAddOrder(): void {
    this.showAddOrder = !this.showAddOrder;
    if (this.showAddOrder) this.orderForm = { client: '', items: '', total: 0, currency: 'AED', date: new Date().toISOString().slice(0, 10), status: 'Draft' };
  }

  saveOrder(): void {
    this.error = '';
    this.sqiApi.createSalesOrder({
      client: this.orderForm.client || '',
      items: this.orderForm.items || '',
      total: Number(this.orderForm.total || 0),
      currency: this.orderForm.currency || 'AED',
      date: this.orderForm.date || new Date().toISOString().slice(0, 10),
      status: 'Draft'
    }).subscribe({
      next: () => {
        this.load();
        this.showAddOrder = false;
      },
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to save sales order';
      }
    });
  }

  toggleAddPriceList(): void {
    this.showAddPriceList = !this.showAddPriceList;
  }

  savePriceList(): void {
    this.error = 'Price list is not part of this backend-first phase.';
  }

  updateOrderStatus(order: SalesOrder, status: string): void {
    this.sqiApi.updateSalesOrderStatus(order.id, status).subscribe({
      next: () => this.load(),
      error: (e) => {
        this.error = e?.error?.error?.message || 'Failed to update sales order status';
      }
    });
  }
}
