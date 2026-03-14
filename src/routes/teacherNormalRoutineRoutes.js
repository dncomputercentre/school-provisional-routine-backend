import express from "express";
import {
  getTeacherRoutineByDay,
} from "../controllers/teacherNormalRoutineController.js";

const router = express.Router();

/* ===============================
   GET TEACHER ROUTINE BY DAY
================================ */

router.get("/:day", getTeacherRoutineByDay);

export default router;
