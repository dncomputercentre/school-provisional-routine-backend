import prisma from "../prismaClient.js";

const MAX_PROVISIONAL_PER_DAY = 2;

const getDayNameFromDate = (dateString) => {
  const date = new Date(dateString);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return days[date.getDay()];
};

export const getProvisionalRoutineByDay = async (req, res) => {
  try {
    const { day } = req.params;

    const today = new Date();

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    // ===========================
    // Load Data
    // ===========================

    const routines = await prisma.classRoutine.findMany({
      where: {
        day: {
          equals: day,
          mode: "insensitive",
        },
      },
      include: {
        teacher: true,
      },
      orderBy: [
        {
          time: "asc",
        },
      ],
    });

    const absentTeachers =
      await prisma.schoolTeacherAbsent.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      });

    const teachers =
      await prisma.schoolTeacher.findMany();
    // console.log(
//   teachers.map((t) => ({
//     name: t.name,
//     mainSubject: t.mainSubject,
//     optionalSubjects: t.optionalSubjects,
//   }))
// );

    const absentIds = absentTeachers.map(
      (a) => a.teacherId
    );

    // কতগুলো provisional already পেয়েছে
    const teacherLoad = {};

    teachers.forEach((t) => {
      teacherLoad[t.id] = 0;
    });

    // ===========================
    // Helper Function
    // ===========================

    function isSeniorClass(className) {
      return (
        className.includes("XI") ||
        className.includes("XII")
      );
    }

    function isTeacherBusy(
      teacherId,
      time,
      day
    ) {
      return routines.some(
        (r) =>
          r.teacherId === teacherId &&
          r.day === day &&
          r.time === time
      );
    }

    function isTeacherAbsent(
      teacherId
    ) {
      return absentIds.includes(
        teacherId
      );
    }

    function isTeacherOverloaded(
      teacherId
    ) {
      return (
        teacherLoad[teacherId] >=
        MAX_PROVISIONAL_PER_DAY
      );
    }

    // একই সময়ে provisional পেয়েছে?
    const provisionalTimeMap = {};

    function alreadyAssigned(
      teacherId,
      day,
      time
    ) {

      const key =
        teacherId +
        "_" +
        day +
        "_" +
        time;

      return provisionalTimeMap[key];
    }

    function assignTeacher(
      teacherId,
      day,
      time
    ) {

      const key =
        teacherId +
        "_" +
        day +
        "_" +
        time;

      provisionalTimeMap[key] = true;

      teacherLoad[teacherId]++;

    }

    // ===========================
    // Build Provisional Routine
    // ===========================

    const result = [];

    for (const routine of routines) {

      // Teacher উপস্থিত থাকলে
      if (!isTeacherAbsent(routine.teacherId)) {

        result.push({
          ...routine,
          isAbsent: false,
          substituteTeacher: null,
          reason: null,
        });

        continue;
      }

      // XI / XII হলে Substitute হবে না
      if (isSeniorClass(routine.className)) {

        result.push({
          ...routine,
          isAbsent: true,
          substituteTeacher: null,
          reason: "Senior Class",
        });

        continue;
      }

      let candidate = null;
      let reason = "";

      // ===========================
      // Priority 1 : Main Subject
      // ===========================

      let freeTeachers = teachers.filter((t) => {

        if (t.id === routine.teacherId)
          return false;

        if (isTeacherAbsent(t.id))
          return false;

        if (isTeacherBusy(
          t.id,
          routine.time,
          routine.day
        ))
          return false;

        if (alreadyAssigned(
          t.id,
          routine.day,
          routine.time
        ))
          return false;

        if (isTeacherOverloaded(t.id))
          return false;

        return (
          (t.mainSubject || "").toLowerCase() ===
          (routine.subject || "").toLowerCase()
        );

      });

      if (freeTeachers.length > 0) {

        freeTeachers.sort((a, b) => {

          if (
            teacherLoad[a.id] !==
            teacherLoad[b.id]
          ) {
            return (
              teacherLoad[a.id] -
              teacherLoad[b.id]
            );
          }

          return a.name.localeCompare(b.name);

        });

        candidate = freeTeachers[0];
        reason = "Main Subject";

      }

      // ===========================
      // Priority 2 : Optional Subject
      // ===========================

      if (!candidate) {

        freeTeachers =
          teachers.filter((t) => {

            if (t.id === routine.teacherId)
              return false;

            if (isTeacherAbsent(t.id))
              return false;

            if (isTeacherBusy(
              t.id,
              routine.time,
              routine.day
            ))
              return false;

            if (alreadyAssigned(
              t.id,
              routine.day,
              routine.time
            ))
              return false;

            if (isTeacherOverloaded(t.id))
              return false;

            return (t.optionalSubjects || []).some(
              (s) =>
                (s || "").toLowerCase() ===
                (routine.subject || "").toLowerCase()
            );

          });

        if (freeTeachers.length > 0) {
          freeTeachers.sort((a, b) => {

            if (
              teacherLoad[a.id] !==
              teacherLoad[b.id]
            ) {
              return (
                teacherLoad[a.id] -
                teacherLoad[b.id]
              );
            }

            return a.name.localeCompare(b.name);

          });

          candidate = freeTeachers[0];
          reason = "Optional Subject";

        }

      }

      // ===========================
      // Priority 3 : Any Free Teacher
      // ===========================

      if (!candidate) {

        freeTeachers =
          teachers.filter((t) => {

            if (t.id === routine.teacherId)
              return false;

            if (isTeacherAbsent(t.id))
              return false;

            if (isTeacherBusy(
              t.id,
              routine.time,
              routine.day
            ))
              return false;

            if (alreadyAssigned(
              t.id,
              routine.day,
              routine.time
            ))
              return false;

            if (isTeacherOverloaded(t.id))
              return false;

            return true;

          });

        if (freeTeachers.length > 0) {

          freeTeachers.sort((a, b) => {

            if (
              teacherLoad[a.id] !==
              teacherLoad[b.id]
            ) {
              return (
                teacherLoad[a.id] -
                teacherLoad[b.id]
              );
            }

            return a.name.localeCompare(b.name);

          });

          candidate = freeTeachers[0];
          reason = "Free Teacher";

        }

      }

      if (candidate) {

        assignTeacher(
          candidate.id,
          routine.day,
          routine.time
        );

      }

      result.push({
        ...routine,
        isAbsent: true,
        substituteTeacher:
          candidate || null,
        reason:
          candidate
            ? reason
            : "No Substitute Available",
      });

    }
    // ===========================
    // Response
    // ===========================

    result.sort((a, b) => {

      if (a.day !== b.day) {
        return a.day.localeCompare(b.day);
      }

      return a.time.localeCompare(b.time);

    });

    res.json({
      success: true,
      totalClasses: result.length,
      totalAbsentTeachers: absentIds.length,
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

// ================= TODAY PROVISIONAL ROUTINE =================

export const getTodayProvisionalRoutine = async (req, res) => {
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

    const day = dayNames[today.getDay()];

    // আগের Function-টাই ব্যবহার করা হবে
    req.params.day = day;

    return getProvisionalRoutineByDay(req, res);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};
// ================= DATE WISE PROVISIONAL ROUTINE =================

export const getDateWiseProvisionalRoutine = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "Date Wise Routine is under development",
  });
};

export const getTeacherWiseReport = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "Teacher Wise Report is under development",
  });
};