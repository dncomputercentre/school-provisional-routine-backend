const prisma = require("../prismaClient");

/* ================= MARK TEACHER ABSENT (TODAY) ================= */
exports.markAbsentToday = async (req, res) => {
  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "teacherId is required",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // prevent duplicate absent for same day
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
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET TODAY ABSENT TEACHERS ================= */
exports.getTodayAbsentTeachers = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const list = await prisma.schoolTeacherAbsent.findMany({
      where: { date: today },
    });

    res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
