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

// Get today absent teachers
router.get("/today", getTodayAbsentTeachers);

// Reset single teacher
router.delete(
  "/reset/:teacherId",
  resetAbsentTeacher
);

// Reset all teachers
router.delete(
  "/reset-all",
  resetAllAbsentTeachers
);

export default router;