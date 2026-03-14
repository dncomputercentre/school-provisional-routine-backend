import prisma from "../prismaClient.js";

/* =================================================
   GET TEACHER NORMAL ROUTINE BY DAY
================================================= */

export const getTeacherRoutineByDay = async (req, res) => {
  try {

    const { day } = req.params;

    const data = await prisma.classRoutine.findMany({
      where: {
        day: {
          equals: day,
          mode: "insensitive",
        },
      },

      include: {
        teacher: true,   // join teacher
      },

      orderBy: {
        period: "asc",
      },
    });

    res.json({
      success: true,
      data,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};
