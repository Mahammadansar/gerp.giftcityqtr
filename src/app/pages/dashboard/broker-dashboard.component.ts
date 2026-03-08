import { Component } from '@angular/core';

@Component({
  selector: 'app-broker-dashboard',
  templateUrl: './broker-dashboard.component.html',
  styleUrls: ['./broker-dashboard.component.scss']
})
export class BrokerDashboardComponent {
  kpis = [
    {
      label: 'Total Orders',
      value: 142,
      icon: 'feather icon-shopping-cart',
      trend: 12,
      subtitle: 'This month',
      chartData: '0,20 20,25 40,30 60,35 80,40 100,45'
    },
    {
      label: 'Revenue',
      value: 1250000,
      icon: 'feather icon-dollar-sign',
      trend: 8,
      subtitle: 'AED',
      chartData: '0,15 20,20 40,25 60,30 80,35 100,40'
    },
    {
      label: 'Gross Profit',
      value: 375000,
      icon: 'feather icon-trending-up',
      trend: 15,
      subtitle: 'AED',
      chartData: '0,10 20,15 40,20 60,25 80,30 100,35'
    },
    {
      label: 'Active Clients',
      value: 48,
      icon: 'feather icon-users',
      trend: 5,
      subtitle: 'Active now',
      chartData: '0,25 20,28 40,30 60,32 80,35 100,38'
    }
  ];

  revenueData = [
    { label: 'Sep', amount: 185000, value: 60 },
    { label: 'Oct', amount: 220000, value: 71 },
    { label: 'Nov', amount: 195000, value: 63 },
    { label: 'Dec', amount: 280000, value: 90 },
    { label: 'Jan', amount: 245000, value: 79 },
    { label: 'Feb', amount: 310000, value: 100 }
  ];

  quickStats = [
    { icon: 'feather icon-calendar', label: 'Orders This Week', value: '28', change: 14 },
    { icon: 'feather icon-dollar-sign', label: 'Avg. Order Value', value: '8.8K AED', change: 8 },
    { icon: 'feather icon-clock', label: 'Avg. Fulfilment', value: '5 days', change: -5 },
    { icon: 'feather icon-star', label: 'Client Rating', value: '4.8/5', change: 2 }
  ];

  recentActivities = [
    {
      icon: 'feather icon-check-circle',
      type: 'success',
      title: 'Order delivered - Corporate Gifts Pack',
      time: '2 hours ago',
      description: 'Al Raha Events, Value: 18.5K AED'
    },
    {
      icon: 'feather icon-user-plus',
      type: 'info',
      title: 'New client - Gulf Advertising LLC',
      time: '5 hours ago',
      description: 'Corporate segment, Doha'
    },
    {
      icon: 'feather icon-file-text',
      type: 'primary',
      title: 'Contract signed - Expo 2026 Campaign',
      time: '1 day ago',
      description: 'Expo 2026 Pavilion, 68K AED'
    },
    {
      icon: 'feather icon-bell',
      type: 'warning',
      title: 'Payment received - Branded Merchandise',
      time: '2 days ago',
      description: 'Retail Plus, Amount: 28.9K AED'
    }
  ];

  performance = [
    { label: 'Monthly Target', value: '85%', percentage: 85, color: 'primary' },
    { label: 'Client Satisfaction', value: '92%', percentage: 92, color: 'success' },
    { label: 'Order Conversion', value: '68%', percentage: 68, color: 'primary' }
  ];

  topDeals = [
    { project: 'Expo 2026 Campaign', unit: 'Merchandise pack', client: 'Expo 2026 Pavilion', value: 68000, status: 'CLOSED' },
    { project: 'Gulf Ad Print', unit: 'Banners, Standees', client: 'Gulf Advertising LLC', value: 42000, status: 'CLOSED' },
    { project: 'Corporate Gifts Q1', unit: 'Diaries, Pens', client: 'Corporate Gifts Co', value: 24000, status: 'PENDING' },
    { project: 'Al Raha Branding', unit: 'Promo gifts', client: 'Al Raha Events', value: 18500, status: 'PENDING' }
  ];

  clientSegments = [
    { label: 'Corporate', count: 22, percentage: 46, type: 'corporate' },
    { label: 'Retail', count: 14, percentage: 29, type: 'retail' },
    { label: 'Events', count: 12, percentage: 25, type: 'events' }
  ];
}
