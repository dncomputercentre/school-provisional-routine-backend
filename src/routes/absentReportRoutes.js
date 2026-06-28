import express from "express";

import {
  getAbsentTeacherReport,
} from "../controllers/absentReportController.js";

const router = express.Router();

// ========================================
// DATE WISE ABSENT TEACHER REPORT
// ========================================

router.get(
  "/",
  getAbsentTeacherReport
);

export default router;