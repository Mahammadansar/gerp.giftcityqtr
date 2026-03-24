import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAnyPermission } from '../middleware/rbac.js';

export const erpRouter = Router();

erpRouter.post('/quotations/:id/convert-to-invoice', requireAuth, requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const quotationId = String(req.params.id);
  const quotation = await prisma.quotation.findUnique({ where: { id: quotationId } });
  if (!quotation) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Quotation not found' } });
    return;
  }
  const lines = await prisma.quotationLine.findMany({ where: { quotationId } });

  const invoice = await prisma.invoice.create({
    data: {
      orgId: quotation.orgId,
      invoiceNo: `INV-${Date.now()}`,
      client: quotation.client,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount: quotation.amount,
      currency: quotation.currency,
      status: 'Draft',
      lines: {
        create: lines.map((line) => ({
          description: line.description,
          size: line.size,
          qty: line.qty,
          unitPrice: line.unitPrice,
          amount: line.amount
        }))
      }
    }
  });

  await prisma.quotation.update({ where: { id: quotation.id }, data: { status: 'Accepted' } });

  res.status(201).json({ data: invoice });
});

erpRouter.post('/purchase-orders/:id/approve', requireAuth, requireAnyPermission(['approve:purchaseOrder', 'manage:all']), async (req, res) => {
  const data = await prisma.purchaseOrder.update({ where: { id: String(req.params.id) }, data: { status: 'Approved' } });
  res.json({ data });
});

erpRouter.post('/purchase-orders/:id/reject', requireAuth, requireAnyPermission(['approve:purchaseOrder', 'manage:all']), async (req, res) => {
  const data = await prisma.purchaseOrder.update({ where: { id: String(req.params.id) }, data: { status: 'Rejected' } });
  res.json({ data });
});
