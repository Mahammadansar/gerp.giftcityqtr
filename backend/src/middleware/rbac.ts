import { NextFunction, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthedRequest } from './auth.js';

export async function resolvePermissions(userId: string): Promise<Set<string>> {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } }
  });

  return new Set(
    roles.flatMap((r) => r.role.rolePermissions.map((rp) => `${rp.permission.action}:${rp.permission.resource}`))
  );
}

export function hasPermission(permissions: Set<string>, required: string): boolean {
  if (permissions.has('manage:all') || permissions.has(required)) return true;
  if (required.startsWith('read:')) {
    const resource = required.slice(5);
    if (permissions.has(`write:${resource}`)) return true;
  }
  return false;
}

export function requirePermission(permissionKey: string) {
  return async (req: AuthedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const permissions = await resolvePermissions(req.user.sub);

    if (!hasPermission(permissions, permissionKey)) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: `Missing permission: ${permissionKey}` } });
      return;
    }

    next();
  };
}

export function requireAnyPermission(permissionKeys: string[]) {
  return async (req: AuthedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const permissions = await resolvePermissions(req.user.sub);
    const allowed = permissionKeys.some((key) => hasPermission(permissions, key));

    if (!allowed) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: `Missing required permission` } });
      return;
    }

    next();
  };
}
