const express = require("express");
const router = express.Router();

const {
  createClassRoutine,
  getClassRoutine,
} = require("../controllers/classRoutineController");

router.post("/", createClassRoutine);
router.get("/", getClassRoutine);

module.exports = router;
