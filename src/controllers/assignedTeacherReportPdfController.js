import PDFDocument from "pdfkit";

import prisma from "../prismaClient.js";

import {
  buildAssignedTeacherReport,
} from "../utils/assignedTeacherReportLogic.js";

// =============================================
// DATE WISE ASSIGNED TEACHER REPORT PDF
// =============================================

export const generateAssignedTeacherReportPdf =
  async (req, res) => {

    try {

      // =============================================
      // Query
      // =============================================

      const {
        from,
        to,
      } = req.query;

      // =============================================
      // Validation
      // =============================================

      if (!from || !to) {

        return res.status(400).json({

          success: false,

          message:
            "From and To date are required.",

        });

      }

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

      // =============================================
      // Load Report Data
      // =============================================

      const teachers =
        await buildAssignedTeacherReport(

          startDate,

          endDate,

          prisma

        );

      // =============================================
      // Sort
      // =============================================

      teachers.sort(

        (a, b) =>

          b.totalProvisional -

          a.totalProvisional

      );

      // =============================================
      // PDF
      // =============================================

      const doc =
        new PDFDocument({

          size: "A4",

          margin: 40,

        });

      res.setHeader(

        "Content-Type",

        "application/pdf"

      );

      res.setHeader(

        "Content-Disposition",

        "inline; filename=AssignedTeacherReport.pdf"

      );

      doc.pipe(res);

         // =============================================
      // HEADER
      // =============================================

      doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .text(
          "BHANGAR HIGH SCHOOL (H.S.)",
          {
            align: "center",
          }
        );

      doc.moveDown(0.15);

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          "Bhangar, South 24 Parganas",
          {
            align: "center",
          }
        );

      doc.moveDown(0.30);

      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(
          "Date Wise Assigned Teacher Report",
          {
            align: "center",
          }
        );

      doc.moveDown(1);

      doc
        .font("Helvetica")
        .fontSize(15)
        .text(
          `From : ${from}`,
          40,
          145
        );

      doc.text(
        `To : ${to}`,
        40,
        175
      );

      doc
        .font("Helvetica-Bold")
        .fontSize(15)
        .text(
          `Total Teachers : ${teachers.length}`,
          350,
          175,
          {
            width: 180,
            align: "right",
          }
        );

      // =============================================
      // TABLE HEADER
      // =============================================

      const startX = 40;

      let startY = 205;

      const slWidth = 45;

      const teacherWidth = 170;

      const totalWidth = 90;

      const detailWidth = 245;

      const rowHeight = 40;

      // SL

      doc
        .rect(
          startX,
          startY,
          slWidth,
          rowHeight
        )
        .stroke();

      // Teacher

      doc
        .rect(
          startX + slWidth,
          startY,
          teacherWidth,
          rowHeight
        )
        .stroke();

      // Total

      doc
        .rect(
          startX +
            slWidth +
            teacherWidth,
          startY,
          totalWidth,
          rowHeight
        )
        .stroke();

      // Details

      doc
        .rect(
          startX +
            slWidth +
            teacherWidth +
            totalWidth,
          startY,
          detailWidth,
          rowHeight
        )
        .stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
          "SL",
          startX,
          startY + 13,
          {
            width: slWidth,
            align: "center",
          }
        );

      doc.text(
        "Teacher",
        startX + slWidth,
        startY + 13,
        {
          width: teacherWidth,
          align: "center",
        }
      );

      doc.text(
        "Total",
        startX +
          slWidth +
          teacherWidth,
        startY + 13,
        {
          width: totalWidth,
          align: "center",
        }
      );

      doc.text(
        "Details",
        startX +
          slWidth +
          teacherWidth +
          totalWidth,
        startY + 13,
        {
          width: detailWidth,
          align: "center",
        }
      );

      startY += rowHeight;
      // =============================================
      // TABLE DATA
      // =============================================

      doc.font("Helvetica");
      doc.fontSize(10);

      teachers.forEach((teacher, index) => {

        // ==========================================
        // Build Details Text
        // ==========================================

        const detailsText =
          teacher.details
            .map((item) => {

              return (
`${item.date}
${item.period}
${item.className}-${item.section}
${item.subject}`
              );

            })
            .join("\n\n");

        // ==========================================
        // Auto Row Height
        // ==========================================

        const detailHeight =
          doc.heightOfString(
            detailsText,
            {
              width: detailWidth - 12,
            }
          );

        const currentRowHeight =
          Math.max(
            45,
            detailHeight + 12
          );

        // ==========================================
        // Auto Page Break
        // ==========================================

        if (
          startY +
            currentRowHeight >
          760
        ) {

          doc.addPage();

          startY = 50;

          // --------------------------
          // Continued Header
          // --------------------------

          doc
            .font("Helvetica-Bold")
            .fontSize(16)
            .text(
              "Assigned Teacher Report (Continued)",
              {
                align: "center",
              }
            );

          startY = 90;

          // Table Header

          doc
            .rect(
              startX,
              startY,
              slWidth,
              rowHeight
            )
            .stroke();

          doc
            .rect(
              startX + slWidth,
              startY,
              teacherWidth,
              rowHeight
            )
            .stroke();

          doc
            .rect(
              startX +
                slWidth +
                teacherWidth,
              startY,
              totalWidth,
              rowHeight
            )
            .stroke();

          doc
            .rect(
              startX +
                slWidth +
                teacherWidth +
                totalWidth,
              startY,
              detailWidth,
              rowHeight
            )
            .stroke();

          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .text(
              "SL",
              startX,
              startY + 13,
              {
                width: slWidth,
                align: "center",
              }
            );

          doc.text(
            "Teacher",
            startX + slWidth,
            startY + 13,
            {
              width: teacherWidth,
              align: "center",
            }
          );

          doc.text(
            "Total",
            startX +
              slWidth +
              teacherWidth,
            startY + 13,
            {
              width: totalWidth,
              align: "center",
            }
          );

          doc.text(
            "Details",
            startX +
              slWidth +
              teacherWidth +
              totalWidth,
            startY + 13,
            {
              width: detailWidth,
              align: "center",
            }
          );

          startY += rowHeight;

        }

        // ==========================================
        // Draw Row
        // ==========================================

        doc
          .rect(
            startX,
            startY,
            slWidth,
            currentRowHeight
          )
          .stroke();

        doc
          .rect(
            startX + slWidth,
            startY,
            teacherWidth,
            currentRowHeight
          )
          .stroke();

        doc
          .rect(
            startX +
              slWidth +
              teacherWidth,
            startY,
            totalWidth,
            currentRowHeight
          )
          .stroke();

        doc
          .rect(
            startX +
              slWidth +
              teacherWidth +
              totalWidth,
            startY,
            detailWidth,
            currentRowHeight
          )
          .stroke();

        // ==========================================
        // SL
        // ==========================================

        doc
          .font("Helvetica")
          .fontSize(10)
          .text(
            index + 1,
            startX,
            startY + 12,
            {
              width: slWidth,
              align: "center",
            }
          );

        // ==========================================
        // Teacher
        // ==========================================

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(
            teacher.teacherName,
            startX +
              slWidth +
              5,
            startY + 8
          );

        // ==========================================
        // Total
        // ==========================================

        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .fillColor("red")
          .text(
            teacher.totalProvisional,
            startX +
              slWidth +
              teacherWidth,
            startY + 12,
            {
              width: totalWidth,
              align: "center",
            }
          );

        doc.fillColor("black");

        // ==========================================
        // Details
        // ==========================================

        doc
          .font("Helvetica")
          .fontSize(9)
          .text(
            detailsText,
            startX +
              slWidth +
              teacherWidth +
              totalWidth +
              5,
            startY + 6,
            {
              width:
                detailWidth - 10,
            }
          );

        startY += currentRowHeight;

      });
      // =============================================
      // FOOTER
      // =============================================

      doc.moveDown(2);

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("gray")
        .text(
          `Generated On : ${new Date().toLocaleString()}`,
          {
            align: "right",
          }
        );

      // =============================================
      // END PDF
      // =============================================

      doc.end();

    } catch (err) {

      console.log(
        "Assigned Teacher Report PDF Error:"
      );

      console.log(err);

      if (!res.headersSent) {

        res.status(500).json({

          success: false,

          message:
            "Failed to generate assigned teacher report PDF.",

          error: err.message,

        });

      }

    }

};