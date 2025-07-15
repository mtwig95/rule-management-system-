import express from 'express';
import {createRule, getRulesByTenant, updateRule, deleteRule, reorderRule} from '../controllers/rule.controller';

const router = express.Router();

router.get('/:tenantId', getRulesByTenant);

router.post('/', createRule);

router.put('/:id', updateRule);

router.delete('/:id', deleteRule);

router.post('/:id/reorder', reorderRule);

export default router;
