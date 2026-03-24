import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID, createHash } from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import type { SignOptions } from 'jsonwebtoken';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function signAccessToken(payload: { sub: string; orgId: string; email: string }): string {
  return jwt.sign(payload, env.accessSecret, { expiresIn: env.accessExpiry as SignOptions['expiresIn'] });
}

export function signRefreshToken(payload: { sub: string; orgId: string; email: string }): string {
  return jwt.sign(payload, env.refreshSecret, { expiresIn: env.refreshExpiry as SignOptions['expiresIn'] });
}

export async function register(data: { orgName: string; fullName: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email already registered');

  const passwordHash = await bcrypt.hash(data.password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({ data: { name: data.orgName, code: `ORG-${Date.now()}` } });

    const user = await tx.user.create({
      data: { orgId: org.id, fullName: data.fullName, email: data.email, passwordHash }
    });

    const superAdminRole = await tx.role.findFirst({ where: { orgId: org.id, name: 'super_admin' } });
    if (!superAdminRole) throw new Error('super_admin role not provisioned');

    await tx.userRole.create({ data: { userId: user.id, roleId: superAdminRole.id } });

    return { org, user };
  });

  return result;
}

export async function login(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email }, include: { organization: true } });
  if (!user || !user.isActive) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const payload = { sub: user.id, orgId: user.orgId, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tokenFamily: randomUUID()
    }
  });

  return { user, accessToken, refreshToken };
}

export async function rotateRefreshToken(token: string) {
  const payload = jwt.verify(token, env.refreshSecret) as { sub: string; orgId: string; email: string };
  const hashed = hashToken(token);

  const session = await prisma.session.findFirst({
    where: { userId: payload.sub, refreshTokenHash: hashed, revokedAt: null, expiresAt: { gt: new Date() } }
  });

  if (!session) throw new Error('Invalid refresh token');

  await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });

  const nextRefresh = signRefreshToken(payload);
  await prisma.session.create({
    data: {
      userId: payload.sub,
      refreshTokenHash: hashToken(nextRefresh),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tokenFamily: session.tokenFamily
    }
  });

  const accessToken = signAccessToken(payload);
  return { accessToken, refreshToken: nextRefresh, payload };
}

export async function logout(refreshToken?: string) {
  if (!refreshToken) return;
  const hashed = hashToken(refreshToken);
  await prisma.session.updateMany({ where: { refreshTokenHash: hashed, revokedAt: null }, data: { revokedAt: new Date() } });
}
