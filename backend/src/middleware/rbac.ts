import { NextFunction, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthedRequest } from './auth.js';

export function requirePermission(permissionKey: string) {
  return async (req: AuthedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const roles = await prisma.userRole.findMany({
      where: { userId: req.user.sub },
      include: { role: { include: { rolePermissions: { include: { permission: true } } } } }
    });

    const permissions = new Set(
      roles.flatMap((r) => r.role.rolePermissions.map((rp) => `${rp.permission.action}:${rp.permission.resource}`))
    );

    if (!permissions.has(permissionKey)) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: `Missing permission: ${permissionKey}` } });
      return;
    }

    next();
  };
}
