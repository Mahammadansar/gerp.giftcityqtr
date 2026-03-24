import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireAnyPermission } from '../../middleware/rbac.js';

const router = Router();

const createItemSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  size: z.string().optional(),
  qty: z.number().int().nonnegative(),
  unit: z.string().min(1),
  reorderLevel: z.number().int().nonnegative()
});

const adjustSchema = z.object({
  movementType: z.enum(['IN', 'OUT', 'ADJUST']),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
  reference: z.string().optional()
});

function getOrgId(req: AuthedRequest): string {
  if (!req.user?.orgId) throw new Error('Missing organization scope');
  return req.user.orgId;
}

function computeStockStatus(qty: number, reorderLevel: number): string {
  return qty <= reorderLevel ? 'Low Stock' : 'In Stock';
}

router.use(requireAuth);

router.get('/items', requireAnyPermission(['read:inventory', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const data = await prisma.inventoryItem.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
  res.json({ data });
});

router.post('/items', requireAnyPermission(['write:inventory', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = createItemSchema.parse(req.body);

  const status = computeStockStatus(payload.qty, payload.reorderLevel);
  const data = await prisma.inventoryItem.create({
    data: {
      orgId,
      sku: payload.sku,
      name: payload.name,
      category: payload.category,
      size: payload.size,
      qty: payload.qty,
      unit: payload.unit,
      reorderLevel: payload.reorderLevel,
      status
    }
  });

  res.status(201).json({ data });
});

router.patch('/items/:id/adjust', requireAnyPermission(['write:inventory', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const id = String(req.params.id);
  const payload = adjustSchema.parse(req.body);

  const item = await prisma.inventoryItem.findFirst({ where: { id, orgId } });
  if (!item) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Inventory item not found' } });
  }

  let nextQty = item.qty;
  if (payload.movementType === 'IN') nextQty = item.qty + payload.quantity;
  if (payload.movementType === 'OUT') nextQty = item.qty - payload.quantity;
  if (payload.movementType === 'ADJUST') nextQty = payload.quantity;

  if (nextQty < 0) {
    return res.status(422).json({ error: { code: 'INVALID_QUANTITY', message: 'Quantity cannot be negative' } });
  }

  const status = computeStockStatus(nextQty, item.reorderLevel);
  const data = await prisma.inventoryItem.update({ where: { id }, data: { qty: nextQty, status } });

  res.json({ data });
});

export const inventoryRouter = router;
