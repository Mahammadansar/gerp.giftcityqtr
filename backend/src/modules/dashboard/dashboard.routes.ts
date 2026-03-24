import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireAnyPermission } from '../../middleware/rbac.js';

export const dashboardRouter = Router();

function getOrgId(req: AuthedRequest): string {
  if (!req.user?.orgId) throw new Error('Missing organization scope');
  return req.user.orgId;
}

dashboardRouter.get('/summary', requireAuth, requireAnyPermission(['read:dashboard', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);

  const [invoiceTotal, pendingPo, inventoryCount, salesOrderCount] = await Promise.all([
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { orgId } }),
    prisma.purchaseOrder.count({ where: { orgId, status: 'Pending' } }),
    prisma.inventoryItem.count({ where: { orgId } }),
    prisma.salesOrder.count({ where: { orgId } })
  ]);

  res.json({
    data: {
      invoiceAmount: invoiceTotal._sum.amount ?? 0,
      pendingPurchaseOrders: pendingPo,
      inventoryItems: inventoryCount,
      totalOrders: salesOrderCount
    }
  });
});

dashboardRouter.get('/overview', requireAuth, requireAnyPermission(['read:dashboard', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const [invoices, salesOrders, purchaseOrders] = await Promise.all([
    prisma.invoice.findMany({ where: { orgId }, orderBy: { date: 'desc' } }),
    prisma.salesOrder.findMany({ where: { orgId } }),
    prisma.purchaseOrder.findMany({ where: { orgId } })
  ]);

  const totalRevenue = invoices.reduce((s, i) => s + i.amount, 0);
  const paidRevenue = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const clientCount = new Set(invoices.map((i) => i.client)).size;
  const totalOrders = invoices.length + salesOrders.length;
  const draftInvoices = invoices.filter((i) => i.status === 'Draft').length;
  const pendingPos = purchaseOrders.filter((p) => p.status === 'Pending').length;

  const revenueData = totalRevenue > 0
    ? [
        { label: 'Invoices', amount: totalRevenue, value: 100 },
        { label: 'Paid', amount: paidRevenue, value: Math.min(100, Math.round((paidRevenue / totalRevenue) * 100)) }
      ]
    : [
        { label: 'Invoices', amount: 0, value: 0 },
        { label: 'Paid', amount: 0, value: 0 }
      ];

  const recentActivities = invoices.slice(0, 5).map((inv, i) => ({
    icon: inv.status === 'Paid' ? 'feather icon-check-circle' : 'feather icon-file-text',
    type: inv.status === 'Paid' ? 'success' : 'primary',
    title: inv.status === 'Paid' ? 'Invoice paid' : `Invoice ${inv.invoiceNo}`,
    time: i === 0 ? 'Recent' : String(inv.date).slice(0, 10),
    description: `${inv.client}, ${inv.amount} ${inv.currency}`
  }));

  const byClient = new Map<string, number>();
  invoices.forEach((i) => byClient.set(i.client, (byClient.get(i.client) || 0) + i.amount));
  const topDeals = Array.from(byClient.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([client, amount]) => ({ client, amount, currency: 'AED' }));

  const amounts = Array.from(byClient.values());
  const totalClients = byClient.size;
  const high = amounts.filter((a) => a >= 50000).length;
  const mid = amounts.filter((a) => a >= 10000 && a < 50000).length;
  const low = amounts.filter((a) => a < 10000).length;
  const clientSegments = totalClients
    ? [
        { label: 'High value (50K+)', count: high, percentage: Math.round((high / totalClients) * 100), type: 'green' },
        { label: 'Mid (10K-50K)', count: mid, percentage: Math.round((mid / totalClients) * 100), type: 'blue' },
        { label: 'Standard (<10K)', count: low, percentage: Math.round((low / totalClients) * 100), type: 'gray' }
      ]
    : [];

  const paidPct = totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0;
  const fulfilled = invoices.filter((i) => i.status === 'Paid').length;

  const performance = [
    { label: 'Collection Rate', value: `${paidRevenue} AED`, percentage: paidPct, color: 'green' },
    { label: 'Orders Fulfilled', value: String(fulfilled), percentage: invoices.length ? Math.round((fulfilled / invoices.length) * 100) : 0, color: 'blue' },
    { label: 'Client Reach', value: String(clientCount), percentage: Math.min(100, clientCount * 2), color: 'red' }
  ];

  res.json({
    data: {
      kpis: [
        { label: 'Total Orders', value: totalOrders, icon: 'feather icon-shopping-cart', trend: 12, subtitle: 'This month', chartData: '0,20 20,25 40,30 60,35 80,40 100,45' },
        { label: 'Revenue', value: totalRevenue, icon: 'feather icon-dollar-sign', trend: 8, subtitle: 'AED', chartData: '0,15 20,20 40,25 60,30 80,35 100,40' },
        { label: 'Gross Profit', value: Math.round(totalRevenue * 0.3), icon: 'feather icon-trending-up', trend: 15, subtitle: 'AED', chartData: '0,10 20,15 40,20 60,25 80,30 100,35' },
        { label: 'Active Clients', value: clientCount, icon: 'feather icon-users', trend: 5, subtitle: 'Active now', chartData: '0,25 20,28 40,30 60,32 80,35 100,38' }
      ],
      revenueData,
      quickStats: [
        { icon: 'feather icon-calendar', label: 'Orders This Week', value: String(totalOrders), change: 14 },
        { icon: 'feather icon-dollar-sign', label: 'Avg. Order Value', value: invoices.length ? `${(totalRevenue / invoices.length / 1000).toFixed(1)}K AED` : '0 AED', change: 8 },
        { icon: 'feather icon-clock', label: 'Pending POs', value: String(pendingPos), change: 0 },
        { icon: 'feather icon-file-text', label: 'Draft Invoices', value: String(draftInvoices), change: 0 }
      ],
      recentActivities,
      topDeals,
      performance,
      clientSegments
    }
  });
});
