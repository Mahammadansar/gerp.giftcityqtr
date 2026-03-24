import { Router } from 'express';
import { createEntity, listEntity, removeEntity, updateEntity } from './crud.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const crudRouter = Router();

crudRouter.get('/:entity', requireAuth, listEntity);
crudRouter.post('/:entity', requireAuth, createEntity);
crudRouter.patch('/:entity/:id', requireAuth, updateEntity);
crudRouter.delete('/:entity/:id', requireAuth, removeEntity);
