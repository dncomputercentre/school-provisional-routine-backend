const prisma = require("../prismaClient");

/* ================= CREATE TEACHER ================= */
exports.createTeacher = async (req, res) => {
  try {
    const { name, mobile, mainSubject, optionalSubjects } = req.body;

    if (!name || !mobile || !mainSubject) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile, and mainSubject are required",
      });
    }

    const teacher = await prisma.schoolTeacher.create({
      data: {
        name,
        mobile,
        mainSubject,
        optionalSubjects: optionalSubjects || [],
      },
    });

    res.json({
      success: true,
      message: "Teacher created successfully",
      data: teacher,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET ALL TEACHERS ================= */
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await prisma.schoolTeacher.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: teachers,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
