import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { crudRouter } from './modules/crud/crud.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { erpRouter } from './modules/erp.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { sqiRouter } from './modules/sqi/sqi.routes.js';
import { pqiRouter } from './modules/pqi/pqi.routes.js';
import { inventoryRouter } from './modules/inventory/inventory.routes.js';
import { errorHandler, notFound } from './middleware/error.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok' } });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/sqi', sqiRouter);
app.use('/api/v1/pqi', pqiRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/erp', erpRouter);
app.use('/api/v1', crudRouter);

app.use(notFound);
app.use(errorHandler);
