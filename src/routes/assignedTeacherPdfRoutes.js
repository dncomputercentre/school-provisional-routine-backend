import express from "express";

import {
    generateAssignedTeacherPdf,
} from "../controllers/assignedTeacherPdfController.js";

const router = express.Router();

router.get(
    "/",
    generateAssignedTeacherPdf
);

export default router;