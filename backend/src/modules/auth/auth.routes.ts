import { Router } from 'express';
import { loginHandler, logoutHandler, meHandler, refreshHandler, registerHandler } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);
authRouter.post('/refresh', refreshHandler);
authRouter.post('/logout', logoutHandler);
authRouter.get('/me', meHandler);
