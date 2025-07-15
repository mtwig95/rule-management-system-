import {
    Box,
    Chip,
    IconButton,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField
} from '@mui/material';
import {closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Rule} from "../types/rule";
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Check';
import TagIcon from '@mui/icons-material/LocalOffer';
import {reorderRule, updateRule} from '../api/rules';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {useState} from 'react';

type Props = {
    tenantId: string;
    rules: Rule[];
    total: number;
    page: number;
    onPageChange: (page: number) => void;
    onDelete: (ruleId: string) => void;
    onReorder: () => void;
};

const limit = 4;

export const RuleTable = ({tenantId, rules, total, page, onPageChange, onDelete, onReorder}: Props) => {
    const totalPages = Math.ceil(total / limit);

    const sensors = useSensors(useSensor(PointerSensor));
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleDragEnd = async (event: DragEndEvent) => {
        const {active, over} = event;
        if (!over || active.id === over.id) return;

        const oldIndex = rules.findIndex(r => r._id === active.id);
        const newIndex = rules.findIndex(r => r._id === over.id);
        const newOrder = arrayMove(rules, oldIndex, newIndex);

        const before = newOrder[newIndex - 1]?._id || null;
        const after = newOrder[newIndex + 1]?._id || null;

        try {
            await reorderRule(active.id as string, {beforeId: before, afterId: after});
            onReorder();
        } catch (e) {
            console.error('Reorder failed', e);
        }
    };

    return (<>
        <TableContainer component={Paper}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                    items={rules.map(rule => rule._id)}
                    strategy={verticalListSortingStrategy}
                >
                    <Table>
                        <TableHead sx={{backgroundColor: '#1f2a44'}}>
                            <TableRow>
                                <TableCell sx={{color: '#fff'}}>#</TableCell>
                                <TableCell sx={{color: '#fff'}}>Action</TableCell>
                                <TableCell sx={{color: '#fff'}}>Name</TableCell>
                                <TableCell sx={{color: '#fff'}}>Source</TableCell>
                                <TableCell sx={{color: '#fff'}}>Destination</TableCell>
                                <TableCell sx={{color: '#fff'}} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...rules].reverse().map((rule, index) => (editingId === rule._id ? (<EditableRuleRow
                                key={rule._id}
                                rule={rule}
                                tenantId={tenantId}
                                displayIndex={index + 1}
                                onCancel={() => setEditingId(null)}
                                onSave={() => {
                                    setEditingId(null);
                                    onReorder();
                                }}
                            />) : (<SortableRow
                                key={rule._id}
                                rule={rule}
                                onDelete={onDelete}
                                displayIndex={index + 1}
                                onEdit={() => setEditingId(rule._id)}
                            />)))}
                        </TableBody>
                    </Table>
                </SortableContext>
            </DndContext>
        </TableContainer>

        <Box mt={2} display="flex" justifyContent="center">
            <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => onPageChange(value)}
                color="primary"
            />
        </Box>
    </>);
};

const SortableRow = ({
                         rule, onDelete, displayIndex, onEdit
                     }: {
    rule: Rule; onDelete: (id: string) => void; displayIndex: number; onEdit: () => void;
}) => {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: rule._id});

    const style = {
        transform: CSS.Transform.toString(transform), transition
    };

    return (<TableRow ref={setNodeRef} style={style}
                      sx={{backgroundColor: rule.action === 'Block' ? '#f9f9f9' : '#eaf4ea'}}>

        <TableCell>
            <Box display="flex" alignItems="center" gap={1}>
      <span {...attributes} {...listeners} style={{cursor: 'grab'}}>
        <DragIndicatorIcon fontSize="small"/>
      </span>
                {displayIndex}
            </Box>
        </TableCell>
        <TableCell>
            <Chip
                icon={rule.action === 'Block' ? <BlockIcon/> : <CheckCircleIcon/>}
                label={rule.action}
                color={rule.action === 'Block' ? 'error' : 'success'}
            />
        </TableCell>
        <TableCell>{rule.name}</TableCell>
        <TableCell>
            <Box display="flex" flexWrap="wrap" gap={1}>
                {rule.source.map((s) => (<Chip key={s.email} label={s.name} variant="outlined"/>))}
            </Box>
        </TableCell>
        <TableCell>
            <Box display="flex" flexWrap="wrap" gap={1}>
                {rule.destination.map((d) => (<Chip key={d.address} label={d.name} icon={<TagIcon/>}/>))}
            </Box>
        </TableCell>
        <TableCell align="center">
            <IconButton onClick={onEdit}><EditIcon/></IconButton>
            <IconButton color="error" onClick={() => onDelete(rule._id)}><DeleteIcon/></IconButton>
        </TableCell>
    </TableRow>);
};

const EditableRuleRow = ({
                             rule, tenantId, displayIndex, onCancel, onSave
                         }: {
    rule: Rule; tenantId: string; displayIndex: number; onCancel: () => void; onSave: (updated?: Rule) => void;
}) => {
    const [name, setName] = useState(rule.name);
    const [action, setAction] = useState(rule.action);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        try {
            setLoading(true);
            const response = await updateRule(rule._id, {name, action, tenantId});
            onSave(response.data);
        } catch (error) {
            console.error('Failed to update rule', error);
        } finally {
            setLoading(false);
        }
    };

    return (<TableRow sx={{backgroundColor: '#fffbe6'}}>
        <TableCell>{displayIndex}</TableCell>
        <TableCell>
            <Select value={action} onChange={(e) => setAction(e.target.value as 'Allow' | 'Block')} size="small">
                <MenuItem value="Allow">Allow</MenuItem>
                <MenuItem value="Block">Block</MenuItem>
            </Select>
        </TableCell>
        <TableCell>
            <TextField value={name} onChange={(e) => setName(e.target.value)} size="small"/>
        </TableCell>
        <TableCell>—</TableCell>
        <TableCell>—</TableCell>
        <TableCell align="center">
            <IconButton onClick={onCancel} disabled={loading}><CloseIcon/></IconButton>
            <IconButton onClick={handleSave} disabled={loading}><SaveIcon/></IconButton>
        </TableCell>
    </TableRow>);
};
