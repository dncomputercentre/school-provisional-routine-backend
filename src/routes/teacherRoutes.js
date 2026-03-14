import express from "express";
import {
  createTeacher,
  getTeachers,
  updateTeacher, 
  deleteTeacher,
} from "../controllers/teacherController.js";

const router = express.Router();

// CREATE
router.post("/", createTeacher);

// GET ALL
router.get("/", getTeachers);
/* UPDATE */
router.put("/:id", updateTeacher);


// DELETE
router.delete("/:id", deleteTeacher);

export default router;
