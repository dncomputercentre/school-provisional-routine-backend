import express from "express";
import {
  createTempHeadMaster,
  loginHeadMaster,
  changePassword,
} from "../controllers/headmasterController.js";

const router = express.Router();

// Setup temp headmaster
router.post("/setup", createTempHeadMaster);

// Login
router.post("/login", loginHeadMaster);

// Change password
router.post("/change-password", changePassword);

export default router;
