import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import type { AuthedRequest } from '../../middleware/auth.js';
import { DocumentKind } from '@prisma/client';
import { hasPermission, resolvePermissions } from '../../middleware/rbac.js';

const modelMap: Record<string, keyof typeof prisma> = {
  customers: 'customer',
  suppliers: 'supplier',
  quotations: 'quotation',
  invoices: 'invoice',
  purchaseOrders: 'purchaseOrder',
  inventoryItems: 'inventoryItem',
  assets: 'asset',
  staff: 'staff',
  leaveRequests: 'leaveRequest',
  projects: 'project',
  timesheets: 'timesheetEntry',
  creditNotes: 'creditNote',
  damageEntries: 'damageEntry',
  bankEntries: 'bankEntry',
  chatMessages: 'chatMessage'
};

const readPermissionByEntity: Record<string, string> = {
  customers: 'read:settings',
  suppliers: 'read:purchasing',
  quotations: 'read:sales',
  invoices: 'read:finance',
  purchaseOrders: 'read:purchasing',
  inventoryItems: 'read:inventory',
  assets: 'read:settings',
  staff: 'read:hr',
  leaveRequests: 'read:hr',
  projects: 'read:projects',
  timesheets: 'read:projects',
  creditNotes: 'read:finance',
  damageEntries: 'read:inventory',
  bankEntries: 'read:finance',
  chatMessages: 'read:projects'
};

const writePermissionByEntity: Record<string, string> = {
  customers: 'write:settings',
  suppliers: 'write:purchasing',
  quotations: 'write:sales',
  invoices: 'write:finance',
  purchaseOrders: 'write:purchasing',
  inventoryItems: 'write:inventory',
  assets: 'write:settings',
  staff: 'write:hr',
  leaveRequests: 'write:hr',
  projects: 'write:projects',
  timesheets: 'write:projects',
  creditNotes: 'write:finance',
  damageEntries: 'write:inventory',
  bankEntries: 'write:finance',
  chatMessages: 'write:projects'
};

function getRepo(entity: string): any {
  const key = modelMap[entity];
  if (!key) throw new Error('Unsupported entity');
  return (prisma as any)[key];
}

async function nextDocNo(orgId: string, kind: DocumentKind): Promise<string> {
  const seq = await prisma.documentSequence.upsert({
    where: { orgId_kind: { orgId, kind } },
    update: { currentValue: { increment: 1 } },
    create: { orgId, kind, currentValue: 1 }
  });
  const n = String(seq.currentValue).padStart(3, '0');
  if (kind === 'CREDIT_NOTE') return `CN-GCQ-${new Date().getFullYear()}-${n}`;
  if (kind === 'DAMAGE_ENTRY') return `DMG-${new Date().getFullYear()}-${n}`;
  return n;
}

export async function listEntity(req: Request, res: Response) {
  const entity = String(req.params.entity);
  const repo = getRepo(entity);
  const user = (req as AuthedRequest).user;
  const orgId = user?.orgId;
  if (!orgId) throw new Error('Missing organization scope');
  const permissions = await resolvePermissions(String(user.sub));
  const requiredPermission = readPermissionByEntity[entity];
  if (!requiredPermission || !hasPermission(permissions, requiredPermission)) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Missing required permission' } });
  }
  const include = entity === 'quotations' || entity === 'invoices' || entity === 'purchaseOrders' ? { lines: true } : undefined;
  const data = await repo.findMany({ where: { orgId }, include, orderBy: { createdAt: 'desc' } });
  res.json({ data });
}

export async function createEntity(req: Request, res: Response) {
  const entity = String(req.params.entity);
  const repo = getRepo(entity);
  const user = (req as AuthedRequest).user;
  const orgId = user?.orgId;
  if (!orgId) throw new Error('Missing organization scope');
  const permissions = await resolvePermissions(String(user.sub));
  const requiredPermission = writePermissionByEntity[entity];
  if (!requiredPermission || !hasPermission(permissions, requiredPermission)) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Missing required permission' } });
  }
  let payload = req.body;

  if (entity === 'quotations' && Array.isArray(req.body.lines)) {
    const { lines, ...rest } = req.body;
    payload = { ...rest, lines: { create: lines } };
  } else if (entity === 'invoices' && Array.isArray(req.body.lines)) {
    const { lines, ...rest } = req.body;
    payload = { ...rest, lines: { create: lines } };
  } else if (entity === 'purchaseOrders' && Array.isArray(req.body.lines)) {
    const { lines, ...rest } = req.body;
    payload = { ...rest, lines: { create: lines } };
  } else if (entity === 'leaveRequests') {
    payload = {
      ...req.body,
      fromDate: req.body.fromDate ?? req.body.from,
      toDate: req.body.toDate ?? req.body.to
    };
    delete payload.from;
    delete payload.to;
  } else if (entity === 'creditNotes') {
    payload = {
      ...req.body,
      cnNo: req.body.cnNo || (await nextDocNo(orgId, 'CREDIT_NOTE')),
      date: req.body.date ? new Date(req.body.date) : new Date()
    };
  } else if (entity === 'damageEntries') {
    payload = {
      ...req.body,
      refNo: req.body.refNo || (await nextDocNo(orgId, 'DAMAGE_ENTRY')),
      date: req.body.date ? new Date(req.body.date) : new Date()
    };
  } else if (entity === 'bankEntries') {
    payload = {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : new Date()
    };
  } else if (entity === 'assets') {
    payload = {
      ...req.body,
      purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : new Date()
    };
  }
  payload = { ...payload, orgId };

  const data = await repo.create({ data: payload });
  res.status(201).json({ data });
}

export async function updateEntity(req: Request, res: Response) {
  const entity = String(req.params.entity);
  const repo = getRepo(entity);
  const user = (req as AuthedRequest).user;
  const orgId = user?.orgId;
  if (!orgId) throw new Error('Missing organization scope');
  const permissions = await resolvePermissions(String(user.sub));
  const requiredPermission = writePermissionByEntity[entity];
  if (!requiredPermission || !hasPermission(permissions, requiredPermission)) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Missing required permission' } });
  }
  const id = String(req.params.id);
  const existing = await repo.findFirst({ where: { id, orgId } });
  if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Record not found' } });
  const data = await repo.update({ where: { id }, data: req.body });
  res.json({ data });
}

export async function removeEntity(req: Request, res: Response) {
  const entity = String(req.params.entity);
  const repo = getRepo(entity);
  const user = (req as AuthedRequest).user;
  const orgId = user?.orgId;
  if (!orgId) throw new Error('Missing organization scope');
  const permissions = await resolvePermissions(String(user.sub));
  const requiredPermission = writePermissionByEntity[entity];
  if (!requiredPermission || !hasPermission(permissions, requiredPermission)) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Missing required permission' } });
  }
  const id = String(req.params.id);
  const existing = await repo.findFirst({ where: { id, orgId } });
  if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Record not found' } });
  await repo.delete({ where: { id } });
  res.status(204).send();
}
