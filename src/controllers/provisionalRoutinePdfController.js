import PDFDocument from "pdfkit";
import prisma from "../prismaClient.js";
import {
  buildProvisionalRoutine,
} from "../utils/provisionalRoutineLogic.js";

// ============================================
// PROVISIONAL ROUTINE PDF
// ============================================

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

    doc
      .moveDown(0.2)
      .font("Helvetica")
      .fontSize(12)
      .text(
        "Bhangar, South 24 Parganas",
        {
          align: "center",
        }
      );

    doc.moveDown(0.3);

    doc
      .font("Helvetica-Bold")
      .fontSize(11);

    doc.text(
      `Date : ${date}`,
      280,
      60
    );

    doc.text(
      `Day : ${day}`,
      450,
      60
    );

    doc.text(
      `Absent Teacher : ${absentTeachers.length}`,
      610,
      60
    );

    // ========================================
    // TABLE SETTINGS
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
    // HEADER CELL
    // ========================================

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
    // PERIOD HEADER
    // ========================================

    periods.forEach((period, index) => {

      const x =
        startX +
        teacherWidth +
        index * periodWidth;

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
        .fontSize(10)
        .text(
          `${period}`,
          x,
          startY + 15,
          {
            width: periodWidth,
            align: "center",
          }
        );

    });

    // ========================================
    // GRID DRAW
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

      // Teacher Column

      doc
        .rect(
          startX,
          y,
          teacherWidth,
          rowHeight
        )
        .stroke();

      // Period Columns

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
    // SORT PERIODS
    // ========================================

    const periodOrder = {

      First: 1,

      Second: 2,

      Third: 3,

      Fourth: 4,

      Fifth: 5,

      Sixth: 6,

      Seventh: 7,

      Eight: 8,

      Extra: 9,

    };

        // ========================================
    // DRAW TABLE DATA
    // ========================================

    teacherRows.forEach((row, rowIndex) => {

      const y =
        startY +
        rowHeight +
        rowIndex * rowHeight;

      // ======================================
      // Absent Teacher Name
      // ======================================

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("black")
        .text(
          row.teacherName,
          startX + 3,
          y + 16,
          {
            width: teacherWidth - 6,
            align: "center",
          }
        );

      // ======================================
      // Period Data
      // ======================================

      periods.forEach((period, colIndex) => {

        const info = row.periods[period];

        if (!info) return;

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
            y + 2,
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
          .text(
            info.subject,
            x + 2,
            y + 13,
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
          .fillColor("#006400")
          .text(
            info.substituteTeacher,
            x + 2,
            y + 24,
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
            y + 35,
            {
              width: periodWidth - 4,
              align: "center",
            }
          );

        doc.fillColor("black");

      });

    });

        // ========================================
    // FOOTER
    // ========================================

    doc.moveTo(
      20,
      doc.page.height - 45
    )
    .lineTo(
      doc.page.width - 20,
      doc.page.height - 45
    )
    .stroke();

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#555555")
      .text(
        "Generated by Bhangar High School Routine Management System",
        20,
        doc.page.height - 35,
        {
          align: "center",
        }
      );

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