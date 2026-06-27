// backend/src/utils/provisionalRoutineLogic.js

const MAX_PROVISIONAL_PER_DAY = 2;

export function buildProvisionalRoutine(
  routines,
  teachers,
  absentIds
) {

  // ===========================
  // Teacher Load
  // ===========================

  const teacherLoad = {};

  teachers.forEach((t) => {
    teacherLoad[t.id] = 0;
  });

  // ===========================
  // Assigned Map
  // ===========================

  const provisionalTimeMap = {};

  // ===========================
  // Helper Functions
  // ===========================

  function isSeniorClass(className) {
    return (
      className.includes("XI") ||
      className.includes("XII")
    );
  }

  function isTeacherAbsent(
    teacherId
  ) {
    return absentIds.includes(
      teacherId
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

  function isTeacherOverloaded(
    teacherId
  ) {
    return (
      teacherLoad[teacherId] >=
      MAX_PROVISIONAL_PER_DAY
    );
  }

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
  // Result
  // ===========================

  const result = [];

    // ===========================
  // Build Provisional Routine
  // ===========================

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

      return (
        (t.mainSubject || "")
          .toLowerCase() ===
        (routine.subject || "")
          .toLowerCase()
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

        return a.name.localeCompare(
          b.name
        );

      });

      candidate = freeTeachers[0];
      reason = "Main Subject";
    }

        // ===========================
    // Priority 2 : Optional Subject
    // ===========================

    if (!candidate) {

      freeTeachers = teachers.filter((t) => {

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

          return a.name.localeCompare(
            b.name
          );

        });

        candidate = freeTeachers[0];
        reason = "Optional Subject";

      }

    }

    // ===========================
    // Priority 3 : Any Free Teacher
    // ===========================

    if (!candidate) {

      freeTeachers = teachers.filter((t) => {

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

          return a.name.localeCompare(
            b.name
          );

        });

        candidate = freeTeachers[0];
        reason = "Free Teacher";

      }

    }

        // ===========================
    // Save Substitute Teacher
    // ===========================

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
  // Sort Result
  // ===========================

  result.sort((a, b) => {

    if (a.day !== b.day) {
      return a.day.localeCompare(b.day);
    }

    return a.time.localeCompare(b.time);

  });
return result;

}