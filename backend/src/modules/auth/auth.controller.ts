import { Request, Response } from 'express';
import { loginSchema, registerSchema } from './auth.schema.js';
import { login, logout, register, rotateRefreshToken } from './auth.service.js';
import { prisma } from '../../lib/prisma.js';
import { ok } from '../common/response.js';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax' as const,
  path: '/',
  domain: env.cookieDomain || undefined
};

export async function registerHandler(req: Request, res: Response) {
  const payload = registerSchema.parse(req.body);
  const result = await register(payload);
  res.status(201).json(ok({ id: result.user.id, email: result.user.email, orgId: result.org.id }));
}

export async function loginHandler(req: Request, res: Response) {
  const payload = loginSchema.parse(req.body);
  const result = await login(payload);

  res.cookie('accessToken', result.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', result.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.json(ok({
    user: {
      id: result.user.id,
      email: result.user.email,
      fullName: result.user.fullName,
      orgId: result.user.orgId
    }
  }));
}

export async function refreshHandler(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Refresh token missing' } });
    return;
  }

  const next = await rotateRefreshToken(refreshToken);
  res.cookie('accessToken', next.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', next.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json(ok({ refreshed: true }));
}

export async function logoutHandler(req: Request, res: Response) {
  await logout(req.cookies.refreshToken);
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  res.json(ok({ loggedOut: true }));
}

export async function meHandler(req: Request, res: Response) {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    return;
  }

  let auth: { sub: string };
  try {
    auth = jwt.verify(accessToken, env.accessSecret) as { sub: string };
  } catch {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    return;
  }
  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    include: {
      userRoles: {
        include: {
          role: { include: { rolePermissions: { include: { permission: true } } } }
        }
      }
    }
  });

  if (!user) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    return;
  }

  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((ur) =>
        ur.role.rolePermissions.map((rp) => `${rp.permission.action}:${rp.permission.resource}`)
      )
    )
  );

  res.json(ok({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    orgId: user.orgId,
    permissions
  }));
}
