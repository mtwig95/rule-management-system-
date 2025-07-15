import express from 'express';
import {createRule, getRulesByTenant, updateRule} from '../controllers/rule.controller';

const router = express.Router();

router.get('/:tenantId', getRulesByTenant);

router.post('/', createRule);

router.put('/:id', updateRule);

export default router;
