import prisma from "../prismaClient.js";

// CREATE SUBJECT
export const createSubject = async (req, res) => {
  try {
    const { name } = req.body;

    const subject = await prisma.schoolSubject.create({
      data: { name },
    });

    res.json({
      success: true,
      subject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Subject create failed",
    });
  }
};

// GET ALL SUBJECTS
export const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.schoolSubject.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Fetch failed",
    });
  }
};


// DELETE SUBJECT
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.schoolSubject.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Subject deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};
