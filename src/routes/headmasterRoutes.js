const express = require("express");
const router = express.Router();

const {
  createTempHeadMaster,
  loginHeadMaster,
  changePassword,
} = require("../controllers/headmasterController");

router.post("/setup", createTempHeadMaster);
router.post("/login", loginHeadMaster);
router.post("/change-password", changePassword);

module.exports = router;
