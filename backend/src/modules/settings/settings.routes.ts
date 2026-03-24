import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireAnyPermission } from '../../middleware/rbac.js';

const router = Router();

const companySchema = z.object({
  companyName: z.string().trim().min(1),
  currency: z.string().trim().min(1)
});

function getOrgId(req: AuthedRequest): string {
  if (!req.user?.orgId) throw new Error('Missing organization scope');
  return req.user.orgId;
}

router.get('/company', requireAuth, requireAnyPermission(['read:settings', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const row = await prisma.appSetting.findUnique({ where: { orgId } });
  res.json({
    data: row
      ? { companyName: row.companyName, currency: row.currency }
      : { companyName: 'Gift City Qatar', currency: 'AED' }
  });
});

router.put('/company', requireAuth, requireAnyPermission(['write:settings', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = companySchema.parse(req.body);
  const row = await prisma.appSetting.upsert({
    where: { orgId },
    update: { companyName: payload.companyName, currency: payload.currency },
    create: { orgId, companyName: payload.companyName, currency: payload.currency }
  });
  res.json({ data: { companyName: row.companyName, currency: row.currency } });
});

export const settingsRouter = router;
