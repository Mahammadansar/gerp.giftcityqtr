import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

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
  timesheets: 'timesheetEntry'
};

function getRepo(entity: string): any {
  const key = modelMap[entity];
  if (!key) throw new Error('Unsupported entity');
  return (prisma as any)[key];
}

export async function listEntity(req: Request, res: Response) {
  const entity = String(req.params.entity);
  const repo = getRepo(entity);
  const orgId = String(req.query.orgId || '');
  const include = entity === 'quotations' || entity === 'invoices' || entity === 'purchaseOrders' ? { lines: true } : undefined;
  const data = await repo.findMany({ where: orgId ? { orgId } : {}, include, orderBy: { createdAt: 'desc' } });
  res.json({ data });
}

export async function createEntity(req: Request, res: Response) {
  const entity = String(req.params.entity);
  const repo = getRepo(entity);
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
  }

  const data = await repo.create({ data: payload });
  res.status(201).json({ data });
}

export async function updateEntity(req: Request, res: Response) {
  const repo = getRepo(String(req.params.entity));
  const data = await repo.update({ where: { id: req.params.id }, data: req.body });
  res.json({ data });
}

export async function removeEntity(req: Request, res: Response) {
  const repo = getRepo(String(req.params.entity));
  await repo.delete({ where: { id: req.params.id } });
  res.status(204).send();
}
