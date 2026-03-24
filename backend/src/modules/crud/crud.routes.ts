import { Router } from 'express';
import { createEntity, listEntity, removeEntity, updateEntity } from './crud.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireAnyPermission } from '../../middleware/rbac.js';

export const crudRouter = Router();

crudRouter.get('/:entity', requireAuth, requireAnyPermission(['read:erp', 'manage:all']), listEntity);
crudRouter.post('/:entity', requireAuth, requireAnyPermission(['write:erp', 'manage:all']), createEntity);
crudRouter.patch('/:entity/:id', requireAuth, requireAnyPermission(['write:erp', 'manage:all']), updateEntity);
crudRouter.delete('/:entity/:id', requireAuth, requireAnyPermission(['write:erp', 'manage:all']), removeEntity);
