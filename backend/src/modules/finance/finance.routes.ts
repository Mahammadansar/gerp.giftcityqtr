import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireAnyPermission } from '../../middleware/rbac.js';
import { z } from 'zod';

const router = Router();

function getOrgId(req: AuthedRequest): string {
  if (!req.user?.orgId) throw new Error('Missing organization scope');
  return req.user.orgId;
}

router.use(requireAuth, requireAnyPermission(['read:finance', 'manage:all']));

const createRetainerSchema = z.object({
  client: z.string().trim().min(1),
  amount: z.number().finite().nonnegative(),
  currency: z.string().trim().min(1),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  status: z.string().trim().min(1).default('Active')
});

router.get('/overview', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const [pos, inv, retainers] = await Promise.all([
    prisma.purchaseOrder.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } }),
    prisma.invoice.findMany({ where: { orgId } }),
    prisma.retainer.findMany({ where: { orgId }, orderBy: { startDate: 'desc' } })
  ]);

  const vendorBills = pos.map((po) => ({
    ref: po.poNo,
    vendor: po.vendor,
    date: po.date,
    dueDate: po.deliveryDate ?? po.date,
    amount: po.total,
    currency: po.currency,
    status: po.status
  }));

  const paid = inv.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const pending = inv.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0);
  const out = pos.filter((p) => p.status === 'Approved' || p.status === 'Received').reduce((s, p) => s + p.total, 0);

  const cashflowMonths = [
    { month: 'Current', inflow: paid, outflow: out },
    { month: 'Expected', inflow: paid + pending, outflow: out + pos.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.total, 0) }
  ];

  res.json({
    data: {
      vendorBills,
      retainers,
      cashflowMonths,
      currencies: [
        { code: 'AED', name: 'UAE Dirham', rate: 1 },
        { code: 'USD', name: 'US Dollar', rate: 0.27 },
        { code: 'EUR', name: 'Euro', rate: 0.25 }
      ]
    }
  });
});

router.post('/retainers', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = createRetainerSchema.parse(req.body);
  const retainer = await prisma.retainer.create({
    data: {
      orgId,
      client: payload.client,
      amount: payload.amount,
      currency: payload.currency,
      startDate: new Date(payload.startDate),
      status: payload.status
    }
  });
  res.status(201).json({ data: retainer });
});

router.get('/balance-sheet', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const [inv, pos, assetsList, inventory] = await Promise.all([
    prisma.invoice.findMany({ where: { orgId } }),
    prisma.purchaseOrder.findMany({ where: { orgId } }),
    prisma.asset.findMany({ where: { orgId } }),
    prisma.inventoryItem.findMany({ where: { orgId } })
  ]);

  const receivables = inv.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0);
  const fixedAssets = assetsList.reduce((s, a) => s + a.value, 0);
  const invValue = inventory.reduce((s, i) => s + i.qty * 10, 0);
  const payables = pos.filter((p) => p.status !== 'Received').reduce((s, p) => s + p.total, 0);

  const assets = [
    { label: 'Cash and Bank', amount: 0 },
    { label: 'Accounts Receivable', amount: receivables },
    { label: 'Inventory', amount: invValue },
    { label: 'Fixed Assets', amount: fixedAssets }
  ];
  const liabilities = [{ label: 'Accounts Payable', amount: payables }];
  const totalAssets = assets.reduce((s, x) => s + x.amount, 0);
  const totalLiabilities = liabilities.reduce((s, x) => s + x.amount, 0);
  const equityAmount = Math.max(0, totalAssets - totalLiabilities);

  res.json({
    data: {
      asOfDate: new Date().toISOString().slice(0, 10),
      assets,
      liabilities,
      equity: [{ label: "Owner's Equity", amount: equityAmount }],
      totalAssets,
      totalLiabilitiesAndEquity: totalLiabilities + equityAmount
    }
  });
});

router.get('/profit-loss', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const [inv, pos] = await Promise.all([
    prisma.invoice.findMany({ where: { orgId } }),
    prisma.purchaseOrder.findMany({ where: { orgId } })
  ]);
  const sales = inv.reduce((s, i) => s + i.amount, 0);
  const cogs = pos.filter((p) => p.status === 'Received').reduce((s, p) => s + p.total, 0) * 0.7;
  const revenue = [
    { label: 'Sales', amount: sales },
    { label: 'Other Income', amount: Math.max(0, Math.round(sales * 0.02)) }
  ];
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
  const expenses = [
    { label: 'Cost of Goods Sold', amount: Math.round(cogs) },
    { label: 'Operating', amount: Math.round(totalRevenue * 0.1) },
    { label: 'Other', amount: Math.round(totalRevenue * 0.02) }
  ];
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  res.json({ data: { period: new Date().toISOString().slice(0, 7), revenue, expenses, totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses } });
});

router.get('/cash-flow', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const [inv, pos, assets] = await Promise.all([
    prisma.invoice.findMany({ where: { orgId } }),
    prisma.purchaseOrder.findMany({ where: { orgId } }),
    prisma.asset.findMany({ where: { orgId } })
  ]);

  const fromCustomers = inv.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const toSuppliers = pos.filter((p) => p.status === 'Received').reduce((s, p) => s + p.total, 0);

  const operating = [
    { label: 'Cash from customers', amount: fromCustomers },
    { label: 'Cash to suppliers', amount: -toSuppliers }
  ];
  const investing = [{ label: 'Equipment / assets', amount: -assets.reduce((s, a) => s + Math.round(a.value * 0.1), 0) }];
  const financing = [{ label: 'Net financing', amount: 0 }];
  const netOperating = operating.reduce((s, x) => s + x.amount, 0);
  const netInvesting = investing.reduce((s, x) => s + x.amount, 0);
  const netFinancing = 0;
  const netChange = netOperating + netInvesting + netFinancing;
  const openingBalance = Math.max(0, fromCustomers - toSuppliers - netChange);

  res.json({
    data: {
      period: new Date().toISOString().slice(0, 7),
      operating,
      investing,
      financing,
      netOperating,
      netInvesting,
      netFinancing,
      netChange,
      openingBalance,
      closingBalance: openingBalance + netChange
    }
  });
});

router.get('/ledgers/customers', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const invoices = await prisma.invoice.findMany({ where: { orgId } });
  const byClient = new Map<string, { sales: number; paid: number }>();
  for (const inv of invoices) {
    const c = byClient.get(inv.client) || { sales: 0, paid: 0 };
    c.sales += inv.amount;
    if (inv.status === 'Paid') c.paid += inv.amount;
    byClient.set(inv.client, c);
  }
  const customers = Array.from(byClient.entries()).map(([name, v]) => ({ name, opening: 0, sales: v.sales, receipts: v.paid, balance: v.sales - v.paid }));
  res.json({ data: customers });
});

router.get('/ledgers/suppliers', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const pos = await prisma.purchaseOrder.findMany({ where: { orgId } });
  const byVendor = new Map<string, { purchases: number; paid: number }>();
  for (const p of pos) {
    const v = byVendor.get(p.vendor) || { purchases: 0, paid: 0 };
    v.purchases += p.total;
    if (p.status === 'Received' || p.status === 'Approved') v.paid += p.total;
    byVendor.set(p.vendor, v);
  }
  const suppliers = Array.from(byVendor.entries()).map(([name, v]) => ({ name, opening: 0, purchases: v.purchases, payments: v.paid, balance: v.purchases - v.paid }));
  res.json({ data: suppliers });
});

export const financeRouter = router;
