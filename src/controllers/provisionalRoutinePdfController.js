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
  totalRows,
  MAX_ROWS_PER_PAGE,
  periods,
} from "../utils/pdf/pdfConstants.js";

import {
  drawSchoolHeader,
  drawFooter,
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

      // ----------------------------------------
      // Current Page Teacher List
      // ----------------------------------------

      const pageRows = teacherRows.slice(
        currentIndex,
        currentIndex + MAX_ROWS_PER_PAGE
      );

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

      drawFooter(
        doc,
        doc.page.height - 70
      );
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