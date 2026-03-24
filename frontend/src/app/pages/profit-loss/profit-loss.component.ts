import { Component, OnInit } from '@angular/core';
import { FinanceApiService } from '../../services/finance-api.service';

@Component({
  selector: 'app-profit-loss',
  templateUrl: './profit-loss.component.html',
  styleUrls: ['./profit-loss.component.scss']
})
export class ProfitLossComponent implements OnInit {
  title = 'Profit and Loss Account';
  subtitle = 'Revenue, expenses and net profit.';
  period = '';
  revenue: { label: string; amount: number }[] = [];
  expenses: { label: string; amount: number }[] = [];
  totalRevenue = 0;
  totalExpenses = 0;
  netProfit = 0;

  constructor(private financeApi: FinanceApiService) {}

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.financeApi.getProfitLoss().subscribe((res: any) => {
      const d = res.data;
      this.period = d.period;
      this.revenue = d.revenue;
      this.expenses = d.expenses;
      this.totalRevenue = d.totalRevenue;
      this.totalExpenses = d.totalExpenses;
      this.netProfit = d.netProfit;
    });
  }
}
