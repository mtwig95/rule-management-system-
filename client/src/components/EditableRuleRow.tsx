import {
    IconButton,
    MenuItem,
    Select,
    TableCell,
    TableRow,
    TextField
} from '@mui/material';
import { useState } from 'react';
import { Rule } from '../types/rule';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Check';
import { updateRule } from '../api/rules';

type Props = {
    rule: Rule;
    tenantId: string;
    displayIndex: number;
    onCancel: () => void;
    onSave: (updated?: Rule) => void;
};

export const EditableRuleRow = ({ rule, tenantId, displayIndex, onCancel, onSave }: Props) => {
    const [name, setName] = useState(rule.name);
    const [action, setAction] = useState(rule.action);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        try {
            setLoading(true);
            const response = await updateRule(rule._id, { name, action, tenantId });
            onSave(response.data);
        } catch (error) {
            console.error('Failed to update rule', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TableRow sx={{ backgroundColor: '#fffbe6' }}>
            <TableCell>{displayIndex}</TableCell>
            <TableCell>
                <Select
                    value={action}
                    onChange={(e) => setAction(e.target.value as 'Allow' | 'Block')}
                    size="small"
                >
                    <MenuItem value="Allow">Allow</MenuItem>
                    <MenuItem value="Block">Block</MenuItem>
                </Select>
            </TableCell>
            <TableCell>
                <TextField
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    size="small"
                />
            </TableCell>
            <TableCell>—</TableCell>
            <TableCell>—</TableCell>
            <TableCell align="center">
                <IconButton onClick={onCancel} disabled={loading}>
                    <CloseIcon />
                </IconButton>
                <IconButton onClick={handleSave} disabled={loading}>
                    <SaveIcon />
                </IconButton>
            </TableCell>
        </TableRow>
    );
};
