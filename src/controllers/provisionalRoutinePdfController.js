import PDFDocument from "pdfkit";
import prisma from "../prismaClient.js";

import {
  buildProvisionalRoutine,
} from "../utils/provisionalRoutineLogic.js";

import {
  startX,
  startY,
  teacherWidth,
  periodWidth,
  rowHeight,
  MAX_ROWS_PER_PAGE,
  periods,
} from "../utils/pdf/pdfConstants.js";

import {
  drawSchoolHeader,
} from "../utils/pdf/pdfHelpers.js";

import {
  drawTableHeader,
  drawGrid,
} from "../utils/pdf/pdfTable.js";

import {
  drawTeacherRow,
} from "../utils/pdf/pdfRows.js";

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
      req.query.day ||
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


    console.log("========== ABSENT ==========");
    console.log("Absent Count:", absentTeachers.length);

    absentTeachers.forEach((t, i) => {
      console.log(i + 1, t.teacher?.name);
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
    // BUILD PROVISIONAL ROUTINE
    // ========================================

    const provisionalData =
      buildProvisionalRoutine(

        routines,

        teachers,

        absentTeachers.map(
          (t) => t.teacherId
        )

      );
    console.log("========== PROVISIONAL ==========");

    provisionalData
      .filter(r => r.isAbsent)
      .forEach(r => {
        console.log(
          r.teacher?.name,
          r.period,
          r.className,
          r.section
        );
      });
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
    // BUILD TEACHER ROWS
    // ========================================

    const teacherRows = absentTeachers.map((absent) => ({

      teacherId: absent.teacherId,

      teacherName:
        absent.teacher?.name || "-",

      periods: {},

    }));

    // ========================================
    // SORT BY NAME
    // ========================================

    teacherRows.sort((a, b) =>
      a.teacherName.localeCompare(
        b.teacherName
      )
    );

    // ========================================
    // FILL PERIOD DATA
    // ========================================

    teacherRows.forEach((row) => {

      provisionalData
        .filter(
          (item) =>
            item.teacherId === row.teacherId
        )
        .forEach((routine) => {

          row.periods[routine.period] = {

            className:
              routine.className || "",

            section:
              routine.section || "",

            subject:
              routine.subject || "",

            substituteTeacher:
              routine.substituteTeacher?.name || "-",

            reason:
              routine.reason || "",

          };

        });

    });
    console.log("========== TEACHER ROWS ==========");

    teacherRows.forEach(row => {
      console.log(
        row.teacherName,
        Object.keys(row.periods)
      );
    });
    const totalTeachers =
      teacherRows.length;

    // ========================================
    // DRAW PAGE BY PAGE
    // ========================================

    let currentIndex = 0;

    while (currentIndex < totalTeachers) {

      // ----------------------------------------
      // New Page (First Page ছাড়া)
      // ----------------------------------------

      if (currentIndex > 0) {
        doc.addPage();
      }

      // ----------------------------------------
      // Header
      // ----------------------------------------

      drawSchoolHeader(
        doc,
        date,
        day,
        absentTeachers.length
      );

      // ----------------------------------------
      // Table Header
      // ----------------------------------------

      drawTableHeader(
        doc,
        startX,
        startY,
        teacherWidth,
        periodWidth,
        rowHeight,
        periods
      );

      // ----------------------------------------
      // Grid
      // ----------------------------------------
      const remaining =
        totalTeachers - currentIndex;

      const rowsThisPage = Math.min(
        MAX_ROWS_PER_PAGE,
        remaining
      );

      const pageRows = teacherRows.slice(
        currentIndex,
        currentIndex + rowsThisPage
      );
      drawGrid(
        doc,
        startX,
        startY,
        teacherWidth,
        periodWidth,
        rowHeight,
        rowsThisPage,
        periods
      );


      console.log("========== PAGE ==========");
      console.log(
        "Page:",
        currentIndex / MAX_ROWS_PER_PAGE + 1
      );

      pageRows.forEach((t) => {
        console.log(t.teacherName);
      });

      pageRows.forEach((row, index) => {

        const y =
          startY +
          rowHeight +
          (index * rowHeight);

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
      doc.save();

      doc.font("Helvetica-Oblique");
      doc.fontSize(8);

      doc.text(
        `Generated On : ${new Date().toLocaleString()}`,
        20,
        doc.page.height - 25,
        {
          width: 250,
          lineBreak: false
        }
      );

      doc.restore();

      currentIndex += rowsThisPage;

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