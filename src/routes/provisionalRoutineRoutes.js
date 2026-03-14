import express from "express";
import {
  getProvisionalRoutineByDay,
} from "../controllers/provisionalRoutineController.js";

const router = express.Router();

router.get("/:day", getProvisionalRoutineByDay);

export default router;
