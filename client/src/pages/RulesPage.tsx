import React, { useEffect, useState } from "react";
import { RuleTable } from "../components/RuleTable";
import { AddRuleForm } from "../components/AddRuleForm";
import { Rule } from "../types/rule";
import { bulkUpdateRules, deleteRule, getRules } from "../api/rules";
import {
  Box,
  Button,
  Collapse,
  FormControl,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

export const RulesPage = () => {
  const [tenantId, setTenantId] = useState("org-123");
  const [rules, setRules] = useState<Rule[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(4);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [editedRules, setEditedRules] = useState<Record<string, Partial<Rule>>>(
    {},
  );

  const refetchRules = () => setRefreshKey((prev) => prev + 1);

  useEffect(() => {
    getRules(tenantId, page, limit).then((res) => {
      setRules(res.data);
      setTotal(res.total);
    });
  }, [tenantId, page, limit, refreshKey]);

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await deleteRule(ruleId);
      refetchRules();
    } catch (error) {
      console.error("Failed to delete rule:", error);
      alert("Failed to delete rule");
    }
  };

  const handleEditChange = (id: string, updatedFields: Partial<Rule>) => {
    setEditedRules((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updatedFields },
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const rulesToUpdate = Object.entries(editedRules).map(
        ([id, updates]) => ({
          _id: id,
          ...updates,
        }),
      );

      await bulkUpdateRules(rulesToUpdate);

      setEditedRules({});
      refetchRules();
    } catch (e) {
      console.error("Failed to save changes", e);
      alert("Failed to save changes");
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", py: 4 }}>
      <Box sx={{ mx: "auto", maxWidth: 1200, px: 2 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                Rule Management
              </Typography>
              <TextField
                label="Tenant ID"
                value={tenantId}
                onChange={(e) => {
                  setTenantId(e.target.value);
                  setPage(1); // reset page on tenant change
                }}
                size="small"
                sx={{ width: 200 }}
              />
            </Box>

            <Button
              variant={showAddForm ? "outlined" : "contained"}
              color="primary"
              startIcon={showAddForm ? <CloseIcon /> : <AddIcon />}
              onClick={() => setShowAddForm((prev) => !prev)}
            >
              {showAddForm ? "Cancel" : "Add Rule"}
            </Button>
          </Box>

          <Collapse in={showAddForm} timeout="auto" unmountOnExit>
            <Box mb={3}>
              <AddRuleForm
                tenantId={tenantId}
                onSuccess={() => {
                  refetchRules();
                  setShowAddForm(false);
                }}
              />
            </Box>
          </Collapse>

          <Box display="flex" justifyContent="flex-end" mb={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <TextField
                type="number"
                label="Rows per page"
                size="small"
                value={limit}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 1 && value <= 100) {
                    setLimit(value);
                    setPage(1);
                  }
                }}
                sx={{ width: 120 }}
              />
            </FormControl>
          </Box>

          <RuleTable
            tenantId={tenantId}
            rules={rules}
            total={total}
            limit={limit}
            page={page}
            onPageChange={setPage}
            onDelete={handleDeleteRule}
            onReorder={refetchRules}
            onEditChange={handleEditChange}
          />
        </Paper>
      </Box>
      <Button
        variant="contained"
        color="primary"
        disabled={Object.keys(editedRules).length === 0}
        onClick={handleSaveChanges}
      >
        Save Changes
      </Button>
    </Box>
  );
};
