const express = require("express");
const router = express.Router();

const {
  generateTeacherWisePdf,
} = require("../controllers/teacherWisePdfController");

router.get("/", generateTeacherWisePdf);

module.exports = router;
