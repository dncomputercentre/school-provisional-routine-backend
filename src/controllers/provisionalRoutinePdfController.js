import PDFDocument from "pdfkit";
import prisma from "../prismaClient.js";

// ============================================
// PROVISIONAL ROUTINE PDF
// ============================================

export const generateProvisionalRoutinePdf = async (
  req,
  res
) => {
  try {

    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    // ========================================
    // Date
    // ========================================

    const selectedDate = new Date(date);

    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

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
      dayNames[selectedDate.getDay()];

    // ========================================
    // Load Routine
    // ========================================

    const routines =
      await prisma.classRoutine.findMany({
        where: {
          day,
        },
        include: {
          teacher: true,
        },
        orderBy: [
          {
            period: "asc",
          },
        ],
      });

    // ========================================
    // Load Absent Teachers
    // ========================================

    const absentTeachers =
      await prisma.schoolTeacherAbsent.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          teacher: true,
        },
      });

    // ========================================
    // PDF Setup
    // ========================================

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 20,
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=ProvisionalRoutine-${date}.pdf`
    );

    doc.pipe(res);

    // ========================================
    // HEADER
    // ========================================

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .text(
        "Bhangar High School (H.S)",
        {
          align: "center",
        }
      );

    doc.moveDown(0.4);

    doc
      .font("Helvetica-Bold")
      .fontSize(12);

    doc.text(
      `Date : ${date}`,
      300,
      58
    );

    doc.text(
      `Day : ${day}`,
      470,
      58
    );

    doc.text(
      `Absent Teacher : ${absentTeachers.length}`,
      620,
      58
    );

    // ========================================
    // Table Settings
    // ========================================

    const startX = 20;
    const startY = 90;

    const teacherWidth = 120;
    const periodWidth = 78;
    const rowHeight = 48;

    const periods = [
      "First",
      "Second",
      "Third",
      "Fourth",
      "Fifth",
      "Sixth",
      "Seventh",
      "Eight",
      "Extra",
    ];

        // ========================================
    // TABLE HEADER
    // ========================================

    // Absent Teacher Header

    doc
      .rect(
        startX,
        startY,
        teacherWidth,
        rowHeight
      )
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(
        "Absent Teacher",
        startX,
        startY + 15,
        {
          width: teacherWidth,
          align: "center",
        }
      );

    // ========================================
    // PERIOD HEADERS
    // ========================================

    periods.forEach(
      (period, index) => {

        const x =
          startX +
          teacherWidth +
          index * periodWidth;

        // Cell Border

        doc
          .rect(
            x,
            startY,
            periodWidth,
            rowHeight
          )
          .stroke();

        // Period Name

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(
            `${period} Period`,
            x + 2,
            startY + 5,
            {
              width:
                periodWidth - 4,
              align: "center",
            }
          );

      }
    );

    // ========================================
    // GRID DRAWING
    // ========================================

    const totalRows =
      Math.max(
        absentTeachers.length,
        15
      );

    for (
      let row = 0;
      row < totalRows;
      row++
    ) {

      const y =
        startY +
        rowHeight +
        row * rowHeight;

      // Absent Teacher Column

      doc
        .rect(
          startX,
          y,
          teacherWidth,
          rowHeight
        )
        .stroke();

      // Period Columns

      periods.forEach(
        (_, col) => {

          const x =
            startX +
            teacherWidth +
            col *
              periodWidth;

          doc
            .rect(
              x,
              y,
              periodWidth,
              rowHeight
            )
            .stroke();

        }
      );

    }
    // ========================================
    // GROUP ABSENT TEACHERS
    // ========================================

    const teacherRows = absentTeachers.map(
      (absent) => {

        return {

          teacherId: absent.teacherId,

          teacherName:
            absent.teacher?.name || "",

          periods: {},

        };

      }
    );

    // ========================================
    // BUILD PERIOD WISE DATA
    // ========================================

    for (const row of teacherRows) {

      const teacherRoutine =
        routines.filter(
          (r) =>
            r.teacherId ===
            row.teacherId
        );

      for (const routine of teacherRoutine) {

        // এখানে পরে Substitute Logic
        // যোগ হবে

        row.periods[
          routine.period
        ] = {

          className:
            routine.className,

          section:
            routine.section,

          subject:
            routine.subject,

          originalTeacher:
            routine.teacher?.name ||

            "",

          substituteTeacher:
            "",

          reason: "",

        };

      }

    }
// ========================================
// FIND SUBSTITUTE TEACHER
// ========================================

const teachers = await prisma.schoolTeacher.findMany();

const teacherLoad = {};

teachers.forEach((t) => {
  teacherLoad[t.id] = 0;
});

for (const row of teacherRows) {

  for (const period of Object.keys(row.periods)) {

    const current = row.periods[period];

    const originalRoutine = routines.find(
      (r) =>
        r.teacherId === row.teacherId &&
        r.period === period
    );

    if (!originalRoutine) continue;

    let substitute = null;
    let reason = "";

    // ==========================
    // Priority 1 : Main Subject
    // ==========================

    let candidates = teachers.filter((t) => {

      if (t.id === row.teacherId)
        return false;

      if (
        absentTeachers.some(
          (a) => a.teacherId === t.id
        )
      )
        return false;

      const busy = routines.some(
        (r) =>
          r.teacherId === t.id &&
          r.period === period
      );

      if (busy)
        return false;

      return (
        (t.mainSubject || "").toLowerCase() ===
        (current.subject || "").toLowerCase()
      );

    });

    if (candidates.length > 0) {

      candidates.sort(
        (a, b) =>
          teacherLoad[a.id] -
          teacherLoad[b.id]
      );

      substitute = candidates[0];
      reason = "Main Subject";

    }

    // ==========================
    // Priority 2 : Optional Subject
    // ==========================

    if (!substitute) {

      candidates = teachers.filter((t) => {

        if (t.id === row.teacherId)
          return false;

        if (
          absentTeachers.some(
            (a) => a.teacherId === t.id
          )
        )
          return false;

        const busy = routines.some(
          (r) =>
            r.teacherId === t.id &&
            r.period === period
        );

        if (busy)
          return false;

        return (
          t.optionalSubjects || []
        ).some(
          (s) =>
            (s || "").toLowerCase() ===
            (current.subject || "").toLowerCase()
        );

      });

      if (candidates.length > 0) {

        candidates.sort(
          (a, b) =>
            teacherLoad[a.id] -
            teacherLoad[b.id]
        );

        substitute = candidates[0];
        reason = "Optional Subject";

      }

    }

    // ==========================
    // Priority 3 : Any Free Teacher
    // ==========================

    if (!substitute) {

      candidates = teachers.filter((t) => {

        if (t.id === row.teacherId)
          return false;

        if (
          absentTeachers.some(
            (a) => a.teacherId === t.id
          )
        )
          return false;

        const busy = routines.some(
          (r) =>
            r.teacherId === t.id &&
            r.period === period
        );

        return !busy;

      });

      if (candidates.length > 0) {

        candidates.sort(
          (a, b) =>
            teacherLoad[a.id] -
            teacherLoad[b.id]
        );

        substitute = candidates[0];
        reason = "Free Teacher";

      }

    }

    if (substitute) {

      teacherLoad[substitute.id]++;

      current.substituteTeacher =
        substitute.name;

      current.reason = reason;

    } else {

      current.substituteTeacher =
        "Not Available";

      current.reason =
        "No Substitute";

    }

  }

}
// ========================================
// PART 5
// DRAW TABLE DATA
// ========================================

teacherRows.forEach((row, rowIndex) => {

  const y =
    startY +
    rowHeight +
    rowIndex * rowHeight;

  // ==========================
  // Absent Teacher Name
  // ==========================

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(
      row.teacherName,
      startX + 3,
      y + 16,
      {
        width: teacherWidth - 6,
        align: "center",
      }
    );

  // ==========================
  // Period Columns
  // ==========================

  periods.forEach((period, colIndex) => {

    const x =
      startX +
      teacherWidth +
      colIndex * periodWidth;

    const info = row.periods[period];

    if (!info) return;

    // Class + Section

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        `${info.className}-${info.section}`,
        x + 2,
        y + 2,
        {
          width: periodWidth - 4,
          align: "center",
        }
      );

    // Subject

    doc
      .font("Helvetica")
      .fontSize(8)
      .text(
        info.subject,
        x + 2,
        y + 14,
        {
          width: periodWidth - 4,
          align: "center",
        }
      );

    // Substitute Teacher

    doc
      .font("Helvetica-Bold")
      .fontSize(7)
      .text(
        info.substituteTeacher,
        x + 2,
        y + 26,
        {
          width: periodWidth - 4,
          align: "center",
        }
      );

    // Reason

    doc
      .font("Helvetica")
      .fontSize(6)
      .fillColor("#666666")
      .text(
        info.reason,
        x + 2,
        y + 38,
        {
          width: periodWidth - 4,
          align: "center",
        }
      )
      .fillColor("black");

  });

});

// ========================================
// END PDF
// ========================================

doc.end();

} catch (err) {

  console.log(err);

  res.status(500).json({
    success: false,
    message: err.message,
  });

}

};