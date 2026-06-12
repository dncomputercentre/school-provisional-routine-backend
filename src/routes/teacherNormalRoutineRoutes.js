import express from "express";
import { searchTeacherRoutine } from "../controllers/teacherNormalRoutineController.js";

const router = express.Router();

router.get("/", searchTeacherRoutine);

export default router;