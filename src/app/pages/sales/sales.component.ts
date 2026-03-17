import { Component, OnInit } from '@angular/core';
import { AppDataService, SalesOrder, PriceList } from '../../services/app-data.service';

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
  orderForm: Partial<SalesOrder> = { client: '', items: '', total: 0, currency: 'AED', date: '', status: 'Pending' };
  priceListForm: Partial<PriceList> = { name: '', type: 'Gifts', validFrom: '', items: 0, status: 'Active' };

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.salesOrders = this.data.getSalesOrders();
    this.priceLists = this.data.getPriceLists();
  }

  toggleAddOrder(): void {
    this.showAddOrder = !this.showAddOrder;
    if (this.showAddOrder) this.orderForm = { client: '', items: '', total: 0, currency: 'AED', date: new Date().toISOString().slice(0, 10), status: 'Pending' };
  }

  saveOrder(): void {
    const so: SalesOrder = {
      id: String(Date.now()),
      orderNo: 'SO-' + new Date().getFullYear() + '-' + String(this.salesOrders.length + 1).padStart(3, '0'),
      date: this.orderForm.date || '',
      client: this.orderForm.client || '',
      items: this.orderForm.items || '',
      total: this.orderForm.total || 0,
      currency: this.orderForm.currency || 'AED',
      status: this.orderForm.status || 'Pending'
    };
    this.data.addSalesOrder(so);
    this.load();
    this.showAddOrder = false;
  }

  toggleAddPriceList(): void {
    this.showAddPriceList = !this.showAddPriceList;
    if (this.showAddPriceList) this.priceListForm = { name: '', type: 'Gifts', validFrom: new Date().toISOString().slice(0, 10), items: 0, status: 'Active' };
  }

  savePriceList(): void {
    const pl: PriceList = {
      id: String(Date.now()),
      name: this.priceListForm.name || '',
      type: this.priceListForm.type || 'Gifts',
      validFrom: this.priceListForm.validFrom || '',
      items: this.priceListForm.items || 0,
      status: this.priceListForm.status || 'Active'
    };
    this.data.addPriceList(pl);
    this.load();
    this.showAddPriceList = false;
  }

  updateOrderStatus(order: SalesOrder, status: string): void {
    this.data.updateSalesOrderStatus(order.id, status);
    this.load();
  }
}
