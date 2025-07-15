import {Request, Response} from 'express';
import {RuleModel} from '../models/rule.model';
import {AppError} from '../middlewares/errorHandler';

export const getRulesByTenant = async (req: Request, res: Response) => {
    try {
        const tenantId = req.params.tenantId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        if (!tenantId) {
            const error = new Error('Missing tenantId') as AppError;
            error.statusCode = 400;
            error.field = 'tenantId';
            throw error;
        }

        const query = {tenantId};

        const total = await RuleModel.countDocuments(query);
        const rules = await RuleModel.find(query)
            .sort({ruleIndex: -1})
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            data: rules, total, page, limit,
        });
    } catch (error: any) {
        console.error('Error fetching rules:', error);
        throw error.statusCode ? error : Object.assign(new Error('Internal Server Error'), {statusCode: 500});
    }
};

export const createRule = async (req: Request, res: Response) => {
    try {
        const {tenantId, source, destination, action, name} = req.body;

        if (!tenantId || !source || !destination || !action) {
            const error = new Error('Missing required fields') as AppError;
            error.statusCode = 400;
            throw error;
        }

        const lastRule = await RuleModel.findOne({tenantId})
            .sort({ruleIndex: -1});

        const maxIndex = lastRule ? lastRule.ruleIndex : 0;

        const newRule = await RuleModel.create({
            tenantId, name, source, destination, action, ruleIndex: maxIndex + 100,
        });

        res.status(201).json(newRule);
    } catch (error: any) {
        console.error('Error creating rule:', error);
        if (error.code === 11000) {
            const conflictError = new Error('Duplicate ruleIndex') as AppError;
            conflictError.statusCode = 409;
            throw conflictError;
        }

        throw error.statusCode ? error : Object.assign(new Error('Internal Server Error'), {statusCode: 500});
    }
};

export const updateRule = async (req: Request, res: Response) => {
    try {
        const ruleId = req.params.id;
        const {tenantId, source, destination, action} = req.body;

        if (!ruleId) {
            throw Object.assign(new Error('Missing rule ID'), {statusCode: 400});
        }

        if (!tenantId) {
            throw Object.assign(new Error('Missing tenantId'), {statusCode: 400});
        }

        const rule = await RuleModel.findById(ruleId);
        if (!rule) {
            throw Object.assign(new Error('Rule not found'), {statusCode: 404});
        }

        if (rule.ruleIndex === 0) {
            throw Object.assign(new Error('Cleanup rule cannot be edited'), {statusCode: 403});
        }

        if (rule.tenantId !== tenantId) {
            throw Object.assign(new Error('Access denied to this rule'), {statusCode: 403});
        }

        rule.source = source ?? rule.source;
        rule.destination = destination ?? rule.destination;
        rule.action = action ?? rule.action;

        await rule.save();

        res.json(rule);
    } catch (error: any) {
        console.error('Error updating rule:', error);
        throw error.statusCode ? error : Object.assign(new Error('Internal Server Error'), {statusCode: 500});
    }
};

export const deleteRule = async (req: Request, res: Response) => {
    try {
        const deleted = await RuleModel.findByIdAndDelete(req.params.id);
        if (!deleted) {
            const error = new Error('Rule not found') as AppError;
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({message: 'Rule deleted'});
    } catch (error: any) {
        console.error('Error deleting rule:', error);
        throw error.statusCode ? error : Object.assign(new Error('Internal Server Error'), {statusCode: 500});
    }
};

export const reorderRule = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {beforeId, afterId} = req.body;

        const rule = await RuleModel.findById(id);
        if (!rule) {
            const err = new Error('Rule not found') as AppError;
            err.statusCode = 404;
            throw err;
        }

        let beforeRuleIndex = 0;
        let afterRuleIndex = 0;

        if (beforeId) {
            const beforeRule = await RuleModel.findById(beforeId);
            if (!beforeRule) {
                const err = new Error('beforeId not found') as AppError;
                err.statusCode = 400;
                throw err;
            }
            beforeRuleIndex = beforeRule.ruleIndex;
        }

        if (afterId) {
            const afterRule = await RuleModel.findById(afterId);
            if (!afterRule) {
                const err = new Error('afterId not found') as AppError;
                err.statusCode = 400;
                throw err;
            }
            afterRuleIndex = afterRule.ruleIndex;
        }

        let newIndex: number;

        if (beforeRuleIndex !== null && afterRuleIndex !== null) {
            newIndex = (beforeRuleIndex + afterRuleIndex) / 2;
        } else if (beforeRuleIndex !== null) {
            newIndex = beforeRuleIndex + 100;
        } else if (afterRuleIndex !== null) {
            newIndex = afterRuleIndex > 0 ? afterRuleIndex - 100 : afterRuleIndex + 0.1;
        } else {
            const maxIndex = await RuleModel
                .find({tenantId: rule.tenantId})
                .sort({ruleIndex: -1})
                .limit(1)
                .then(rules => rules[0]?.ruleIndex || 0);

            newIndex = maxIndex + 100;
        }

        rule.ruleIndex = newIndex;
        await rule.save();

        res.status(200).json({message: 'Rule reordered successfully', newIndex});
    } catch (error: any) {
        console.error('Reorder rule error:', error);
        throw error.statusCode ? error : Object.assign(new Error('Internal Server Error'), {statusCode: 500});
    }
};
