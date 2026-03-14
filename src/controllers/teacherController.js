import prisma from "../prismaClient.js";

/* ================= CREATE ================= */
export const createTeacher = async (req, res) => {
  try {
    const {
      name,
      mobile,
      mainSubject,
      optionalSubjects,
    } = req.body;

    if (!name || !mobile || !mainSubject) {
      return res.status(400).json({
        success: false,
        message:
          "Name, Mobile & Main Subject required",
      });
    }

    const teacher =
      await prisma.schoolTeacher.create({
        data: {
          name,
          mobile,
          mainSubject,
          optionalSubjects:
            optionalSubjects || [],
        },
      });

    res.json({
      success: true,
      message: "Teacher created",
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Create failed",
    });
  }
};

/* ================= GET ================= */
export const getTeachers = async (
  req,
  res
) => {
  try {
    const teachers =
      await prisma.schoolTeacher.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    res.json({
      success: true,
      data: teachers,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Fetch failed",
    });
  }
};

/* ================= UPDATE ================= */
export const updateTeacher = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      name,
      mobile,
      mainSubject,
      optionalSubjects,
    } = req.body;

    const teacher =
      await prisma.schoolTeacher.update({
        where: { id },
        data: {
          name,
          mobile,
          mainSubject,
          optionalSubjects:
            optionalSubjects || [],
        },
      });

    res.json({
      success: true,
      message: "Teacher updated",
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};

/* ================= DELETE ================= */
export const deleteTeacher = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    await prisma.schoolTeacher.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Teacher deleted",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};
