import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireAnyPermission } from '../../middleware/rbac.js';

const router = Router();

const quoteStatus = ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'] as const;
const invoiceStatus = ['Draft', 'Sent', 'PartiallyPaid', 'Paid', 'Overdue', 'Cancelled'] as const;
const salesStatus = ['Draft', 'Confirmed', 'Delivered', 'Cancelled'] as const;

const lineSchema = z.object({
  description: z.string().min(1),
  size: z.string().optional().default(''),
  qty: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  amount: z.number().nonnegative().optional()
});

const salesCreateSchema = z.object({
  client: z.string().min(1),
  items: z.string().min(1),
  total: z.number().nonnegative(),
  currency: z.string().min(1),
  date: z.string(),
  status: z.enum(salesStatus).optional()
});

const quotationCreateSchema = z.object({
  client: z.string().min(1),
  date: z.string(),
  validUntil: z.string(),
  currency: z.string().min(1),
  notes: z.string().optional(),
  lines: z.array(lineSchema).min(1)
});

const invoiceCreateSchema = z.object({
  client: z.string().min(1),
  date: z.string(),
  dueDate: z.string(),
  currency: z.string().min(1),
  taxPercent: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  lines: z.array(lineSchema).min(1)
});

const statusSchema = z.object({ status: z.string().min(1) });

function getOrgId(req: AuthedRequest): string {
  if (!req.user?.orgId) throw new Error('Missing organization scope');
  return req.user.orgId;
}

function parseDate(v: string): Date {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date value');
  return d;
}

function calculateAmount(lines: Array<{ qty: number; unitPrice: number }>, taxPercent?: number): number {
  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  const tax = taxPercent ? (subtotal * taxPercent) / 100 : 0;
  return Number((subtotal + tax).toFixed(2));
}

async function nextDocNo(tx: Prisma.TransactionClient, orgId: string, kind: 'SALES_ORDER' | 'QUOTATION' | 'INVOICE'): Promise<string> {
  const seq = await tx.documentSequence.upsert({
    where: { orgId_kind: { orgId, kind } },
    update: { currentValue: { increment: 1 } },
    create: { orgId, kind, currentValue: 1 }
  });
  const year = new Date().getFullYear();
  const num = String(seq.currentValue).padStart(4, '0');
  if (kind === 'SALES_ORDER') return `SO-${year}-${num}`;
  if (kind === 'QUOTATION') return `QT-GCQ-${year}-${num}`;
  return `INV-GCQ-${year}-${num}`;
}

function ensureTransition(current: string, next: string, allowed: Record<string, string[]>) {
  if (!allowed[current]?.includes(next)) {
    throw new Error(`Invalid transition ${current} -> ${next}`);
  }
}

const quoteTransitions: Record<string, string[]> = {
  Draft: ['Sent'],
  Sent: ['Accepted', 'Rejected', 'Expired'],
  Accepted: [],
  Rejected: [],
  Expired: []
};

const invoiceTransitions: Record<string, string[]> = {
  Draft: ['Sent', 'Cancelled'],
  Sent: ['PartiallyPaid', 'Paid', 'Overdue', 'Cancelled'],
  PartiallyPaid: ['Paid', 'Overdue', 'Cancelled'],
  Paid: [],
  Overdue: ['PartiallyPaid', 'Paid', 'Cancelled'],
  Cancelled: []
};

router.use(requireAuth, requireAnyPermission(['read:sales', 'read:finance', 'write:erp', 'manage:all']));

router.get('/sales-orders', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const data = await prisma.salesOrder.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
  res.json({ data });
});

router.post('/sales-orders', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = salesCreateSchema.parse(req.body);
  const data = await prisma.$transaction(async (tx) => {
    const orderNo = await nextDocNo(tx, orgId, 'SALES_ORDER');
    return tx.salesOrder.create({
      data: {
        orgId,
        orderNo,
        client: payload.client,
        items: payload.items,
        total: payload.total,
        currency: payload.currency,
        date: parseDate(payload.date),
        status: payload.status ?? 'Draft'
      }
    });
  });
  res.status(201).json({ data });
});

router.patch('/sales-orders/:id/status', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const { status } = statusSchema.parse(req.body);
  if (!salesStatus.includes(status as any)) return res.status(422).json({ error: { code: 'INVALID_STATUS', message: 'Invalid sales status' } });
  const id = String(req.params.id);
  const existing = await prisma.salesOrder.findFirst({ where: { id, orgId } });
  if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Sales order not found' } });
  const data = await prisma.salesOrder.update({ where: { id }, data: { status: status as any } });
  res.json({ data });
});

router.get('/quotations', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const data = await prisma.quotation.findMany({ where: { orgId }, include: { lines: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data });
});

router.post('/quotations', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = quotationCreateSchema.parse(req.body);
  const normalizedLines = payload.lines.map((l) => ({ ...l, amount: Number((l.qty * l.unitPrice).toFixed(2)) }));
  const amount = calculateAmount(normalizedLines);

  const data = await prisma.$transaction(async (tx) => {
    const quoteNo = await nextDocNo(tx, orgId, 'QUOTATION');
    return tx.quotation.create({
      data: {
        orgId,
        quoteNo,
        client: payload.client,
        date: parseDate(payload.date),
        validUntil: parseDate(payload.validUntil),
        amount,
        currency: payload.currency,
        status: 'Draft',
        notes: payload.notes,
        lines: { create: normalizedLines }
      },
      include: { lines: true }
    });
  });

  res.status(201).json({ data });
});

router.patch('/quotations/:id/status', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const { status } = statusSchema.parse(req.body);
  if (!quoteStatus.includes(status as any)) return res.status(422).json({ error: { code: 'INVALID_STATUS', message: 'Invalid quotation status' } });
  const id = String(req.params.id);
  const existing = await prisma.quotation.findFirst({ where: { id, orgId } });
  if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Quotation not found' } });

  try {
    ensureTransition(existing.status, status, quoteTransitions);
  } catch (e) {
    return res.status(422).json({ error: { code: 'INVALID_TRANSITION', message: (e as Error).message } });
  }

  const data = await prisma.quotation.update({ where: { id }, data: { status: status as any } });
  res.json({ data });
});

router.post('/quotations/:id/convert-to-invoice', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const id = String(req.params.id);
  const quotation = await prisma.quotation.findFirst({ where: { id, orgId }, include: { lines: true } });
  if (!quotation) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Quotation not found' } });

  if (!['Sent', 'Accepted'].includes(quotation.status)) {
    return res.status(422).json({ error: { code: 'INVALID_TRANSITION', message: 'Quotation must be Sent or Accepted before conversion' } });
  }

  const data = await prisma.$transaction(async (tx) => {
    const invoiceNo = await nextDocNo(tx, orgId, 'INVOICE');
    const invoice = await tx.invoice.create({
      data: {
        orgId,
        invoiceNo,
        client: quotation.client,
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: quotation.amount,
        currency: quotation.currency,
        status: 'Draft',
        notes: quotation.notes,
        lines: {
          create: quotation.lines.map((line) => ({
            description: line.description,
            size: line.size,
            qty: line.qty,
            unitPrice: line.unitPrice,
            amount: line.amount
          }))
        }
      },
      include: { lines: true }
    });

    await tx.quotation.update({ where: { id: quotation.id }, data: { status: 'Accepted' } });
    return invoice;
  });

  res.status(201).json({ data });
});

router.get('/invoices', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const data = await prisma.invoice.findMany({ where: { orgId }, include: { lines: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data });
});

router.post('/invoices', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = invoiceCreateSchema.parse(req.body);
  const normalizedLines = payload.lines.map((l) => ({ ...l, amount: Number((l.qty * l.unitPrice).toFixed(2)) }));
  const amount = calculateAmount(normalizedLines, payload.taxPercent ?? 0);

  const data = await prisma.$transaction(async (tx) => {
    const invoiceNo = await nextDocNo(tx, orgId, 'INVOICE');
    return tx.invoice.create({
      data: {
        orgId,
        invoiceNo,
        client: payload.client,
        date: parseDate(payload.date),
        dueDate: parseDate(payload.dueDate),
        amount,
        currency: payload.currency,
        status: 'Draft',
        taxPercent: payload.taxPercent ?? 0,
        notes: payload.notes,
        lines: { create: normalizedLines }
      },
      include: { lines: true }
    });
  });

  res.status(201).json({ data });
});

router.patch('/invoices/:id/status', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const { status } = statusSchema.parse(req.body);
  if (!invoiceStatus.includes(status as any)) return res.status(422).json({ error: { code: 'INVALID_STATUS', message: 'Invalid invoice status' } });
  const id = String(req.params.id);
  const existing = await prisma.invoice.findFirst({ where: { id, orgId } });
  if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found' } });

  try {
    ensureTransition(existing.status, status, invoiceTransitions);
  } catch (e) {
    return res.status(422).json({ error: { code: 'INVALID_TRANSITION', message: (e as Error).message } });
  }

  const data = await prisma.invoice.update({ where: { id }, data: { status: status as any } });
  res.json({ data });
});

export const sqiRouter = router;
