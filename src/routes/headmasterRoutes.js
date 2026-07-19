import express from "express";
import {
  createTempHeadMaster,
  loginHeadMaster,
  changePassword,
} from "../controllers/headmasterController.js";

const router = express.Router();

// TEMP SETUP
router.get("/setup", async (req, res) => {
  req.body = {
    email: "admin@gmail.com",
    password: "12345678",
  };

  return createTempHeadMaster(req, res);
});

// Setup temp headmaster
router.post("/setup", createTempHeadMaster);

// Login
router.post("/login", loginHeadMaster);

// Change password
router.post("/change-password", changePassword);

export default router;