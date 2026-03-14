import express from "express";
import {
  markAbsentToday,
  getTodayAbsentTeachers,
} from "../controllers/absentController.js";

const router = express.Router();

// Mark absent
router.post("/mark", markAbsentToday);

// Get today absent teachers
router.get("/today", getTodayAbsentTeachers);

export default router;
