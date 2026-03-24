import dotenv from 'dotenv';

dotenv.config();

function mustGet(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: mustGet('DATABASE_URL'),
  accessSecret: mustGet('JWT_ACCESS_SECRET'),
  refreshSecret: mustGet('JWT_REFRESH_SECRET'),
  accessExpiry: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
  cookieDomain: process.env.COOKIE_DOMAIN ?? ''
};
