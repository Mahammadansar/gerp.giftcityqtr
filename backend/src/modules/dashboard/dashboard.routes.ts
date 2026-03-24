import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', async (req, res) => {
  const orgId = String(req.query.orgId || '');

  const [invoiceTotal, pendingPo, inventoryCount] = await Promise.all([
    prisma.invoice.aggregate({ _sum: { amount: true }, where: orgId ? { orgId } : {} }),
    prisma.purchaseOrder.count({ where: { ...(orgId ? { orgId } : {}), status: 'Pending' } }),
    prisma.inventoryItem.count({ where: orgId ? { orgId } : {} })
  ]);

  res.json({
    data: {
      invoiceAmount: invoiceTotal._sum.amount ?? 0,
      pendingPurchaseOrders: pendingPo,
      inventoryItems: inventoryCount
    }
  });
});
