import PDFDocument from "pdfkit";
import prisma from "../prismaClient.js";

import {
  buildProvisionalRoutine,
} from "../utils/provisionalRoutineLogic.js";

import {
  buildAssignedTeacherRoutine,
} from "../utils/assignedTeacherRoutineLogic.js";

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
  drawAssignedTeacherTableHeader,
  drawGrid,
} from "../utils/pdf/pdfTable.js";

import {
  drawAssignedTeacherRow,
} from "../utils/pdf/pdfRows.js";

// ========================================
// ASSIGNED TEACHER TOTAL CLASS PDF
// ========================================

export const generateAssignedTeacherPdf = async (
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
    // DATE
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
    // LOAD NORMAL ROUTINE
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

    const absentIds =
      absentTeachers.map(
        (item) => item.teacherId
      );

    // ========================================
    // BUILD PROVISIONAL ROUTINE
    // ========================================

    const provisionalRoutine =
      buildProvisionalRoutine(

        routines,

        teachers,

        absentIds

      );

    // ========================================
    // BUILD ASSIGNED TEACHER ROUTINE
    // ========================================

    const assignedTeacherData =
      buildAssignedTeacherRoutine(

        provisionalRoutine,

        routines

      );

    console.log(
      "Assigned Teacher :",
      assignedTeacherData.length
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
      `inline; filename=AssignedTeacher-${date}.pdf`
    );

    doc.pipe(res);

    

        // ========================================
    // BUILD TEACHER ROWS
    // ========================================

    const teacherRows = assignedTeacherData.map(
      (teacher) => ({

        teacherId: teacher.teacherId,

        teacherName: teacher.teacherName,

        periods: teacher.periods,

        totalNormal:
          teacher.totalNormal,

        totalProvisional:
          teacher.totalProvisional,

        totalClass:
          teacher.totalClass,

      })
    );

    // ========================================
    // SORT BY NAME
    // ========================================

    teacherRows.sort((a, b) =>
      a.teacherName.localeCompare(
        b.teacherName
      )
    );

    const totalTeachers =
      teacherRows.length;

    // ========================================
    // DRAW PAGE BY PAGE
    // ========================================

    let currentIndex = 0;

    while (
      currentIndex < totalTeachers
    ) {

      // ------------------------------------
      // New Page
      // ------------------------------------

      if (currentIndex > 0) {

        doc.addPage();

      }

      // ------------------------------------
      // Header
      // ------------------------------------

      drawSchoolHeader(

        doc,

        date,

        day,

        absentTeachers.length

      );

      // ------------------------------------
      // Table Header
      // ------------------------------------

      drawAssignedTeacherTableHeader(

        doc,

        startX,

        startY,

        teacherWidth,

        periodWidth,

        rowHeight,

        periods

      );

      // ------------------------------------
      // Grid
      // ------------------------------------

      const remaining =
        totalTeachers -
        currentIndex;

      const rowsThisPage =
        Math.min(

          MAX_ROWS_PER_PAGE,

          remaining

        );

      const pageRows =
        teacherRows.slice(

          currentIndex,

          currentIndex +
            rowsThisPage

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

      // ------------------------------------
      // Draw Teacher Row
      // ------------------------------------

      pageRows.forEach(
        (row, index) => {

          const y =
            startY +
            rowHeight +
            index *
              rowHeight;

          drawAssignedTeacherRow(

            doc,

            row,

            y,

            startX,

            teacherWidth,

            periodWidth,

            periods

          );

        }
      );

      currentIndex +=
        rowsThisPage;

    }

    // ========================================
    // PDF END
    // ========================================

    doc.end();

  } catch (err) {

    console.log(err);

    if (!res.headersSent) {

      res.status(500).json({

        success: false,

        message:
          "Failed to generate Assigned Teacher PDF.",

        error: err.message,

      });

    }

  }

};