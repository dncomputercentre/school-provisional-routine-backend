const express = require("express");
const router = express.Router();

const {
  markAbsentToday,
  getTodayAbsentTeachers,
} = require("../controllers/absentController");

router.post("/mark", markAbsentToday);
router.get("/today", getTodayAbsentTeachers);

module.exports = router;
