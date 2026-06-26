import express from "express";
import {
  getTodayProvisionalRoutine,
  getDateWiseProvisionalRoutine,
  getTeacherWiseReport,
} from "../controllers/provisionalRoutineController.js";

const router = express.Router();

// Today
router.get("/today", getTodayProvisionalRoutine);

// Date Wise
router.get("/date/:date", getDateWiseProvisionalRoutine);

// Teacher Wise
router.get("/teacher/:date", getTeacherWiseReport);

export default router;