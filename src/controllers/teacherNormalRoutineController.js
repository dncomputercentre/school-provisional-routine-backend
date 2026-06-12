import prisma from "../prismaClient.js";

export const searchTeacherRoutine = async (req, res) => {
  try {
    const { teacherName, day } = req.query;

    const data = await prisma.classRoutine.findMany({
      where: {
        ...(day && {
          day: {
            equals: day,
            mode: "insensitive",
          },
        }),

        ...(teacherName && {
          teacher: {
            name: {
              contains: teacherName,
              mode: "insensitive",
            },
          },
        }),
      },

      include: {
        teacher: true,
      },

      orderBy: [
        {
          day: "asc",
        },
        {
          period: "asc",
        },
      ],
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};