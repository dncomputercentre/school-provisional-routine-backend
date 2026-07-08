import express from "express";
import {
  markAbsentToday,
  getTodayAbsentTeachers,
  resetAbsentTeacher,
  resetAllAbsentTeachers,
} from "../controllers/absentController.js";

const router = express.Router();

// Get today's absent teachers
router.get("/today", getTodayAbsentTeachers);

// Mark absent
router.post("/mark", markAbsentToday);

// Reset one teacher
router.delete("/reset/:teacherId", resetAbsentTeacher);

// Reset all teachers
router.delete("/reset-all", resetAllAbsentTeachers);

export default router;