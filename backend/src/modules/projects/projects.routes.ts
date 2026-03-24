import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireAnyPermission } from '../../middleware/rbac.js';

const router = Router();

const timesheetCreateSchema = z.object({
  project: z.string().trim().min(1),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  hours: z.number().positive(),
  task: z.string().trim().min(1),
  billable: z.boolean().default(true)
});

const projectCreateSchema = z.object({
  project: z.string().trim().min(1),
  client: z.string().trim().min(1),
  revenue: z.number().nonnegative(),
  cost: z.number().nonnegative()
});

function getOrgId(req: AuthedRequest): string {
  if (!req.user?.orgId) throw new Error('Missing organization scope');
  return req.user.orgId;
}

router.use(requireAuth, requireAnyPermission(['read:projects', 'manage:all']));

router.get('/timesheets', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const rows = await prisma.timesheetEntry.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
  res.json({
    data: rows.map((r) => ({
      id: r.id,
      project: r.project,
      date: r.date,
      hours: r.hours,
      task: r.task,
      billable: r.billable
    }))
  });
});

router.post('/timesheets', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = timesheetCreateSchema.parse(req.body);
  const row = await prisma.timesheetEntry.create({
    data: {
      orgId,
      project: payload.project,
      date: new Date(payload.date),
      hours: payload.hours,
      task: payload.task,
      billable: payload.billable
    }
  });
  res.status(201).json({ data: row });
});

router.get('/profitability', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const projects = await prisma.project.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
  res.json({
    data: projects.map((p) => {
      const revenue = p.revenue ?? 0;
      const cost = p.cost ?? 0;
      const profit = revenue - cost;
      const margin = revenue > 0 ? `${Math.round((profit / revenue) * 100)}%` : '0%';
      return {
        id: p.id,
        project: p.name,
        client: p.client ?? '',
        revenue,
        cost,
        profit,
        margin
      };
    })
  });
});

router.post('/profitability', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = projectCreateSchema.parse(req.body);
  const row = await prisma.project.create({
    data: {
      orgId,
      name: payload.project,
      client: payload.client,
      revenue: payload.revenue,
      cost: payload.cost,
      status: 'Active'
    }
  });
  const revenue = row.revenue ?? 0;
  const cost = row.cost ?? 0;
  const profit = revenue - cost;
  const margin = revenue > 0 ? `${Math.round((profit / revenue) * 100)}%` : '0%';
  res.status(201).json({ data: { id: row.id, project: row.name, client: row.client ?? '', revenue, cost, profit, margin } });
});

export const projectsRouter = router;
