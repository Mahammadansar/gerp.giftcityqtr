import { z } from 'zod';

export const registerSchema = z.object({
  orgName: z.string().min(2),
  fullName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8)
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});
