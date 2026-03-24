import { Router } from 'express';
import { createEntity, listEntity, removeEntity, updateEntity } from './crud.controller.js';

export const crudRouter = Router();

crudRouter.get('/:entity', listEntity);
crudRouter.post('/:entity', createEntity);
crudRouter.patch('/:entity/:id', updateEntity);
crudRouter.delete('/:entity/:id', removeEntity);
