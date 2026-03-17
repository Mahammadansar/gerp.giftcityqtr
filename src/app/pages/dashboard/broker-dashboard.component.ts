import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../../services/app-data.service';

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

  constructor(private data: AppDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    const invoices = this.data.getInvoices();
    const pos = this.data.getPurchaseOrders();
    const totalRevenue = invoices.reduce((s, i) => s + i.amount, 0);
    const paidRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
    const clientCount = new Set(invoices.map(i => i.client)).size;

    this.kpis = [
      { label: 'Total Orders', value: invoices.length + this.data.getSalesOrders().length, icon: 'feather icon-shopping-cart', trend: 12, subtitle: 'This month', chartData: '0,20 20,25 40,30 60,35 80,40 100,45' },
      { label: 'Revenue', value: totalRevenue, icon: 'feather icon-dollar-sign', trend: 8, subtitle: 'AED', chartData: '0,15 20,20 40,25 60,30 80,35 100,40' },
      { label: 'Gross Profit', value: Math.round(totalRevenue * 0.3), icon: 'feather icon-trending-up', trend: 15, subtitle: 'AED', chartData: '0,10 20,15 40,20 60,25 80,30 100,35' },
      { label: 'Active Clients', value: clientCount, icon: 'feather icon-users', trend: 5, subtitle: 'Active now', chartData: '0,25 20,28 40,30 60,32 80,35 100,38' }
    ];

    this.revenueData = invoices.length ? [
      { label: 'Invoices', amount: totalRevenue, value: 100 },
      { label: 'Paid', amount: paidRevenue, value: Math.min(100, Math.round((paidRevenue / totalRevenue) * 100)) }
    ] : [
      { label: 'Jan', amount: 0, value: 0 },
      { label: 'Feb', amount: 0, value: 0 }
    ];

    this.quickStats = [
      { icon: 'feather icon-calendar', label: 'Orders This Week', value: String(invoices.length), change: 14 },
      { icon: 'feather icon-dollar-sign', label: 'Avg. Order Value', value: invoices.length ? (totalRevenue / invoices.length / 1000).toFixed(1) + 'K AED' : '0 AED', change: 8 },
      { icon: 'feather icon-clock', label: 'Pending POs', value: String(pos.filter(p => p.status === 'Pending').length), change: 0 },
      { icon: 'feather icon-file-text', label: 'Draft Invoices', value: String(invoices.filter(i => i.status === 'Draft').length), change: 0 }
    ];

    this.recentActivities = invoices.slice(0, 3).map((inv, i) => ({
      icon: inv.status === 'Paid' ? 'feather icon-check-circle' : 'feather icon-file-text',
      type: inv.status === 'Paid' ? 'success' : 'primary',
      title: inv.status === 'Paid' ? 'Invoice paid' : 'Invoice ' + inv.invoiceNo,
      time: i === 0 ? 'Recent' : inv.date,
      description: inv.client + ', ' + inv.amount + ' ' + inv.currency
    }));

    const byClient = new Map<string, number>();
    invoices.forEach(i => byClient.set(i.client, (byClient.get(i.client) || 0) + i.amount));
    this.topOrders = Array.from(byClient.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([client, amount]) => ({ client, amount, currency: 'AED' }));
    this.topDeals = this.topOrders;
    const totalClients = byClient.size;
    const amounts = Array.from(byClient.values());
    const high = amounts.filter(a => a >= 50000).length;
    const mid = amounts.filter(a => a >= 10000 && a < 50000).length;
    const low = amounts.filter(a => a < 10000).length;
    this.clientSegments = totalClients ? [
      { label: 'High value (50K+)', count: high, percentage: Math.round((high / totalClients) * 100), type: 'green' },
      { label: 'Mid (10K–50K)', count: mid, percentage: Math.round((mid / totalClients) * 100), type: 'blue' },
      { label: 'Standard (&lt;10K)', count: low, percentage: Math.round((low / totalClients) * 100), type: 'gray' }
    ] : [];
    const paidPct = totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0;
    this.performance = [
      { label: 'Collection Rate', value: paidRevenue + ' AED', percentage: paidPct, color: 'green' },
      { label: 'Orders Fulfilled', value: String(invoices.filter(i => i.status === 'Paid').length), percentage: invoices.length ? Math.round((invoices.filter(i => i.status === 'Paid').length / invoices.length) * 100) : 0, color: 'blue' },
      { label: 'Client Reach', value: String(clientCount), percentage: Math.min(100, clientCount * 2), color: 'red' }
    ];
  }
}
