import express from "express";
import {
  createSubject,
  getSubjects,
  deleteSubject,
} from "../controllers/subjectController.js";

const router = express.Router();

// Create subject
router.post("/", createSubject);

// Get all subjects
router.get("/", getSubjects);
// Delete subject
router.delete("/:id", deleteSubject);


export default router;
