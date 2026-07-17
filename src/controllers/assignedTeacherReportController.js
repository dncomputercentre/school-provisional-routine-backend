// ==========================================
// assignedTeacherReportController.js
// Part-1
// Imports
// Validation
// Date Parse
// Function Skeleton
// ==========================================

import prisma from "../prismaClient.js";

import {
  buildAssignedTeacherReport,
} from "../utils/assignedTeacherReportLogic.js";

// ==========================================
// Assigned Teacher Report
// ==========================================

export const getAssignedTeacherReport = async (
  req,
  res
) => {
  console.log("===== Assigned Teacher Report API =====");
  console.log("Query:", req.query);
  try {

    // ======================================
    // Query
    // ======================================

    const {
      from,
      to,
    } = req.query;

    // ======================================
    // Validation
    // ======================================

    if (!from || !to) {

      return res.status(400).json({

        success: false,

        message:
          "From and To date are required.",

      });

    }

    // ======================================
    // Date Parse
    // ======================================

    const startDate =
      new Date(from);

    const endDate =
      new Date(to);

    if (

      isNaN(startDate.getTime()) ||

      isNaN(endDate.getTime())

    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid date format.",

      });

    }

    if (startDate > endDate) {

      return res.status(400).json({

        success: false,

        message:
          "From date cannot be greater than To date.",

      });

    }

    // ======================================
    // Build Report
    // ======================================

    const report =
      await buildAssignedTeacherReport(

        startDate,

        endDate,

        prisma

      );
    console.log("Report Length:", report.length);

    // ======================================
    // Response
    // ======================================
    console.log("Response Sent");
    const smallReport = report.map(item => ({
      teacherId: item.teacherId,
      teacherName: item.teacherName,
      totalProvisional: item.totalProvisional,
    }));

    res.json({

      success: true,

      from,

      to,

      totalTeachers: smallReport.length,

      data: smallReport,

    });
  } catch (err) {

    console.log(
      "Assigned Teacher Report Error:"
    );

    console.log(err);

    res.status(500).json({

      success: false,

      message:
        "Failed to generate assigned teacher report.",

      error: err.message,

    });

  }

};