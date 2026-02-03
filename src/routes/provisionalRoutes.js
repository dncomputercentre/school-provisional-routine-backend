const express = require("express");
const router = express.Router();

const {
  generateProvisionalRoutine,
} = require("../controllers/provisionalRoutineController");

router.get("/", generateProvisionalRoutine);

module.exports = router;
