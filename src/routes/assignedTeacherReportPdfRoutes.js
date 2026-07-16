import express from "express";

import {
  generateAssignedTeacherReportPdf,
} from "../controllers/assignedTeacherReportPdfController.js";

const router = express.Router();

// ======================================
// Assigned Teacher Report PDF
// ======================================

router.get(
  "/",
  generateAssignedTeacherReportPdf
);

export default router;