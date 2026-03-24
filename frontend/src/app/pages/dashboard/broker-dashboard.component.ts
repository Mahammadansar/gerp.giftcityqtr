import { Component, OnInit } from '@angular/core';
import { DashboardApiService, DashboardOverviewData } from '../../services/dashboard-api.service';
import { getApiErrorMessage } from '../../shared/api-error.util';

@Component({
  selector: 'app-broker-dashboard',
  templateUrl: './broker-dashboard.component.html',
  styleUrls: ['./broker-dashboard.component.scss']
})
export class BrokerDashboardComponent implements OnInit {
  kpis: DashboardOverviewData['kpis'] = [];
  revenueData: DashboardOverviewData['revenueData'] = [];
  quickStats: DashboardOverviewData['quickStats'] = [];
  recentActivities: DashboardOverviewData['recentActivities'] = [];
  topOrders: DashboardOverviewData['topDeals'] = [];
  topDeals = this.topOrders;
  performance: DashboardOverviewData['performance'] = [];
  clientSegments: DashboardOverviewData['clientSegments'] = [];
  error = '';

  constructor(private dashboardApi: DashboardApiService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.error = '';
    this.dashboardApi.getOverview().subscribe({
      next: (res) => {
        const d = res.data;
        this.kpis = d.kpis || [];
        this.revenueData = d.revenueData || [];
        this.quickStats = d.quickStats || [];
        this.recentActivities = d.recentActivities || [];
        this.topDeals = d.topDeals || [];
        this.topOrders = this.topDeals;
        this.performance = d.performance || [];
        this.clientSegments = d.clientSegments || [];
      },
      error: (e) => {
        this.error = getApiErrorMessage(e, 'Failed to load dashboard');
      }
    });
  }
}
