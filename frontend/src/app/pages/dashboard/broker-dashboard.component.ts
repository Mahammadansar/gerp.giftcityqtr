import { Component, OnInit } from '@angular/core';
import { DashboardApiService } from '../../services/dashboard-api.service';

@Component({
  selector: 'app-broker-dashboard',
  templateUrl: './broker-dashboard.component.html',
  styleUrls: ['./broker-dashboard.component.scss']
})
export class BrokerDashboardComponent implements OnInit {
  kpis: { label: string; value: number; icon: string; trend: number; subtitle: string; chartData: string }[] = [];
  revenueData: { label: string; amount: number; value: number }[] = [];
  quickStats: { icon: string; label: string; value: string; change: number }[] = [];
  recentActivities: { icon: string; type: string; title: string; time: string; description: string }[] = [];
  topOrders: { client: string; amount: number; currency: string }[] = [];
  topDeals = this.topOrders;
  performance: { label: string; value: string; percentage: number; color: string }[] = [];
  clientSegments: { label: string; count: number; percentage: number; type: string }[] = [];
  error = '';

  constructor(private dashboardApi: DashboardApiService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.error = '';
    this.dashboardApi.getOverview().subscribe({
      next: (res) => {
        const d = res.data || {};
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
        this.error = e?.error?.error?.message || 'Failed to load dashboard';
      }
    });
  }
}
