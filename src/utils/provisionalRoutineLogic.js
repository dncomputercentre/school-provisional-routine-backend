// backend/src/utils/provisionalRoutineLogic.js

export function buildProvisionalRoutine(
  routines = [],
  teachers = [],
  absentIds = []
) {
  // =========================================================
  // ABSENT TEACHERS
  // =========================================================

  const absentSet = new Set(absentIds);

  // =========================================================
  // PERIOD / DAY ORDER
  // =========================================================

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

  // =========================================================
  // RULES
  // =========================================================
  //
  // 1. Normal + Provisional <= 4 classes/day
  // 2. Maximum 2 consecutive classes
  // 3. Absent teachers can never be substitutes
  // 4. maxClass controls the highest class a teacher can take
  // 5. XI/XII never receive provisional/substitute teacher
  // 6. Existing maxProvisional is also respected
  // 7. Hardest-to-fill absent classes are assigned first
  // 8. Within the same subject-match level, workload is balanced
  //
  // =========================================================

  const MAX_TOTAL_CLASSES = 4;
  const MAX_CONSECUTIVE_CLASSES = 2;

  // =========================================================
  // NORMALIZE TEXT
  // =========================================================

  function normalize(value) {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  // =========================================================
  // PERIOD INDEX
  // =========================================================

  function getPeriodIndex(period) {
    const value = normalize(period);

    const aliases = {
      first: "First",
      second: "Second",
      third: "Third",
      fourth: "Fourth",
      fifth: "Fifth",
      sixth: "Sixth",
      seventh: "Seventh",

      // Database-এ Eight থাকলেও support করবে
      eighth: "Eight",
      eight: "Eight",

      // Number format support
      "1": "First",
      "2": "Second",
      "3": "Third",
      "4": "Fourth",
      "5": "Fifth",
      "6": "Sixth",
      "7": "Seventh",
      "8": "Eight",
    };

    const canonical = aliases[value] || period;

    return PERIOD_ORDER.indexOf(canonical);
  }

  // =========================================================
  // DAY INDEX
  // =========================================================

  function getDayIndex(day) {
    return DAY_ORDER.findIndex(
      (item) =>
        normalize(item) === normalize(day)
    );
  }

  // =========================================================
  // SENIOR CLASS
  // =========================================================
  //
  // XI / XII class-এ provisional হবে না।
  //
  // =========================================================

  function isSeniorClass(className) {
    const value = normalize(className);

    return (
      value.includes("class-xi") ||
      value.includes("class-xii") ||
      value === "xi" ||
      value === "xii"
    );
  }

  // =========================================================
  // GET CLASS NUMBER
  // =========================================================

  function getClassNumber(className) {
    const value = normalize(className);

    const map = {
      "class-v": 5,
      "class-vi": 6,
      "class-vii": 7,
      "class-viii": 8,
      "class-ix": 9,
      "class-x": 10,
      "class-xi": 11,
      "class-xii": 12,

      // Short format
      v: 5,
      vi: 6,
      vii: 7,
      viii: 8,
      ix: 9,
      x: 10,
      xi: 11,
      xii: 12,
    };

    return map[value] ?? 12;
  }

  // =========================================================
  // TEACHER PROVISIONAL LOAD
  // =========================================================

  const teacherLoad = {};

  teachers.forEach((teacher) => {
    teacherLoad[teacher.id] = 0;
  });

  // =========================================================
  // NORMAL CLASS COUNT
  // =========================================================

  function getNormalClassCount(teacherId) {
    return routines.filter(
      (routine) =>
        routine.teacherId === teacherId
    ).length;
  }

  // =========================================================
  // PROVISIONAL CLASS COUNT
  // =========================================================

  function getProvisionalClassCount(teacherId) {
    return teacherLoad[teacherId] || 0;
  }

  // =========================================================
  // TOTAL CLASS COUNT
  // =========================================================

  function getTotalClassCount(teacherId) {
    return (
      getNormalClassCount(teacherId) +
      getProvisionalClassCount(teacherId)
    );
  }

  // =========================================================
  // TEACHER PERIOD STORE
  // =========================================================
  //
  // এখানে Normal + Provisional দুটোই থাকবে।
  //
  // =========================================================

  const teacherPeriods = {};

  function ensureTeacherDay(
    teacherId,
    day
  ) {
    if (!teacherPeriods[teacherId]) {
      teacherPeriods[teacherId] = {};
    }

    if (!teacherPeriods[teacherId][day]) {
      teacherPeriods[teacherId][day] = [];
    }

    return teacherPeriods[teacherId][day];
  }

  // Existing normal classes load
  routines.forEach((routine) => {
    ensureTeacherDay(
      routine.teacherId,
      routine.day
    ).push(routine.period);
  });

  // =========================================================
  // PROVISIONAL TIME MAP
  // =========================================================

  const provisionalTimeMap = {};

  function getTimeKey(
    teacherId,
    day,
    time
  ) {
    return `${teacherId}_${normalize(
      day
    )}_${normalize(time)}`;
  }

  function alreadyAssigned(
    teacherId,
    day,
    time
  ) {
    return (
      provisionalTimeMap[
        getTimeKey(
          teacherId,
          day,
          time
        )
      ] === true
    );
  }

  // =========================================================
  // TEACHER BUSY AT SAME TIME
  // =========================================================

  function isTeacherBusy(
    teacherId,
    day,
    time
  ) {
    return routines.some(
      (routine) =>
        routine.teacherId === teacherId &&
        normalize(routine.day) ===
          normalize(day) &&
        normalize(routine.time) ===
          normalize(time)
    );
  }

  // =========================================================
  // TEACHER OVERLOAD
  // =========================================================
  //
  // Normal + Provisional <= 4
  //
  // পাশাপাশি existing maxProvisional-ও মানবে।
  //
  // =========================================================

  function isTeacherOverloaded(
    teacherId
  ) {
    const provisionalCount =
      getProvisionalClassCount(
        teacherId
      );

    const totalCount =
      getTotalClassCount(
        teacherId
      );

    // Maximum total class
    if (
      totalCount >=
      MAX_TOTAL_CLASSES
    ) {
      return true;
    }

    // Existing maxProvisional rule
    const teacher =
      teachers.find(
        (item) =>
          item.id === teacherId
      );

    if (
      provisionalCount >=
      (teacher?.maxProvisional ?? 2)
    ) {
      return true;
    }

    return false;
  }

  // =========================================================
  // CONSECUTIVE CLASS CHECK
  // =========================================================
  //
  // Allowed:
  //
  // 1 -> 2 -> OFF -> 3
  //
  // Not allowed:
  //
  // 1 -> 2 -> 3
  //
  // Normal + Provisional দুটোই count হবে।
  //
  // =========================================================

  function hasTooManyConsecutiveClasses(
    teacherId,
    day,
    newPeriod
  ) {
    const periods = [
      ...ensureTeacherDay(
        teacherId,
        day
      ),
      newPeriod,
    ];

    const indexes = periods
      .map(getPeriodIndex)
      .filter(
        (index) => index >= 0
      )
      .sort(
        (a, b) => a - b
      );

    if (indexes.length === 0) {
      return false;
    }

    let consecutive = 1;

    for (
      let i = 1;
      i < indexes.length;
      i++
    ) {
      if (
        indexes[i] ===
        indexes[i - 1] + 1
      ) {
        consecutive++;

        // 3 consecutive হলে reject
        if (
          consecutive >
          MAX_CONSECUTIVE_CLASSES
        ) {
          return true;
        }
      } else {
        consecutive = 1;
      }
    }

    return false;
  }

  // =========================================================
  // SUBJECT MATCH LEVEL
  // =========================================================
  //
  // 0 = Main Subject
  // 1 = Optional Subject
  // 2 = Free Teacher
  //
  // =========================================================

  function getSubjectMatchLevel(
    teacher,
    routine
  ) {
    const subject =
      normalize(
        routine.subject
      );

    // Main Subject
    if (
      normalize(
        teacher.mainSubject
      ) === subject
    ) {
      return 0;
    }

    // Optional Subject
    const optionalSubjects =
      Array.isArray(
        teacher.optionalSubjects
      )
        ? teacher.optionalSubjects
        : [];

    if (
      optionalSubjects.some(
        (item) =>
          normalize(item) ===
          subject
      )
    ) {
      return 1;
    }

    // Free Teacher
    return 2;
  }

  // =========================================================
  // BASIC ELIGIBILITY
  // =========================================================

  function isEligibleTeacher(
    teacher,
    routine
  ) {
    // Provisional enabled?
    if (
      !teacher.provisionalEnabled
    ) {
      return false;
    }

    // নিজের class নিজে নিতে পারবে না
    if (
      teacher.id ===
      routine.teacherId
    ) {
      return false;
    }

    // Absent teacher substitute হতে পারবে না
    if (
      absentSet.has(
        teacher.id
      )
    ) {
      return false;
    }

    // Teacher-এর maxClass check
    if (
      getClassNumber(
        routine.className
      ) >
      (teacher.maxClass ?? 12)
    ) {
      return false;
    }

    // একই time-এ normal class থাকলে বাদ
    if (
      isTeacherBusy(
        teacher.id,
        routine.day,
        routine.time
      )
    ) {
      return false;
    }

    // একই time-এ provisional থাকলে বাদ
    if (
      alreadyAssigned(
        teacher.id,
        routine.day,
        routine.time
      )
    ) {
      return false;
    }

    // Total workload check
    if (
      isTeacherOverloaded(
        teacher.id
      )
    ) {
      return false;
    }

    // Maximum 2 consecutive
    if (
      hasTooManyConsecutiveClasses(
        teacher.id,
        routine.day,
        routine.period
      )
    ) {
      return false;
    }

    return true;
  }

  // =========================================================
  // GET ALL ELIGIBLE CANDIDATES
  // =========================================================

  function getEligibleCandidates(
    routine
  ) {
    return teachers
      .filter((teacher) =>
        isEligibleTeacher(
          teacher,
          routine
        )
      )
      .map((teacher) => ({
        teacher,

        matchLevel:
          getSubjectMatchLevel(
            teacher,
            routine
          ),

        totalClasses:
          getTotalClassCount(
            teacher.id
          ),

        provisionalClasses:
          getProvisionalClassCount(
            teacher.id
          ),

        priority:
          teacher.priority ?? 0,
      }));
  }

  // =========================================================
  // SORT CANDIDATES
  // =========================================================
  //
  // Subject priority:
  //
  // Main > Optional > Free
  //
  // Same subject group হলে:
  //
  // কম total workload আগে
  // কম provisional workload আগে
  // বেশি priority পরে
  // নাম alphabetical
  //
  // =========================================================

  function sortCandidates(
    candidates
  ) {
    return [...candidates].sort(
      (a, b) => {

        // Subject match
        if (
          a.matchLevel !==
          b.matchLevel
        ) {
          return (
            a.matchLevel -
            b.matchLevel
          );
        }

        // Total workload
        if (
          a.totalClasses !==
          b.totalClasses
        ) {
          return (
            a.totalClasses -
            b.totalClasses
          );
        }

        // Provisional workload
        if (
          a.provisionalClasses !==
          b.provisionalClasses
        ) {
          return (
            a.provisionalClasses -
            b.provisionalClasses
          );
        }

        // Priority
        if (
          a.priority !==
          b.priority
        ) {
          return (
            b.priority -
            a.priority
          );
        }

        // Name
        return String(
          a.teacher.name ?? ""
        ).localeCompare(
          String(
            b.teacher.name ?? ""
          )
        );
      }
    );
  }

  // =========================================================
  // HARDNESS SCORE
  // =========================================================
  //
  // যে absent class-এর জন্য eligible teacher
  // কম, সেটি আগে assign করার চেষ্টা হবে।
  //
  // Example:
  //
  // Class A -> 2 teachers
  // Class B -> 8 teachers
  //
  // Class A আগে।
  //
  // এতে difficult class-এর teacher আগে secure
  // করা যায়।
  //
  // =========================================================

  function getJobScore(
    routine
  ) {
    const candidates =
      getEligibleCandidates(
        routine
      );

    const candidateCount =
      candidates.length;

    const mainCount =
      candidates.filter(
        (item) =>
          item.matchLevel === 0
      ).length;

    const optionalCount =
      candidates.filter(
        (item) =>
          item.matchLevel === 1
      ).length;

    let score =
      candidateCount * 100;

    // Main subject teacher নেই
    if (
      mainCount === 0
    ) {
      score -= 20;
    }

    // Main + Optional দুটোই নেই
    if (
      mainCount === 0 &&
      optionalCount === 0
    ) {
      score -= 20;
    }

    return {
      candidateCount,
      score,
    };
  }

  // =========================================================
  // ASSIGN TEACHER
  // =========================================================

  function assignTeacher(
    teacherId,
    day,
    time,
    period
  ) {
    provisionalTimeMap[
      getTimeKey(
        teacherId,
        day,
        time
      )
    ] = true;

    teacherLoad[teacherId] =
      (teacherLoad[teacherId] ||
        0) + 1;

    ensureTeacherDay(
      teacherId,
      day
    ).push(period);
  }

  // =========================================================
  // RESULT OBJECT
  // =========================================================

  function makeResult(
    routine,
    substituteTeacher,
    reason
  ) {
    return {
      ...routine,

      isAbsent: true,

      substituteTeacher:
        substituteTeacher ||
        null,

      reason,
    };
  }

  // =========================================================
  // STEP 1
  // SEPARATE NORMAL & ABSENT JOBS
  // =========================================================

  const result = [];
  const absentJobs = [];

  for (
    const routine of routines
  ) {

    // Teacher present
    if (
      !absentSet.has(
        routine.teacherId
      )
    ) {
      result.push({
        ...routine,

        isAbsent: false,

        substituteTeacher:
          null,

        reason: null,
      });

      continue;
    }

    // XI / XII
    if (
      isSeniorClass(
        routine.className
      )
    ) {
      result.push(
        makeResult(
          routine,
          null,
          "Senior Class"
        )
      );

      continue;
    }

    // Provisional assignment-এর জন্য job
    absentJobs.push({
      routine,
    });
  }

  // =========================================================
  // STEP 2
  // HARDEST-TO-FILL FIRST
  // =========================================================

  while (
    absentJobs.length > 0
  ) {

    let bestIndex = 0;
    let bestMeta = null;

    for (
      let i = 0;
      i < absentJobs.length;
      i++
    ) {

      const job =
        absentJobs[i];

      const meta =
        getJobScore(
          job.routine
        );

      if (!bestMeta) {
        bestMeta = meta;
        bestIndex = i;
        continue;
      }

      // Fewer candidates = harder
      if (
        meta.candidateCount <
        bestMeta.candidateCount
      ) {
        bestMeta = meta;
        bestIndex = i;
        continue;
      }

      // Same candidate count হলে
      // Day + Period order
      if (
        meta.candidateCount ===
        bestMeta.candidateCount
      ) {

        const current =
          job.routine;

        const best =
          absentJobs[
            bestIndex
          ].routine;

        const currentDay =
          getDayIndex(
            current.day
          );

        const bestDay =
          getDayIndex(
            best.day
          );

        if (
          currentDay <
          bestDay
        ) {
          bestMeta = meta;
          bestIndex = i;
          continue;
        }

        if (
          currentDay ===
          bestDay
        ) {

          const currentPeriod =
            getPeriodIndex(
              current.period
            );

          const bestPeriod =
            getPeriodIndex(
              best.period
            );

          if (
            currentPeriod <
            bestPeriod
          ) {
            bestMeta = meta;
            bestIndex = i;
          }
        }
      }
    }

    // Remove selected job
    const [job] =
      absentJobs.splice(
        bestIndex,
        1
      );

    const routine =
      job.routine;

    // =======================================================
    // RE-CALCULATE CANDIDATES
    // =======================================================
    //
    // কারণ আগের assignment-এর পরে teacher availability
    // পরিবর্তিত হয়েছে।
    //
    // =======================================================

    const candidates =
      sortCandidates(
        getEligibleCandidates(
          routine
        )
      );

    // =======================================================
    // NO SUBSTITUTE
    // =======================================================

    if (
      candidates.length === 0
    ) {
      result.push(
        makeResult(
          routine,
          null,
          "No Substitute Available"
        )
      );

      continue;
    }

    // =======================================================
    // BEST CANDIDATE
    // =======================================================

    const selected =
      candidates[0];

    const candidate =
      selected.teacher;

    let reason =
      "Free Teacher";

    if (
      selected.matchLevel ===
      0
    ) {
      reason =
        "Main Subject";
    } else if (
      selected.matchLevel ===
      1
    ) {
      reason =
        "Optional Subject";
    }

    // =======================================================
    // ASSIGN
    // =======================================================

    assignTeacher(
      candidate.id,
      routine.day,
      routine.time,
      routine.period
    );

    // =======================================================
    // SAVE
    // =======================================================

    result.push(
      makeResult(
        routine,
        candidate,
        reason
      )
    );
  }

  // =========================================================
  // FINAL DISPLAY SORT
  // =========================================================
  //
  // Assignment hardest-first হলেও frontend/PDF-তে
  // normal Day -> Period order থাকবে।
  //
  // =========================================================

  result.sort(
    (a, b) => {

      const dayDiff =
        getDayIndex(a.day) -
        getDayIndex(b.day);

      if (dayDiff !== 0) {
        return dayDiff;
      }

      const periodDiff =
        getPeriodIndex(
          a.period
        ) -
        getPeriodIndex(
          b.period
        );

      if (periodDiff !== 0) {
        return periodDiff;
      }

      return String(
        a.className ?? ""
      ).localeCompare(
        String(
          b.className ?? ""
        )
      );
    }
  );

  return result;
}