import prisma from "../prismaClient.js";

export const getProvisionalRoutineByDay = async (req, res) => {
  try {

    const { day } = req.params;

    /* ===== TODAY DATE ===== */

    const today = new Date();

    const start = new Date(
      today.setHours(0, 0, 0, 0)
    );

    const end = new Date(
      today.setHours(23, 59, 59, 999)
    );

    /* ===== NORMAL ROUTINE ===== */

    const routines =
      await prisma.classRoutine.findMany({
        where: {
          day: {
            equals: day,
            mode: "insensitive",
          },
        },
        include: {
          teacher: true,
        },
      });

    /* ===== ABSENT ===== */

    const absents =
      await prisma.schoolTeacherAbsent.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      });

    /* ===== TEACHERS ===== */

    const teachers =
      await prisma.schoolTeacher.findMany();

    /* ===== LOGIC ===== */

    const result = routines.map((r) => {

      const absent = absents.find(
        (a) => a.teacherId === r.teacherId
      );

      if (!absent) {
        return {
          ...r,
          isAbsent: false,
          substituteTeacher: null,
        };
      }

      const isSenior =
        r.className.includes("XI") ||
        r.className.includes("XII");

      if (isSenior) {
        return {
          ...r,
          isAbsent: true,
          substituteTeacher: null,
        };
      }

      const substitute =
        teachers.find((t) =>
          t.mainSubject === r.subject ||
          (t.optionalSubjects || [])
            .includes(r.subject)
        );

      return {
        ...r,
        isAbsent: true,
        substituteTeacher: substitute || null,
      };
    });

    res.json({
      success: true,
      data: result,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};
