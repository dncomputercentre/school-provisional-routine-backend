import express from "express";

import {
  createRoutine,
  getRoutines,
  filterRoutines,
  updateRoutine,
  deleteRoutine,
} from "../controllers/classRoutineController.js";

const router = express.Router();

/* CREATE */
router.post("/", createRoutine);

/* GET ALL */
router.get("/", getRoutines);

/* FILTER */
router.get("/filter", filterRoutines);

/* UPDATE */
router.put("/:id", updateRoutine);

/* DELETE */
router.delete("/:id", deleteRoutine);

export default router;
