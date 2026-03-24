import { Component, OnInit } from '@angular/core';
import { FinanceApiService } from '../../services/finance-api.service';

@Component({
  selector: 'app-suppliers-ledger',
  templateUrl: './suppliers-ledger.component.html',
  styleUrls: ['./suppliers-ledger.component.scss']
})
export class SuppliersLedgerComponent implements OnInit {
  title = 'Suppliers Ledger';
  subtitle = 'Supplier-wise payables and payment history.';
  suppliers: { name: string; opening: number; purchases: number; payments: number; balance: number }[] = [];

  constructor(private financeApi: FinanceApiService) {}

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.financeApi.getSuppliersLedger().subscribe((res: any) => {
      this.suppliers = res.data;
    });
  }
}
