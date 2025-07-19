import {NextFunction, Request, Response} from 'express';
import {RuleModel} from '../models/rule.model';
import {AppError} from '../middlewares/errorHandler';

export const getRulesByTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.params.tenantId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        if (!tenantId) {
            const error = new Error('Missing tenantId') as AppError;
            error.statusCode = 400;
            error.field = 'tenantId';
            return next(error);
        }

        const query = {tenantId};

        const total = await RuleModel.countDocuments(query);
        const rules = await RuleModel.find(query)
            .sort({ruleIndex: 1})
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({data: rules, total, page, limit});
    } catch (error: any) {
        const err = error.statusCode ? error : Object.assign(new Error('Internal Server Error'), {statusCode: 500});
        next(err);
    }
};

export const createRule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {tenantId, source, destination, action, name} = req.body;

        if (!tenantId || !source || !destination || !action) {
            const error = new Error('Missing required fields') as AppError;
            error.statusCode = 400;
            return next(error);
        }

        const existingCount = await RuleModel.countDocuments({tenantId});
        const isFirstRule = existingCount === 0;

        let ruleIndex: number;
        if (isFirstRule) {
            ruleIndex = 0;
        } else {
            const lastRule = await RuleModel.findOne({tenantId}).sort({ruleIndex: -1});
            const maxIndex = lastRule?.ruleIndex || 0;
            ruleIndex = maxIndex + 100;
        }

        const newRule = await RuleModel.create({
            tenantId, name, source, destination, action, ruleIndex,
        });

        res.status(201).json(newRule);
    } catch (error: any) {
        if (error.code === 11000) {
            const conflictError = new Error('Duplicate ruleIndex') as AppError;
            conflictError.statusCode = 409;
            return next(conflictError);
        }

        const err = error.statusCode ? error : Object.assign(new Error('Internal Server Error'), {statusCode: 500});
        return next(err);
    }
};

export const updateRule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ruleId = req.params.id;
        const {tenantId, name, source, destination, action} = req.body;

        if (!ruleId) {
            throw Object.assign(new Error('Missing rule ID'), {statusCode: 400});
        }

        if (!tenantId) {
            throw Object.assign(new Error('Missing tenantId'), {statusCode: 400});
        }

        const rule = await RuleModel.findById(ruleId);
        if (!rule) {
            return next(Object.assign(new Error('Rule not found'), {statusCode: 404}));
        }

        if (rule.tenantId !== tenantId) {
            return next(Object.assign(new Error('Access denied to this rule'), {statusCode: 403}));
        }

        rule.source = source ?? rule.source;
        rule.destination = destination ?? rule.destination;
        rule.action = action ?? rule.action;
        rule.name = name ?? rule.name;

        await rule.save();

        res.json(rule);
    } catch (error: any) {
        const err = error.statusCode ? error : Object.assign(new Error('Internal Server Error'), {statusCode: 500});
        next(err);
    }
};

export const deleteRule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await RuleModel.findByIdAndDelete(req.params.id);
        if (!deleted) {
            const error = new Error('Rule not found') as AppError;
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({message: 'Rule deleted'});
    } catch (error: any) {
        next(error);
    }
};

export const reorderRule = async (req: Request, res: Response, next: NextFunction) => {
    try {


        const {id} = req.params;
        const {beforeId, afterId} = req.body;

        const rule = await RuleModel.findById(id);
        if (!rule) {
            const err = new Error('Rule not found') as AppError;
            err.statusCode = 404;
            return next(err);
        }

        if (rule.ruleIndex === 0) {
            const err = new Error('Cannot reorder the Cleanup Rule') as AppError;
            err.statusCode = 403;
            return next(err);
        }

        const getIndex = async (ruleId: string | undefined, label: string) => {
            if (!ruleId) return null;
            const r = await RuleModel.findById(ruleId);
            if (!r) {
                throw Object.assign(new Error(`${label} not found`), {statusCode: 400});
            }
            return r.ruleIndex;
        };

        const beforeRuleIndex = await getIndex(beforeId, 'beforeId');
        const afterRuleIndex = await getIndex(afterId, 'afterId');

        let newIndex: number;

        if (beforeRuleIndex !== null && afterRuleIndex !== null) {
            newIndex = (beforeRuleIndex + afterRuleIndex) / 2;
        } else if (beforeRuleIndex !== null) {
            newIndex = beforeRuleIndex + 100;
        } else if (afterRuleIndex !== null) {
            newIndex = afterRuleIndex > 0 ? afterRuleIndex - 100 : 1;
        } else {
            const maxIndex = await RuleModel
                .find({tenantId: rule.tenantId})
                .sort({ruleIndex: -1})
                .limit(1)
                .then(rules => rules[0]?.ruleIndex || 0);

            newIndex = maxIndex + 100;
        }

        if (newIndex <= 0) {
            return next(Object.assign(new Error('Cannot place rule below the Cleanup Rule'), {statusCode: 400}));
        }

        rule.ruleIndex = newIndex;
        await rule.save();

        res.status(200).json({message: 'Rule reordered successfully', newIndex});
    } catch (error: any) {
        console.error('Reorder rule error:', error);
        const err = error.statusCode ? error : Object.assign(new Error('Internal Server Error'), {statusCode: 500});
        return next(err);
    }
};

export const bulkUpdateRules = async (req: Request, res: Response) => {
    const {rules} = req.body;

    if (!Array.isArray(rules)) {
        return res.status(400).json({message: 'rules must be an array'});
    }

    try {
        const operations = rules.map((rule) => {
            if (!rule._id) {
                throw new Error('Each rule must have an _id');
            }

            return {
                updateOne: {
                    filter: {_id: rule._id}, update: {$set: rule},
                }
            };
        });

        const result = await RuleModel.bulkWrite(operations);

        res.status(200).json({
            message: 'Bulk update successful', result,
        });
    } catch (error) {
        console.error('Bulk update error:', error);
        res.status(500).json({
            message: 'Bulk update failed', error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
