import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireAnyPermission } from '../../middleware/rbac.js';

const router = Router();

const staffCreateSchema = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().min(1),
  department: z.string().trim().min(1),
  joinDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  email: z.string().email()
});

const leaveTypeCreateSchema = z.object({
  name: z.string().trim().min(1),
  daysPerYear: z.number().int().nonnegative(),
  carryOver: z.number().int().nonnegative(),
  description: z.string().trim().default('')
});

const leaveRequestCreateSchema = z.object({
  employee: z.string().trim().min(1),
  type: z.string().trim().min(1),
  from: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  to: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  days: z.number().int().positive()
});

const leaveStatusSchema = z.object({
  status: z.enum(['Approved', 'Rejected'])
});

function getOrgId(req: AuthedRequest): string {
  if (!req.user?.orgId) throw new Error('Missing organization scope');
  return req.user.orgId;
}

router.use(requireAuth, requireAnyPermission(['read:hr', 'manage:all']));

router.get('/staff', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const staff = await prisma.staff.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
  res.json({
    data: staff.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      department: s.department,
      joinDate: s.joinDate,
      email: s.email
    }))
  });
});

router.post('/staff', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = staffCreateSchema.parse(req.body);
  const staff = await prisma.staff.create({
    data: {
      orgId,
      name: payload.name,
      role: payload.role,
      department: payload.department,
      joinDate: new Date(payload.joinDate),
      email: payload.email
    }
  });
  res.status(201).json({ data: staff });
});

router.get('/leave-types', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const leaveTypes = await prisma.leaveType.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
  res.json({ data: leaveTypes });
});

router.post('/leave-types', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = leaveTypeCreateSchema.parse(req.body);
  const leaveType = await prisma.leaveType.create({
    data: {
      orgId,
      name: payload.name,
      daysPerYear: payload.daysPerYear,
      carryOver: payload.carryOver,
      description: payload.description
    }
  });
  res.status(201).json({ data: leaveType });
});

router.get('/leave-requests', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const requests = await prisma.leaveRequest.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
  res.json({
    data: requests.map((r) => ({
      id: r.id,
      employee: r.employee,
      type: r.type,
      from: r.fromDate,
      to: r.toDate,
      days: r.days,
      status: r.status
    }))
  });
});

router.post('/leave-requests', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = leaveRequestCreateSchema.parse(req.body);
  const request = await prisma.leaveRequest.create({
    data: {
      orgId,
      employee: payload.employee,
      type: payload.type,
      fromDate: new Date(payload.from),
      toDate: new Date(payload.to),
      days: payload.days,
      status: 'Pending'
    }
  });
  res.status(201).json({
    data: {
      id: request.id,
      employee: request.employee,
      type: request.type,
      from: request.fromDate,
      to: request.toDate,
      days: request.days,
      status: request.status
    }
  });
});

router.patch('/leave-requests/:id/status', requireAnyPermission(['write:erp', 'manage:all']), async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const requestId = String(req.params.id);
  const { status } = leaveStatusSchema.parse(req.body);

  const existing = await prisma.leaveRequest.findFirst({ where: { id: requestId, orgId } });
  if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Leave request not found' } });
  if (existing.status !== 'Pending') {
    return res.status(400).json({ error: { code: 'INVALID_STATUS_TRANSITION', message: 'Only pending requests can be updated' } });
  }

  const request = await prisma.leaveRequest.update({
    where: { id: existing.id },
    data: { status }
  });

  res.json({
    data: {
      id: request.id,
      employee: request.employee,
      type: request.type,
      from: request.fromDate,
      to: request.toDate,
      days: request.days,
      status: request.status
    }
  });
});

export const hrRouter = router;
