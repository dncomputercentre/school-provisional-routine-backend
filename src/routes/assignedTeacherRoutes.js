import express from "express";

import {
  getTodayAssignedTeacherClass,
} from "../controllers/assignedTeacherController.js";

const router = express.Router();

// Today Assigned Teacher Total Class
router.get(
  "/today",
  getTodayAssignedTeacherClass
);

export default router;