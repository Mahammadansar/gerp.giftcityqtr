import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardOverviewData {
  kpis: { label: string; value: number; icon: string; trend: number; subtitle: string; chartData: string }[];
  revenueData: { label: string; amount: number; value: number }[];
  quickStats: { icon: string; label: string; value: string; change: number }[];
  recentActivities: { icon: string; type: string; title: string; time: string; description: string }[];
  topDeals: { client: string; amount: number; currency: string }[];
  performance: { label: string; value: string; percentage: number; color: string }[];
  clientSegments: { label: string; count: number; percentage: number; type: string }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly api = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getOverview(): Observable<{ data: DashboardOverviewData }> {
    return this.http.get<{ data: DashboardOverviewData }>(`${this.api}/overview`);
  }

  getSummary(): Observable<{ data: { invoiceAmount: number; pendingPurchaseOrders: number; inventoryItems: number; totalOrders: number } }> {
    return this.http.get<{ data: { invoiceAmount: number; pendingPurchaseOrders: number; inventoryItems: number; totalOrders: number } }>(`${this.api}/summary`);
  }
}
