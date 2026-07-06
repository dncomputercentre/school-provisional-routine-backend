import express from "express";
import {
  markAbsentToday,
  getTodayAbsentTeachers,
  resetAbsentTeacher,
  resetAllAbsentTeachers,
} from "../controllers/absentController.js";

const router = express.Router();

// Mark absent
router.post("/mark", markAbsentToday);

// Reset all teachers
router.delete(
  "/reset-all",
  resetAllAbsentTeachers
);

export default router;