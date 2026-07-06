import express from "express";

import {
  generateAbsentReportPdf,
} from "../controllers/absentReportPdfController.js";

const router = express.Router();

// ==========================================
// DATE WISE ABSENT TEACHER PDF
// ==========================================

router.get(
  "/",
  generateAbsentReportPdf
);

export default router;