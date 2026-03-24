import { Component, OnInit } from '@angular/core';
import { FinanceApiService } from '../../services/finance-api.service';

@Component({
  selector: 'app-balance-sheet',
  templateUrl: './balance-sheet.component.html',
  styleUrls: ['./balance-sheet.component.scss']
})
export class BalanceSheetComponent implements OnInit {
  title = 'Balance Sheet';
  subtitle = 'Assets, liabilities and equity at a glance.';

  asOfDate = '';
  assets: { label: string; amount: number }[] = [];
  liabilities: { label: string; amount: number }[] = [];
  equity: { label: string; amount: number }[] = [];
  totalAssets = 0;
  totalLiabilitiesAndEquity = 0;

  constructor(private financeApi: FinanceApiService) {}

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.financeApi.getBalanceSheet().subscribe((res: any) => {
      const d = res.data;
      this.asOfDate = d.asOfDate;
      this.assets = d.assets;
      this.liabilities = d.liabilities;
      this.equity = d.equity;
      this.totalAssets = d.totalAssets;
      this.totalLiabilitiesAndEquity = d.totalLiabilitiesAndEquity;
    });
  }
}
