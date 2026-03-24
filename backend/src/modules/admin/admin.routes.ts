import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireAnyPermission } from '../../middleware/rbac.js';

const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  roleId: z.string().min(1)
});

const createRoleSchema = z.object({
  name: z.string().min(2),
  permissionIds: z.array(z.string()).default([])
});

const updateUserRoleSchema = z.object({
  roleId: z.string().min(1)
});

const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string())
});

function getOrgId(req: AuthedRequest): string {
  if (!req.user?.orgId) {
    throw new Error('Organization missing from token');
  }
  return req.user.orgId;
}

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAnyPermission(['manage:users', 'manage:all']));

adminRouter.get('/permissions', async (_req, res) => {
  const permissions = await prisma.permission.findMany({ orderBy: [{ resource: 'asc' }, { action: 'asc' }] });
  res.json({
    data: permissions.map((p) => ({
      ...p,
      module: p.resource,
      access: p.action
    }))
  });
});

adminRouter.get('/roles', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const roles = await prisma.role.findMany({
    where: { orgId },
    include: {
      rolePermissions: {
        include: { permission: true }
      },
      _count: { select: { userRoles: true } }
    },
    orderBy: { name: 'asc' }
  });

  res.json({
    data: roles.map((r) => ({
      id: r.id,
      name: r.name,
      users: r._count.userRoles,
      permissions: r.rolePermissions.map((rp) => rp.permission)
    }))
  });
});

adminRouter.post('/roles', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = createRoleSchema.parse(req.body);

  const role = await prisma.$transaction(async (tx) => {
    const created = await tx.role.create({ data: { orgId, name: payload.name } });

    if (payload.permissionIds.length) {
      await tx.rolePermission.createMany({
        data: payload.permissionIds.map((permissionId) => ({ roleId: created.id, permissionId })),
        skipDuplicates: true
      });
    }

    return created;
  });

  res.status(201).json({ data: role });
});

adminRouter.patch('/roles/:id/permissions', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const roleId = String(req.params.id);
  const payload = updateRolePermissionsSchema.parse(req.body);

  const role = await prisma.role.findFirst({ where: { id: roleId, orgId } });
  if (!role) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Role not found' } });
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { roleId } });
    if (payload.permissionIds.length) {
      await tx.rolePermission.createMany({
        data: payload.permissionIds.map((permissionId) => ({ roleId, permissionId })),
        skipDuplicates: true
      });
    }
  });

  res.json({ data: { roleId, permissionIds: payload.permissionIds } });
});

adminRouter.get('/users', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const users = await prisma.user.findMany({
    where: { orgId },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    data: users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      isActive: u.isActive,
      roles: u.userRoles.map((ur) => ({ id: ur.role.id, name: ur.role.name }))
    }))
  });
});

adminRouter.post('/users', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const payload = createUserSchema.parse(req.body);

  const role = await prisma.role.findFirst({ where: { id: payload.roleId, orgId } });
  if (!role) {
    res.status(400).json({ error: { code: 'INVALID_ROLE', message: 'Role does not belong to organization' } });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'Email already exists' } });
    return;
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        orgId,
        fullName: payload.fullName,
        email: payload.email,
        passwordHash
      }
    });

    await tx.userRole.create({ data: { userId: created.id, roleId: payload.roleId } });
    return created;
  });

  res.status(201).json({ data: { id: user.id, fullName: user.fullName, email: user.email, roleId: payload.roleId } });
});

adminRouter.patch('/users/:id/role', async (req, res) => {
  const orgId = getOrgId(req as AuthedRequest);
  const userId = String(req.params.id);
  const payload = updateUserRoleSchema.parse(req.body);

  const user = await prisma.user.findFirst({ where: { id: userId, orgId } });
  if (!user) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    return;
  }

  const role = await prisma.role.findFirst({ where: { id: payload.roleId, orgId } });
  if (!role) {
    res.status(400).json({ error: { code: 'INVALID_ROLE', message: 'Role does not belong to organization' } });
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId } });
    await tx.userRole.create({ data: { userId, roleId: payload.roleId } });
  });

  res.json({ data: { userId, roleId: payload.roleId } });
});
