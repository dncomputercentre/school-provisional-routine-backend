import prisma from "../prismaClient.js";

import {
  buildProvisionalRoutine,
} from "../utils/provisionalRoutineLogic.js";

import {
  buildAssignedTeacherRoutine,
} from "../utils/assignedTeacherRoutineLogic.js";

// ======================================
// TODAY ASSIGNED TEACHER TOTAL CLASS
// ======================================

export const getTodayAssignedTeacherClass = async (
  req,
  res
) => {

  try {

    const today = new Date();

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const day =
      dayNames[today.getDay()];

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    // ===============================
    // Load Normal Routine
    // ===============================

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

        orderBy: {
          time: "asc",
        },

      });

    // ===============================
    // Load Today's Absent Teachers
    // ===============================

    const absentTeachers =
      await prisma.schoolTeacherAbsent.findMany({

        where: {

          date: {

            gte: start,

            lte: end,

          },

        },

      });

    // ===============================
    // Load All Teachers
    // ===============================

    const teachers =
      await prisma.schoolTeacher.findMany();

    const absentIds =
      absentTeachers.map(
        (item) => item.teacherId
      );

    // ===============================
    // Build Provisional Routine
    // ===============================

    const provisionalRoutine =
      buildProvisionalRoutine(

        routines,

        teachers,

        absentIds

      );

    // ===============================
    // Build Assigned Teacher Routine
    // ===============================

    const assignedTeachers =
      buildAssignedTeacherRoutine(

        provisionalRoutine,

        routines

      );

    // ===============================
    // Response
    // ===============================

    res.json({

      success: true,

      totalAssignedTeachers:
        assignedTeachers.length,

      totalAbsentTeachers:
        absentIds.length,

      day,

      data: assignedTeachers,

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};