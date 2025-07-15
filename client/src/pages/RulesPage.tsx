import React, {useEffect, useState} from 'react';
import {RuleTable} from '../components/RuleTable';
import {AddRuleForm} from '../components/AddRuleForm';
import {Rule} from '../types/rule';
import {deleteRule, getRules} from '../api/rules';
import {Box, Button, Collapse, Paper, Typography} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

export const RulesPage = () => {
    const tenantId = 'org123';
    const [rules, setRules] = useState<Rule[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [showAddForm, setShowAddForm] = useState(false);
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

    return (<Box p={4} display="flex" flexDirection="column" gap={3}>
            <Typography variant="h4" fontWeight="bold">
                Rule Management - {tenantId}
            </Typography>

            <Box display="flex" justifyContent="flex-end">
                <Button
                    variant={showAddForm ? 'outlined' : 'contained'}
                    color="primary"
                    startIcon={showAddForm ? <CloseIcon/> : <AddIcon/>}
                    onClick={() => setShowAddForm(prev => !prev)}
                >
                    {showAddForm ? 'Cancel' : 'Add Rule'}
                </Button>
            </Box>

            <Collapse in={showAddForm}>
                <Paper elevation={3} sx={{p: 3, mt: 1}}>
                    <AddRuleForm
                        tenantId={tenantId}
                        onSuccess={() => {
                            refetchRules();
                            setShowAddForm(false);
                        }}
                    />
                </Paper>
            </Collapse>

            <RuleTable
                tenantId={tenantId}
                rules={rules}
                total={total}
                page={page}
                onPageChange={setPage}
                onDelete={handleDeleteRule}
                onReorder={refetchRules}
            />
        </Box>);
};
