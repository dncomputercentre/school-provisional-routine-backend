// ==========================================
// assignedTeacherRoutineLogic.js
// Part-1A
// Helper Functions + Skeleton
// ==========================================

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
  "Eighth",
];

// ==========================================
// Create Empty Period Object
// ==========================================

function createEmptyPeriods() {

  const periods = {};

  PERIOD_ORDER.forEach((period) => {
    periods[period] = null;
  });

  return periods;

}

// ==========================================
// Get Period Index
// ==========================================

function getPeriodIndex(period) {

  return PERIOD_ORDER.indexOf(period);

}

// ==========================================
// Sort Routine By Period
// ==========================================

function sortRoutineByPeriod(routines = []) {

  return [...routines].sort((a, b) => {

    return (
      getPeriodIndex(a.period) -
      getPeriodIndex(b.period)
    );

  });

}

// ==========================================
// Create Teacher Object
// ==========================================

function createTeacherObject(teacher) {

  return {

    teacherId: teacher.id,

    teacherName: teacher.name,

    periods: createEmptyPeriods(),
    classes: [],

    totalNormal: 0,

    totalProvisional: 0,

    totalClass: 0,

  };

}

// ==========================================
// Add Normal Class
// ==========================================

function addNormalClass(
  teacherObj,
  routine
) {

  if (!teacherObj) return;

  teacherObj.periods[routine.period] = {

    className: routine.className,

    section: routine.section,

    subject: routine.subject,

    period: routine.period,

    time: routine.time,

    type: "Normal",

  };

  teacherObj.totalNormal++;

  teacherObj.totalClass++;

}

// ==========================================
// Add Provisional Class
// ==========================================

function addProvisionalClass(
  teacherObj,
  routine
) {

  if (!teacherObj) return;

  teacherObj.periods[routine.period] = {

    className: routine.className,

    section: routine.section,

    subject: routine.subject,

    period: routine.period,

    time: routine.time,

    type: "Provisional",

    absentTeacher: {
      id: routine.teacherId,
      name: routine.teacher?.name || "",
    },

  };

  teacherObj.totalProvisional++;

  teacherObj.totalClass++;

}

// ==========================================
// Main Function
// ==========================================

export function buildAssignedTeacherRoutine(
  

  provisionalRoutine = [],

  normalRoutine = []

) {

  const teacherMap = {};
  // ==========================================
// Find Assigned Teachers
// ==========================================

const assignedTeacherIds = new Set();

provisionalRoutine.forEach((item) => {

  if (!item.substituteTeacher) return;

  assignedTeacherIds.add(
    item.substituteTeacher.id
  );

});

// ==========================================
// Build Teacher Object
// ==========================================

normalRoutine.forEach((routine) => {

  if (
    !assignedTeacherIds.has(
      routine.teacherId
    )
  ) {
    return;
  }

  if (
    !teacherMap[routine.teacherId]
  ) {

    teacherMap[routine.teacherId] =
      createTeacherObject(
        routine.teacher
      );

  }

  addNormalClass(

    teacherMap[routine.teacherId],

    routine

  );

});

 
// ==========================================
// Provisional Routine Mapping
// ==========================================

provisionalRoutine.forEach((routine) => {

  if (!routine.substituteTeacher) {
    return;
  }

  const teacherId =
    routine.substituteTeacher.id;

  if (!teacherMap[teacherId]) {

    teacherMap[teacherId] =
      createTeacherObject(
        routine.substituteTeacher
      );

  }

  addProvisionalClass(

    teacherMap[teacherId],

    routine

  );

});

  // Coming Next...

  // ===============================
  // Convert To Array
  // ===============================

  Object.values(teacherMap).forEach((teacher) => {

    teacher.totalClass =
        teacher.totalNormal +
        teacher.totalProvisional;

});

  const result = Object.values(
    teacherMap
  );

  result.sort((a, b) =>
    a.teacherName.localeCompare(
      b.teacherName
    )
  );

  return result;

}