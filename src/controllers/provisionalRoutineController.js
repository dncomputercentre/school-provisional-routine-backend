import prisma from "../prismaClient.js";
import {
  buildProvisionalRoutine,
} from "../utils/provisionalRoutineLogic.js";

// ================= TODAY / DAY WISE =================

export const getProvisionalRoutineByDay = async (req, res) => {
  try {

    const { day } = req.params;

    const today = new Date();

    if (day.toLowerCase() !==
      today.toLocaleDateString("en-US", {
        weekday: "long",
      }).toLowerCase()) {

      const selected = new Date();

      while (
        selected.toLocaleDateString("en-US", {
          weekday: "long",
        }).toLowerCase() !== day.toLowerCase()
      ) {
        selected.setDate(selected.getDate() + 1);
      }

      today.setTime(selected.getTime());
    }

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    // ===========================
    // Load Routine
    // ===========================

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
    console.log("DAY =", day);
    console.log("ROUTINES =", routines.length);
    // ===========================
    // Load Absent Teacher
    // ===========================

    const absentTeachers =
      await prisma.schoolTeacherAbsent.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      });

    // ===========================
    // Load Teachers
    // ===========================

    const teachers =
      await prisma.schoolTeacher.findMany();

    const absentIds =
      absentTeachers.map(
        (a) => a.teacherId
      );
console.log("ABSENT IDS =", absentIds.length);
    // ===========================
    // Build Provisional Routine
    // ===========================

    const result =
      buildProvisionalRoutine(
        routines,
        teachers,
        absentIds
      );
console.log("RESULT =", result.length);
    // ===========================
    // Response
    
    // ===========================

    res.json({
      success: true,
      totalClasses: result.length,
      totalAbsentTeachers:
        absentIds.length,
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

// ================= TODAY =================

export const getTodayProvisionalRoutine = async (
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

    req.params.day =
      dayNames[today.getDay()];

    return getProvisionalRoutineByDay(
      req,
      res
    );

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

// ================= DATE WISE =================

export const getDateWiseProvisionalRoutine = async (
  req,
  res
) => {

  return res.status(501).json({
    success: false,
    message:
      "Date Wise Routine is under development",
  });

};

// ================= TEACHER REPORT =================

export const getTeacherWiseReport = async (
  req,
  res
) => {

  return res.status(501).json({
    success: false,
    message:
      "Teacher Wise Report is under development",
  });

};