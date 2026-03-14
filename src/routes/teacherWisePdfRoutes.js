import express from "express";
import {
  generateTeacherWisePdf,
} from "../controllers/teacherWisePdfController.js";

const router = express.Router();

// Generate teacher wise PDF
router.get("/", generateTeacherWisePdf);

export default router;
