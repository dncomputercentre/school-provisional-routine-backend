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
      .fontSize(24)
      .fillColor("#1E3A8A")
      .text("Bhangar High School (H.S)", {
        align: "center",
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor("black")
      .text("Bhangar, South 24 Parganas", {
        align: "center",
      });

    // Blue Line
    doc
      .moveTo(20, 58)
      .lineTo(doc.page.width - 20, 58)
      .lineWidth(1)
      .strokeColor("#1E3A8A")
      .stroke();
    doc.moveDown(0.3);

    doc
      .font("Helvetica-Bold")
      .fontSize(11);

    doc.text(`Date : ${date}`, 420, 75);

    doc.text(`Day : ${day}`, 560, 75);

    doc.text(
      `Absent Teacher : ${absentTeachers.length}`,
      690,
      75
    );

    // ========================================
    // TABLE SETTINGS
    // ========================================

    const startX = 20;
    const startY = 115;

    const teacherWidth = 130;
    const periodWidth = 84;
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
    // HEADER CELL
    // ========================================
    // HEADER BACKGROUND

    doc
      .save()
      .fillColor("#F3F7FD")   // খুব হালকা Blue (Black & White print-এও সুন্দর দেখাবে)
      .rect(
        startX,
        startY,
        teacherWidth,
        rowHeight
      )
      .fill()
      .restore();

    // BORDER

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
        .save()
        .fillColor("#F3F7FD")
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
      // ========================================
      // GRID DRAW
      // ========================================

      const totalRows = Math.max(absentTeachers.length + 2, 15);

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

          const info = row.periods[period.name];

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

      const signY =
        doc.page.height - 65;

      // Generated Time
      doc
        .font("Helvetica-Oblique")
        .fontSize(9)

        .text(
          `Generated On : ${new Date().toLocaleString()}`,
          25,
          signY + 25
        );

      // Signature Line
      doc
        .moveTo(650, signY)
        .lineTo(790, signY)
        .stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
          "H.M Signature & Seal",
          650,
          signY + 8,
          {
            width: 140,
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