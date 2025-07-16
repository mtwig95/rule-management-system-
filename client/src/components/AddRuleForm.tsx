import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    MenuItem,
    Paper,
    Divider,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { createRule } from '../api/rules';

type Props = {
    tenantId: string;
    onSuccess: () => void;
};

export const AddRuleForm: React.FC<Props> = ({ tenantId, onSuccess }) => {
    const [ruleName, setRuleName] = useState('');
    const [action, setAction] = useState<'Allow' | 'Block'>('Allow');
    const [sources, setSources] = useState([{ name: '', email: '' }]);
    const [destinations, setDestinations] = useState([{ name: '', address: '' }]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

    try {
        await createRule({
            tenantId,
            name: ruleName,
            action,
            source: sources,
            destination: destinations,
        });

        onSuccess();
        setRuleName('');
        setSources([{ name: '', email: '' }]);
        setDestinations([{ name: '', address: '' }]);
    } catch (err: any) {
        console.error('Failed to create rule:', err);
        alert('Failed to create rule: ' + (err.response?.data?.message || err.message));
    }
    };

    const handleAddSource = () => setSources([...sources, { name: '', email: '' }]);
    const handleRemoveSource = (index: number) => setSources(sources.filter((_, i) => i !== index));

    const handleAddDestination = () => setDestinations([...destinations, { name: '', address: '' }]);
    const handleRemoveDestination = (index: number) => setDestinations(destinations.filter((_, i) => i !== index));

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
                Create New Rule
            </Typography>

            <form onSubmit={handleSubmit}>
                <TextField
                    label="Rule Name"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />

                <TextField
                    select
                    label="Action"
                    value={action}
                    onChange={(e) => setAction(e.target.value as 'Allow' | 'Block')}
                    fullWidth
                    margin="normal"
                >
                    <MenuItem value="Allow">Allow</MenuItem>
                    <MenuItem value="Block">Block</MenuItem>
                </TextField>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1">Sources</Typography>
                {sources.map((s, idx) => (
                    <Box key={idx} display="flex" gap={2} alignItems="center" my={1}>
                        <TextField
                            label="Name"
                            value={s.name}
                            onChange={(e) => {
                                const copy = [...sources];
                                copy[idx].name = e.target.value;
                                setSources(copy);
                            }}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={s.email}
                            onChange={(e) => {
                                const copy = [...sources];
                                copy[idx].email = e.target.value;
                                setSources(copy);
                            }}
                            fullWidth
                        />
                        {sources.length > 1 && (
                            <IconButton onClick={() => handleRemoveSource(idx)} size="small">
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Box>
                ))}
                <Button startIcon={<AddIcon />} onClick={handleAddSource} size="small">
                    Add Source
                </Button>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1">Destinations</Typography>
                {destinations.map((d, idx) => (
                    <Box key={idx} display="flex" gap={2} alignItems="center" my={1}>
                        <TextField
                            label="Name"
                            value={d.name}
                            onChange={(e) => {
                                const copy = [...destinations];
                                copy[idx].name = e.target.value;
                                setDestinations(copy);
                            }}
                            fullWidth
                        />
                        <TextField
                            label="Address"
                            value={d.address}
                            onChange={(e) => {
                                const copy = [...destinations];
                                copy[idx].address = e.target.value;
                                setDestinations(copy);
                            }}
                            fullWidth
                        />
                        {destinations.length > 1 && (
                            <IconButton onClick={() => handleRemoveDestination(idx)} size="small">
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Box>
                ))}
                <Button startIcon={<AddIcon />} onClick={handleAddDestination} size="small">
                    Add Destination
                </Button>

                <Box mt={3}>
                    <Button type="submit" variant="contained" color="primary">
                        Create Rule
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};