import express from "express";

import {
  getAssignedTeacherReport,
} from "../controllers/assignedTeacherReportController.js";

const router = express.Router();

// ==========================================
// Date Wise Assigned Teacher Report
// ==========================================

router.get(
  "/",
  getAssignedTeacherReport
);

export default router;