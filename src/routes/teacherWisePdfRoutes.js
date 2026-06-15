import express from "express";
import {
  generateTeacherPdf,
} from "../controllers/teacherWisePdfController.js";

const router = express.Router();

router.get("/", generateTeacherPdf);

export default router;