import prisma from "../prismaClient.js";

/* ================= CREATE ROUTINE ================= */

export const createRoutine = async (req, res) => {
  try {
    const {
      day,
      className,
      section,
      period,
      time,
      subject,
      teacherId,
    } = req.body;

    if (
      !day ||
      !className ||
      !section ||
      !period ||
      !subject ||
      !teacherId
    ) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    /* ===== CLASH VALIDATION ===== */

    const clash = await prisma.classRoutine.findFirst({
      where: {
        teacherId,
        day,
        time,
      },
    });

    if (clash) {
      return res.status(400).json({
        message:
          "Teacher already assigned at this time",
      });
    }

    /* ===== CREATE ===== */

    const routine =
      await prisma.classRoutine.create({
        data: {
          day,
          className,
          section,
          period,
          time,
          subject,
          teacherId,
        },
      });

    res.json({
      success: true,
      data: routine,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* ================= GET ALL ================= */

export const getRoutines = async (req, res) => {
  try {
    const routines =
      await prisma.classRoutine.findMany({
        include: {
          teacher: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    res.json({
      success: true,
      data: routines,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* ================= FILTER ================= */

export const filterRoutines = async (req, res) => {
  try {
    const { className, section } = req.query;

    const routines =
      await prisma.classRoutine.findMany({
        where: {
          className,
          section,
        },
        include: {
          teacher: true,
        },
        orderBy: {
          period: "asc",
        },
      });

    res.json({
      success: true,
      data: routines,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* ================= UPDATE ================= */

export const updateRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject } = req.body;

    const routine =
      await prisma.classRoutine.update({
        where: { id },
        data: { subject },
      });

    res.json({
      success: true,
      data: routine,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* ================= DELETE ================= */

export const deleteRoutine = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.classRoutine.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Routine deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
