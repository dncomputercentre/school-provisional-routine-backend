import PDFDocument from "pdfkit";
import prisma from "../prismaClient.js";
import {
  buildProvisionalRoutine,
} from "../utils/provisionalRoutineLogic.js";

// ========================================
// SCHOOL HEADER
// ========================================

function drawSchoolHeader(
  doc,
  date,
  day,
  absentCount
) {

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor("#1E3A8A")
    .text(
      "Bhangar High School (H.S)",
      {
        align: "center",
      }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("black")
    .text(
      "Bhangar, South 24 Parganas",
      {
        align: "center",
      }
    );

  doc
    .moveTo(20, 58)
    .lineTo(
      doc.page.width - 20,
      58
    )
    .lineWidth(1)
    .strokeColor("#1E3A8A")
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("black");

  doc.text(
    `Date : ${date}`,
    430,
    82
  );

  doc.text(
    `Day : ${day}`,
    560,
    82
  );

  doc.text(
    `Absent Teacher : ${absentCount}`,
    675,
    82
  );

}

// ========================================
// TABLE HEADER
// ========================================

function drawTableHeader(
  doc,
  startX,
  startY,
  teacherWidth,
  periodWidth,
  rowHeight,
  periods
) {

  // ===========================
  // Teacher Header
  // ===========================

  doc
    .save()
    .fillColor("#DCEAFB")
    .rect(
      startX,
      startY,
      teacherWidth,
      rowHeight
    )
    .fill()
    .restore();

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
    .fillColor("black")
    .text(
      "Absent Teacher",
      startX,
      startY + 15,
      {
        width: teacherWidth,
        align: "center",
      }
    );

  // ===========================
  // Period Headers
  // ===========================

  periods.forEach((period, index) => {

    const x =
      startX +
      teacherWidth +
      index * periodWidth;

    doc
      .save()
      .fillColor("#DCEAFB")
      .rect(
        x,
        startY,
        periodWidth,
        rowHeight
      )
      .fill()
      .restore();

    doc
      .rect(
        x,
        startY,
        periodWidth,
        rowHeight
      )
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("black")
      .text(
        period.name,
        x,
        startY + 6,
        {
          width: periodWidth,
          align: "center",
        }
      );

    doc
      .font("Helvetica")
      .fontSize(6)
      .text(
        `(${period.time})`,
        x,
        startY + 18,
        {
          width: periodWidth,
          align: "center",
        }
      );

  });

}

// ========================================
// DRAW TABLE GRID
// ========================================

function drawGrid(
  doc,
  startX,
  startY,
  teacherWidth,
  periodWidth,
  rowHeight,
  totalRows,
  periods
) {

  for (let row = 0; row < totalRows; row++) {

    const y =
      startY +
      rowHeight +
      row * rowHeight;

    // ===========================
    // Teacher Column
    // ===========================

    doc
      .rect(
        startX,
        y,
        teacherWidth,
        rowHeight
      )
      .stroke();

    // ===========================
    // Period Columns
    // ===========================

    periods.forEach((_, col) => {

      const x =
        startX +
        teacherWidth +
        col * periodWidth;

      doc
        .rect(
          x,
          y,
          periodWidth,
          rowHeight
        )
        .stroke();

    });

  }

}

// ========================================
// DRAW ONE TEACHER ROW
// ========================================

function drawTeacherRow(
  doc,
  row,
  y,
  startX,
  teacherWidth,
  periodWidth,
  periods
) {

  // ===========================
  // Teacher Name
  // ===========================

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("black")
    .text(
      row.teacherName,
      startX + 3,
      y + 18,
      {
        width: teacherWidth - 6,
        align: "center",
      }
    );

  // ===========================
  // Period Data
  // ===========================

  periods.forEach((period, colIndex) => {

    const info =
      row.periods[period.name];

    if (!info)
      return;

    const x =
      startX +
      teacherWidth +
      colIndex * periodWidth;

    // ===========================
    // Class + Section
    // ===========================

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("black")
      .text(
        `${info.className}-${info.section}`,
        x + 2,
        y + 4,
        {
          width: periodWidth - 4,
          align: "center",
        }
      );

    // ===========================
    // Subject
    // ===========================

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("black")
      .text(
        info.subject,
        x + 2,
        y + 16,
        {
          width: periodWidth - 4,
          align: "center",
        }
      );

    // ===========================
    // Substitute Teacher
    // ===========================

    doc
      .font("Helvetica-Bold")
      .fontSize(7)
      .fillColor("#008000")
      .text(
        info.substituteTeacher,
        x + 2,
        y + 28,
        {
          width: periodWidth - 4,
          align: "center",
        }
      );

    // ===========================
    // Reason
    // ===========================

    doc
      .font("Helvetica")
      .fontSize(6)
      .fillColor("#555555")
      .text(
        info.reason,
        x + 2,
        y + 40,
        {
          width: periodWidth - 4,
          align: "center",
        }
      );

    // আবার Black Color

    doc.fillColor("black");

  });

}

// ========================================
// DRAW FOOTER
// ========================================

function drawFooter(
  doc,
  signY
) {

  // ===========================
  // Generated Time
  // ===========================

  doc
    .font("Helvetica-Oblique")
    .fontSize(9)
    .fillColor("black")
    .text(
      `Generated On : ${new Date().toLocaleString()}`,
      25,
      signY + 25
    );

  // ===========================
  // Signature Line
  // ===========================

  doc
    .moveTo(650, signY)
    .lineTo(790, signY)
    .lineWidth(1)
    .strokeColor("black")
    .stroke();

  // ===========================
  // Signature Text
  // ===========================

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("black")
    .text(
      "H.M Signature & Seal",
      650,
      signY + 8,
      {
        width: 140,
        align: "center",
      }
    );

}


export const generateProvisionalRoutinePdf = async (
  req,
  res
) => {

  try {

    // ========================================
    // GET DATE
    // ========================================

    const { date } = req.query;

    if (!date) {

      return res.status(400).json({
        success: false,
        message: "Date is required",
      });

    }

    // ========================================
    // DATE SETTINGS
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
    // LOAD CLASS ROUTINE
    // ========================================

    const routines =
      await prisma.classRoutine.findMany({

        where: {
          day,
        },

        include: {
          teacher: true,
        },

        orderBy: {
          time: "asc",
        },

      });

    // ========================================
    // LOAD ABSENT TEACHERS
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

        orderBy: {
          teacher: {
            name: "asc",
          },
        },

      });

    // ========================================
    // LOAD ALL TEACHERS
    // ========================================

    const teachers =
      await prisma.schoolTeacher.findMany({

        orderBy: {
          name: "asc",
        },

      });

    // ========================================
    // ABSENT IDS
    // ========================================

    const absentIds =
      absentTeachers.map(
        (a) => a.teacherId
      );

    // ========================================
    // BUILD PROVISIONAL ROUTINE
    // (Same Logic as Mobile)
    // ========================================

    const provisionalData =
      buildProvisionalRoutine(
        routines,
        teachers,
        absentIds
      );

    // ========================================
    // PDF SETUP
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
    // DRAW HEADER
    // ========================================

    drawSchoolHeader(
      doc,
      date,
      day,
      absentTeachers.length
    );


    // ========================================
    // TABLE SETTINGS
    // ========================================

    const startX = 20;
    const startY = 115;

    const teacherWidth = 145;
    const periodWidth = 82;
    const rowHeight = 48;

    const periods = [
      {
        name: "First",
        time: "10:50-11:30",
      },
      {
        name: "Second",
        time: "11:30-12:10",
      },
      {
        name: "Third",
        time: "12:10-12:50",
      },
      {
        name: "Fourth",
        time: "12:50-1:30",
      },
      {
        name: "Fifth",
        time: "2:10-2:45",
      },
      {
        name: "Sixth",
        time: "2:45-3:20",
      },
      {
        name: "Seventh",
        time: "3:20-3:55",
      },
      {
        name: "Eight",
        time: "3:55-4:30",
      },
    ];

    // ========================================
    // DRAW TABLE HEADER
    // ========================================

    drawTableHeader(
      doc,
      startX,
      startY,
      teacherWidth,
      periodWidth,
      rowHeight,
      periods
    );
    // ========================================
    // DRAW GRID
    // ========================================

    const totalRows = 14;

    drawGrid(
      doc,
      startX,
      startY,
      teacherWidth,
      periodWidth,
      rowHeight,
      totalRows,
      periods
    );
    // ========================================
    // GROUP ABSENT TEACHERS
    // ========================================

    const teacherRows = absentTeachers.map(
      (absent) => ({

        teacherId: absent.teacherId,

        teacherName:
          absent.teacher?.name || "",

        periods: {},

      })
    );

    // ========================================
    // SORT TEACHERS
    // ========================================

    teacherRows.sort((a, b) =>
      a.teacherName.localeCompare(
        b.teacherName
      )
    );

    // ========================================
    // BUILD PERIOD WISE DATA
    // (Same Logic as Mobile)
    // ========================================

    for (const row of teacherRows) {

      const teacherRoutine =
        provisionalData.filter(
          (item) =>
            item.teacherId ===
            row.teacherId
        );

      teacherRoutine.forEach((routine) => {
        row.periods[
          routine.period
        ] = {

          className:
            routine.className,

          section:
            routine.section,

          subject:
            routine.subject,

          time:
            routine.time,

          substituteTeacher:
            routine.substituteTeacher
              ?.name || "-",

          reason:
            routine.reason || "",

        };

      });

    }



    // ========================================
    // DRAW TABLE DATA
    // ========================================

    const MAX_ROWS_PER_PAGE = 10;

    let currentIndex = 0;

    while (currentIndex < teacherRows.length) {

      // নতুন Page (First Page ছাড়া)

      if (currentIndex > 0) {

        doc.addPage();

        drawSchoolHeader(
          doc,
          date,
          day,
          absentTeachers.length
        );

        drawTableHeader(
          doc,
          startX,
          startY,
          teacherWidth,
          periodWidth,
          rowHeight,
          periods
        );

        drawGrid(
          doc,
          startX,
          startY,
          teacherWidth,
          periodWidth,
          rowHeight,
          totalRows,
          periods
        );

      }

      const pageRows =
        teacherRows.slice(
          currentIndex,
          currentIndex + MAX_ROWS_PER_PAGE
        );

      pageRows.forEach((row, index) => {

        const y =
          startY +
          rowHeight +
          index * rowHeight;

        drawTeacherRow(
          doc,
          row,
          y,
          startX,
          teacherWidth,
          periodWidth,
          periods
        );

      });
      const signY =
        startY +
        rowHeight +
        totalRows * rowHeight +
        35;

      drawFooter(doc, signY);
      currentIndex += MAX_ROWS_PER_PAGE;

    }

    // ========================================
    // END PDF
    // ========================================

    doc.end();

  } catch (err) {

    console.error(
      "Generate Provisional PDF Error:",
      err
    );

    if (!res.headersSent) {

      res.status(500).json({

        success: false,

        message:
          "Failed to generate provisional routine PDF.",

        error: err.message,

      });

    }

  }

};
