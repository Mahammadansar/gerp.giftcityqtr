import { Component, OnInit } from '@angular/core';
import { FinanceApiService } from '../../services/finance-api.service';

@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.scss']
})
export class CashFlowComponent implements OnInit {
  title = 'Cash Flow Statement';
  subtitle = 'Operating, investing and financing activities.';
  period = '';
  operating: { label: string; amount: number }[] = [];
  investing: { label: string; amount: number }[] = [];
  financing: { label: string; amount: number }[] = [];
  netOperating = 0;
  netInvesting = 0;
  netFinancing = 0;
  netChange = 0;
  openingBalance = 0;
  closingBalance = 0;

  constructor(private financeApi: FinanceApiService) {}

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.financeApi.getCashFlow().subscribe((res: any) => {
      const d = res.data;
      this.period = d.period;
      this.operating = d.operating;
      this.investing = d.investing;
      this.financing = d.financing;
      this.netOperating = d.netOperating;
      this.netInvesting = d.netInvesting;
      this.netFinancing = d.netFinancing;
      this.netChange = d.netChange;
      this.openingBalance = d.openingBalance;
      this.closingBalance = d.closingBalance;
    });
  }
}
