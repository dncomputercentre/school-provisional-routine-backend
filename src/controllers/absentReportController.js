import prisma from "../prismaClient.js";

// =========================================
// DATE WISE ABSENT TEACHER REPORT
// =========================================

export const getAbsentTeacherReport = async (req, res) => {
  try {

    const { from, to } = req.query;

    let where = {};

    // ===========================
    // Date Filter
    // ===========================

    if (from && to) {

      where.date = {
        gte: new Date(from),
        lte: new Date(to),
      };

    }

    // ===========================
    // Load Absent Records
    // ===========================

    const absentList =
      await prisma.schoolTeacherAbsent.findMany({

        where,

        include: {
          teacher: true,
        },

        orderBy: {
          date: "desc",
        },

      });

    // ===========================
    // Group Teacher Wise
    // ===========================

    const report = {};

    absentList.forEach((item) => {

      if (!report[item.teacherId]) {

        report[item.teacherId] = {

          teacherId: item.teacherId,

          teacherName:
            item.teacher?.name || "-",

          totalAbsent: 0,

          dates: [],

        };

      }

      report[item.teacherId].totalAbsent++;

      report[item.teacherId].dates.push(
        item.date.toISOString().split("T")[0]
      );

    });

    // ===========================
    // Final Array
    // ===========================

    const result = Object.values(report);

    // বেশি অনুপস্থিত শিক্ষক আগে
    result.sort(
      (a, b) => b.totalAbsent - a.totalAbsent
    );

    // ===========================
    // Response
    // ===========================

    res.json({

      success: true,

      totalTeachers: result.length,

      data: result,

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};