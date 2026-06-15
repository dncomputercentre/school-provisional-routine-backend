import express from "express";
import { generateRoutinePdf }
from "../controllers/routinePdfController.js";

const router = express.Router();

router.get(
  "/",
  generateRoutinePdf
);

export default router;