const prisma = require("../prismaClient");

/* ================= CREATE CLASS ROUTINE ================= */
exports.createClassRoutine = async (req, res) => {
  try {
    const { className, section, period, time, subject, teacherId } = req.body;

    if (!className || !section || !period || !time || !subject || !teacherId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const routine = await prisma.schoolClassRoutine.create({
      data: {
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
      message: "Class routine created successfully",
      data: routine,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET CLASS ROUTINE ================= */
exports.getClassRoutine = async (req, res) => {
  try {
    const { className, section } = req.query;

    const where = {};
    if (className) where.className = className;
    if (section) where.section = section;

    const list = await prisma.schoolClassRoutine.findMany({
      where,
      orderBy: [{ className: "asc" }, { period: "asc" }],
    });

    res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
