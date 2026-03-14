import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";

/* CREATE TEMP HEAD MASTER */
export const createTempHeadMaster = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email & password required"
      });
    }

    const exists = await prisma.schoolHeadMaster.findUnique({
      where: { email }
    });

    if (exists) {
      return res.status(400).json({
        message: "Headmaster already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.schoolHeadMaster.create({
      data: {
        email,
        password: hashed,
        mustChangePassword: true
      }
    });

    res.json({
      success: true,
      message: "Temporary headmaster created",
      userId: user.id
    });

  } catch (err) {

    console.log("CREATE ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
};


/* LOGIN */
export const loginHeadMaster = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email & password required"
      });
    }

    const user = await prisma.schoolHeadMaster.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    res.json({
      success: true,
      userId: user.id,
      mustChangePassword: user.mustChangePassword
    });

  } catch (err) {

    console.log("LOGIN ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
};


/* CHANGE PASSWORD */
export const changePassword = async (req, res) => {
  try {

    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({
        message: "userId and newPassword required"
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.schoolHeadMaster.update({
      where: { id: userId },
      data: {
        password: hashed,
        mustChangePassword: false
      }
    });

    res.json({
      success: true,
      message: "Password changed"
    });

  } catch (err) {

    console.log("CHANGE PASSWORD ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
};