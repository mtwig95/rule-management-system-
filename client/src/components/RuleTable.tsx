import {
    Box,
    Chip,
    IconButton,
    Pagination,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Rule} from "../types/rule";
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TagIcon from '@mui/icons-material/LocalOffer';
import {reorderRule} from '../api/rules';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

type Props = {
    rules: Rule[];
    total: number;
    page: number;
    onPageChange: (page: number) => void;
    onDelete: (ruleId: string) => void;
    onReorder: () => void;
};

const limit = 4;

export const RuleTable = ({rules, total, page, onPageChange, onDelete, onReorder}: Props) => {
    const totalPages = Math.ceil(total / limit);

    const sensors = useSensors(useSensor(PointerSensor));

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
                                <TableCell sx={{color: '#fff'}} align="center">Delete</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rules.map(rule => (<SortableRow key={rule._id} rule={rule} onDelete={onDelete}/>))}
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

const SortableRow = ({rule, onDelete}: { rule: Rule, onDelete: (id: string) => void }) => {
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
                {rule.ruleIndex}
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
            <IconButton
                color="error"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(rule._id);
                }}
            >
                <DeleteIcon/>
            </IconButton>
        </TableCell>
    </TableRow>);
};
