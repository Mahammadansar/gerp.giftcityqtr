import { Component, OnInit } from '@angular/core';
import { FinanceApiService } from '../../services/finance-api.service';

@Component({
  selector: 'app-customers-ledger',
  templateUrl: './customers-ledger.component.html',
  styleUrls: ['./customers-ledger.component.scss']
})
export class CustomersLedgerComponent implements OnInit {
  title = 'Customers Ledger';
  subtitle = 'Customer-wise outstanding and transaction history.';
  customers: { name: string; opening: number; sales: number; receipts: number; balance: number }[] = [];

  constructor(private financeApi: FinanceApiService) {}

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.financeApi.getCustomersLedger().subscribe((res: any) => {
      this.customers = res.data;
    });
  }
}
