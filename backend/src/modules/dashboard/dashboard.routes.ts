import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireAnyPermission } from '../../middleware/rbac.js';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', requireAuth, requireAnyPermission(['read:dashboard', 'manage:all']), async (req, res) => {
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
