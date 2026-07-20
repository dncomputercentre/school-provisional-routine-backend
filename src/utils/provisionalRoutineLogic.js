// backend/src/utils/provisionalRoutineLogic.js

export function buildProvisionalRoutine(
  routines,
  teachers,
  absentIds
) {

  // ==========================================
  // Absent Teacher Set
  // ==========================================

  absentIds = new Set(absentIds);

  // ==========================================
  // Period Order
  // ==========================================

  const PERIOD_ORDER = [
    "First",
    "Second",
    "Third",
    "Fourth",
    "Fifth",
    "Sixth",
    "Seventh",
    "Eight",
  ];

  const DAY_ORDER = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // ==========================================
  // Teacher Load
  // ==========================================

  const teacherLoad = {};

  teachers.forEach((teacher) => {
    teacherLoad[teacher.id] = 0;
  });

  // ==========================================
  // Provisional Assignment Map
  // ==========================================

  const provisionalTimeMap = {};

  // ==========================================
  // Teacher Normal + Provisional Period Store
  // ==========================================

  const teacherPeriods = {};

  routines.forEach((routine) => {

    if (!teacherPeriods[routine.teacherId]) {
      teacherPeriods[routine.teacherId] = {};
    }

    if (!teacherPeriods[routine.teacherId][routine.day]) {
      teacherPeriods[routine.teacherId][routine.day] = [];
    }

    teacherPeriods[routine.teacherId][routine.day].push(
      routine.period
    );

  });

  // ==========================================
  // Helper Functions
  // ==========================================

  function isSeniorClass(className) {

    return (
      className.includes("XI") ||
      className.includes("XII")
    );

  }

  function getClassNumber(className) {

    const map = {
      "Class-V": 5,
      "Class-VI": 6,
      "Class-VII": 7,
      "Class-VIII": 8,
      "Class-IX": 9,
      "Class-X": 10,
      "Class-XI": 11,
      "Class-XII": 12,
    };

    return map[className] ?? 12;

  }

  function isTeacherAbsent(teacherId) {

    return absentIds.has(teacherId);

  }

  function isTeacherBusy(
    teacherId,
    time,
    day
  ) {

    return routines.some(
      (routine) =>
        routine.teacherId === teacherId &&
        routine.day === day &&
        routine.time === time
    );

  }

  function isTeacherOverloaded(
    teacherId
  ) {

    const teacher = teachers.find(
      (t) => t.id === teacherId
    );

    return (
      teacherLoad[teacherId] >=
      (teacher?.maxProvisional ?? 2)
    );

  }

  function alreadyAssigned(
    teacherId,
    day,
    time
  ) {

    const key =
      `${teacherId}_${day}_${time}`;

    return provisionalTimeMap[key] === true;

  }

  function assignTeacher(
    teacherId,
    day,
    time,
    period
  ) {

    const key =
      `${teacherId}_${day}_${time}`;

    provisionalTimeMap[key] = true;

    teacherLoad[teacherId]++;

    if (!teacherPeriods[teacherId]) {
      teacherPeriods[teacherId] = {};
    }

    if (!teacherPeriods[teacherId][day]) {
      teacherPeriods[teacherId][day] = [];
    }

    teacherPeriods[teacherId][day].push(
      period
    );

  }

  function hasThreeConsecutiveClasses(
    teacherId,
    day,
    newPeriod
  ) {

    const periods = [

      ...(teacherPeriods[teacherId]?.[day] || []),

      newPeriod,

    ];

    const indexes = periods

      .map((period) =>
        PERIOD_ORDER.indexOf(period)
      )

      .filter((index) => index >= 0)

      .sort((a, b) => a - b);

    let consecutive = 1;

    for (let i = 1; i < indexes.length; i++) {

      if (
        indexes[i] ===
        indexes[i - 1] + 1
      ) {

        consecutive++;

        if (consecutive > 3) {
          return true;
        }

      } else {

        consecutive = 1;

      }

    }

    return false;

  }

  // ==========================================
  // Result
  // ==========================================

  const result = [];


  // ==========================================
  // Common Teacher Filter
  // ==========================================

  function getEligibleTeachers(
    routine,
    matcher
  ) {

    return teachers
      .filter((t) => {

        if (!t.provisionalEnabled)
          return false;

        if (
          getClassNumber(routine.className) >
          (t.maxClass ?? 12)
        )
          return false;

        if (t.id === routine.teacherId)
          return false;

        if (isTeacherAbsent(t.id))
          return false;

        if (
          isTeacherBusy(
            t.id,
            routine.time,
            routine.day
          )
        )
          return false;

        if (
          alreadyAssigned(
            t.id,
            routine.day,
            routine.time
          )
        )
          return false;

        if (
          isTeacherOverloaded(t.id)
        )
          return false;

        // Normal + Provisional
        if (
          hasThreeConsecutiveClasses(
            t.id,
            routine.day,
            routine.period
          )
        )
          return false;

        return matcher(t);

      })
      .sort((a, b) => {

        if (
          (a.priority ?? 0) !==
          (b.priority ?? 0)
        ) {
          return (
            (b.priority ?? 0) -
            (a.priority ?? 0)
          );
        }

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

  }
  // ==========================================
  // Build Provisional Routine
  // ==========================================

  for (const routine of routines) {

    // Teacher Present
    if (!isTeacherAbsent(routine.teacherId)) {

      result.push({
        ...routine,
        isAbsent: false,
        substituteTeacher: null,
        reason: null,
      });

      continue;

    }

    // XI / XII Skip

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

    // ==========================================
    // Priority-1 : Main Subject
    // ==========================================

    let freeTeachers = getEligibleTeachers(

      routine,

      (t) =>

        (t.mainSubject || "")
          .toLowerCase() ===
        (routine.subject || "")
          .toLowerCase()

    );

    if (freeTeachers.length > 0) {

      candidate = freeTeachers[0];

      reason = "Main Subject";

    }

    // ==========================================
    // Priority-2 : Optional Subject
    // ==========================================
    if (!candidate) {

      freeTeachers = getEligibleTeachers(

        routine,

        (t) =>

          (t.optionalSubjects || []).some(

            (s) =>

              (s || "").toLowerCase() ===
              (routine.subject || "").toLowerCase()

          )

      );

      if (freeTeachers.length > 0) {

        candidate = freeTeachers[0];

        reason = "Optional Subject";

      }

    }

    // ==========================================
    // Priority-3 : Any Free Teacher
    // ==========================================

    if (!candidate) {

      freeTeachers = getEligibleTeachers(

        routine,

        () => true

      );

      if (freeTeachers.length > 0) {

        candidate = freeTeachers[0];

        reason = "Free Teacher";

      }

    }

    // ==========================================
    // Save Substitute Teacher
    // ==========================================

    if (candidate) {

      assignTeacher(

        candidate.id,

        routine.day,

        routine.time,

        routine.period

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

  // ==========================================
  // Sort Result
  // ==========================================

  result.sort((a, b) => {

    const dayDiff =
      DAY_ORDER.indexOf(a.day) -
      DAY_ORDER.indexOf(b.day);

    if (dayDiff !== 0) {
      return dayDiff;
    }

    return (
      PERIOD_ORDER.indexOf(a.period) -
      PERIOD_ORDER.indexOf(b.period)
    );

  });

  return result;

}