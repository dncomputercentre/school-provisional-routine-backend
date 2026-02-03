const prisma = require("../prismaClient");

/* ================= PROVISIONAL ROUTINE GENERATOR ================= */
exports.generateProvisionalRoutine = async (req, res) => {
  try {
    const { className, section } = req.query;

    if (!className || !section) {
      return res.status(400).json({
        success: false,
        message: "className and section are required",
      });
    }

    // 1️⃣ Today date (00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2️⃣ Original routine
    const routines = await prisma.schoolClassRoutine.findMany({
      where: { className, section },
      orderBy: { period: "asc" },
    });

    // 3️⃣ Absent teachers today
    const absentList = await prisma.schoolTeacherAbsent.findMany({
      where: { date: today },
    });
    const absentTeacherIds = absentList.map(a => a.teacherId);

    // 4️⃣ All teachers
    const teachers = await prisma.schoolTeacher.findMany();

    // 5️⃣ Load counter (fair distribution)
    const loadCount = {};
    teachers.forEach(t => (loadCount[t.id] = 0));

    const provisional = [];

    // 6️⃣ Loop periods
    for (const r of routines) {
      // teacher present
      if (!absentTeacherIds.includes(r.teacherId)) {
        loadCount[r.teacherId]++;
        provisional.push({
          period: r.period,
          time: r.time,
          subject: r.subject,
          teacherId: r.teacherId,
          status: "MAIN",
        });
        continue;
      }

      // teacher absent → find replacement
      const eligible = teachers.filter(t =>
        t.mainSubject === r.subject ||
        t.optionalSubjects.includes(r.subject)
      );

      // only present teachers
      const presentEligible = eligible.filter(
        t => !absentTeacherIds.includes(t.id)
      );

      // sort by least load
      presentEligible.sort(
        (a, b) => loadCount[a.id] - loadCount[b.id]
      );

      if (presentEligible.length === 0) {
        provisional.push({
          period: r.period,
          time: r.time,
          subject: r.subject,
          teacherId: null,
          status: "NO_TEACHER",
        });
      } else {
        const selected = presentEligible[0];
        loadCount[selected.id]++;
        provisional.push({
          period: r.period,
          time: r.time,
          subject: r.subject,
          teacherId: selected.id,
          status: "OPTIONAL",
        });
      }
    }

    res.json({
      success: true,
      className,
      section,
      date: today,
      provisionalRoutine: provisional,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
