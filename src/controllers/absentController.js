import prisma from "../prismaClient.js";

/* ================= MARK TEACHER ABSENT (TODAY) ================= */
export const markAbsentToday = async (req, res) => {
  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "teacherId is required",
      });
    }

    // Today date (00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent duplicate absent entry
    const exists = await prisma.schoolTeacherAbsent.findFirst({
      where: {
        teacherId,
        date: today,
      },
    });

    if (exists) {
      return res.json({
        success: false,
        message: "Teacher already marked absent today",
      });
    }

    // Create absent record
    const absent = await prisma.schoolTeacherAbsent.create({
      data: {
        teacherId,
        date: today,
      },
    });

    res.json({
      success: true,
      message: "Teacher marked absent for today",
      data: absent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* ================= GET TODAY ABSENT TEACHERS ================= */
export const getTodayAbsentTeachers = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const list = await prisma.schoolTeacherAbsent.findMany({
      where: { date: today },
      include: {
        teacher: true, // 🔥 optional relation include
      },
    });

    res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
