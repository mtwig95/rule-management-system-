import express from "express";
import {
  createRule,
  getRulesByTenant,
  updateRule,
  deleteRule,
  reorderRule,
  bulkUpdateRules,
} from "../controllers/rule.controller";

const router = express.Router();

router.get("/:tenantId", getRulesByTenant);

router.post("/", createRule);

router.put("/:id", updateRule);

router.delete("/:id", deleteRule);

router.post("/:id/reorder", reorderRule);

router.post("/bulk-update", bulkUpdateRules);

export default router;
