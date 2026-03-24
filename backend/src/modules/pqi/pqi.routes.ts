import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireAnyPermission } from '../../middleware/rbac.js';

const router = Router();

const poStatus = ['Draft', 'Pending', 'Approved', 'Rejected', 'Received', 'Cancelled'] as const;

const poLineSchema = z.object({
  description: z.string().min(1),
  size: z.string().optional().default(''),
  qty: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  amount: z.number().nonnegative().optional()
});

const poCreateSchema = z.object({
  vendor: z.string().min(1),
  date: z.string(),
  deliveryDate: z.string().optional(),
  currency: z.string().min(1),
  notes: z.string().optional(),
  lines: z.array(poLineSchema).min(1)
});

const poStatusSchema = z.object({ status: z.enum(poStatus) });

function parseDate(v: string): Date {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date');
  return d;
}

function getOrgId(req: AuthedRequest): string {
  if (!req.user?.orgId) throw new Error('Missing organization scope');
  return req.user.orgId;
}

const transitions: Record<string, string[]> = {
  Draft: ['Pending', 'Cancelled'],
  Pending: ['Approved', 'Rejected', 'Cancelled'],
  Approved: ['Received', 'Cancelled'],
  Rejected: [],
  Received: [],
  Cancelled: []
};

function ensureTransition(current: string, next: string): void {
  if (!transitions[current]?.includes(next)) {
    throw new Error(`Invalid transition ${current} -> ${next}`);
  }
}

router.use(requireAuth);

router.get('/purchase-orders', requireAnyPermission(['read:purchasing', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const data = await prisma.purchaseOrder.findMany({ where: { orgId }, include: { lines: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data });
});

router.post('/purchase-orders', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = poCreateSchema.parse(req.body);

  const lines = payload.lines.map((l) => ({ ...l, amount: Number((l.qty * l.unitPrice).toFixed(2)) }));
  const total = Number(lines.reduce((s, l) => s + l.amount, 0).toFixed(2));
  const poCount = await prisma.purchaseOrder.count({ where: { orgId } });
  const poNo = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(4, '0')}`;

  const data = await prisma.purchaseOrder.create({
    data: {
      orgId,
      poNo,
      date: parseDate(payload.date),
      deliveryDate: payload.deliveryDate ? parseDate(payload.deliveryDate) : null,
      vendor: payload.vendor,
      items: lines.map((l) => l.description).slice(0, 3).join(', '),
      total,
      currency: payload.currency,
      status: 'Pending',
      notes: payload.notes,
      lines: { create: lines }
    },
    include: { lines: true }
  });

  res.status(201).json({ data });
});

router.patch('/purchase-orders/:id/status', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const id = String(req.params.id);
  const { status } = poStatusSchema.parse(req.body);

  const existing = await prisma.purchaseOrder.findFirst({ where: { id, orgId } });
  if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Purchase order not found' } });

  try { ensureTransition(existing.status, status); } catch (e) {
    return res.status(422).json({ error: { code: 'INVALID_TRANSITION', message: (e as Error).message } });
  }

  const data = await prisma.purchaseOrder.update({ where: { id }, data: { status } });
  res.json({ data });
});

router.patch('/purchase-orders/:id/approve', requireAnyPermission(['approve:purchaseOrder', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const id = String(req.params.id);
  const existing = await prisma.purchaseOrder.findFirst({ where: { id, orgId } });
  if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Purchase order not found' } });
  if (existing.status !== 'Pending') return res.status(422).json({ error: { code: 'INVALID_TRANSITION', message: 'Only Pending POs can be approved' } });
  const data = await prisma.purchaseOrder.update({ where: { id }, data: { status: 'Approved' } });
  res.json({ data });
});

router.patch('/purchase-orders/:id/reject', requireAnyPermission(['approve:purchaseOrder', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const id = String(req.params.id);
  const existing = await prisma.purchaseOrder.findFirst({ where: { id, orgId } });
  if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Purchase order not found' } });
  if (existing.status !== 'Pending') return res.status(422).json({ error: { code: 'INVALID_TRANSITION', message: 'Only Pending POs can be rejected' } });
  const data = await prisma.purchaseOrder.update({ where: { id }, data: { status: 'Rejected' } });
  res.json({ data });
});

router.get('/approvals', requireAnyPermission(['read:approvals', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const [pos, sos] = await Promise.all([
    prisma.purchaseOrder.findMany({ where: { orgId, status: { in: ['Pending', 'Approved', 'Rejected'] } }, orderBy: { date: 'desc' } }),
    prisma.salesOrder.findMany({ where: { orgId, status: { in: ['Draft', 'Confirmed', 'Delivered', 'Cancelled'] } }, orderBy: { date: 'desc' } })
  ]);

  const items = [
    ...pos.map((p) => ({
      type: 'Purchase Order',
      id: p.id,
      ref: p.poNo,
      requester: p.vendor,
      amount: p.total,
      currency: p.currency,
      date: p.date,
      status: p.status
    })),
    ...sos.map((s) => ({
      type: 'Sales Order',
      id: s.id,
      ref: s.orderNo,
      requester: s.client,
      amount: s.total,
      currency: s.currency,
      date: s.date,
      status: s.status === 'Draft' ? 'Pending' : s.status === 'Confirmed' || s.status === 'Delivered' ? 'Approved' : 'Rejected'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  res.json({ data: items });
});

export const pqiRouter = router;
