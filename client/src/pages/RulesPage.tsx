import React, {useEffect, useState} from 'react';
import { RuleTable } from '../components/RuleTable';
import { AddRuleForm } from '../components/AddRuleForm';
import { Rule } from '../types/rule';
import { getRules, deleteRule } from '../api/rules';

export const RulesPage = () => {
    const tenantId = 'org123';
    const [rules, setRules] = useState<Rule[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const limit = 4;

    const refetchRules = () => setRefreshKey(prev => prev + 1);

    useEffect(() => {
        getRules(tenantId, page, limit).then((res) => {
            setRules(res.data);
            setTotal(res.total);
        });
    }, [tenantId, page, refreshKey]);

    const handleDeleteRule = async (ruleId: string) => {
        try {
            await deleteRule(ruleId);
            refetchRules();
        } catch (error) {
            console.error('Failed to delete rule:', error);
            alert('Failed to delete rule');
        }
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Rule Management - {tenantId}</h1>
            <AddRuleForm tenantId={tenantId} onSuccess={refetchRules} />
            <RuleTable
                rules={rules}
                total={total}
                page={page}
                onPageChange={setPage}
                onDelete={handleDeleteRule}
                onReorder={refetchRules}
            />
        </div>
    );
};
