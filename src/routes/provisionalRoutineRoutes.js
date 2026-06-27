import express from "express";
import {
  getTodayProvisionalRoutine,
  getDateWiseProvisionalRoutine,
  getTeacherWiseReport,
} from "../controllers/provisionalRoutineController.js";

import {
  generateProvisionalRoutinePdf,
} from "../controllers/provisionalRoutinePdfController.js";

const router = express.Router();

// Today
router.get("/today", getTodayProvisionalRoutine);

// Date Wise
router.get("/date/:date", getDateWiseProvisionalRoutine);

// Teacher Wise
router.get("/teacher/:date", getTeacherWiseReport);

// PDF
router.get("/pdf", generateProvisionalRoutinePdf);

export default router;