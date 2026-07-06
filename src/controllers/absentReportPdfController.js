import PDFDocument from "pdfkit";
import prisma from "../prismaClient.js";

// =============================================
// DATE WISE ABSENT TEACHER PDF
// =============================================

export const generateAbsentReportPdf = async (req, res) => {
  try {
    const { from, to } = req.query;

    let where = {};

    if (from && to) {
      where.date = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    // =============================================
    // Load Data
    // =============================================

    const absentList =
      await prisma.schoolTeacherAbsent.findMany({
        where,
        include: {
          teacher: true,
        },
        orderBy: [
          {
            teacherId: "asc",
          },
          {
            date: "asc",
          },
        ],
      });

    // =============================================
    // Group Teacher Wise
    // =============================================

    const report = {};

    absentList.forEach((item) => {
      if (!report[item.teacherId]) {
        report[item.teacherId] = {
          teacherName:
            item.teacher?.name || "-",
          totalAbsent: 0,
          dates: [],
        };
      }

      report[item.teacherId].totalAbsent++;

      const d = new Date(item.date);

      const dd = String(
        d.getDate()
      ).padStart(2, "0");

      const mm = String(
        d.getMonth() + 1
      ).padStart(2, "0");

      const yyyy = d.getFullYear();

      report[item.teacherId].dates.push(
        `${dd}-${mm}-${yyyy}`
      );
    });

    const teachers =
      Object.values(report);

    teachers.sort(
      (a, b) =>
        b.totalAbsent - a.totalAbsent
    );

    // =============================================
    // PDF
    // =============================================

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=AbsentTeacherReport.pdf`
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

    doc.moveDown(0.4);

    doc
      .fontSize(18)
      .text(
        "Date Wise Absent Teacher Report",
        {
          align: "center",
        }
      );

    doc.moveDown(1);

    doc
      .font("Helvetica")
      .fontSize(15)
      .text(
        `From : ${from || "-"}`,
        {
          align: "left",
        }
      );

    doc
      .moveDown(0.2)
      .text(
        `To : ${to || "-"}`,
        {
          align: "left",
        }
      );

    doc
      .moveDown(0.5)
      .font("Helvetica-Bold")
      .text(
        `Total Teachers : ${teachers.length}`
      );

    doc.moveDown();

    // =============================================
    // TABLE HEADER
    // =============================================

    const startX = 40;
    let startY = 180;

    const slWidth = 50;
    const teacherWidth = 180;
    const dateWidth = 290;

    const rowHeight = 55;

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
        dateWidth,
        rowHeight
      )
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(
        "SL.No",
        startX,
        startY + 18,
        {
          width: slWidth,
          align: "center",
        }
      );

    doc.text(
      "Teachers",
      startX + slWidth,
      startY + 18,
      {
        width: teacherWidth,
        align: "center",
      }
    );

    doc.text(
      "Dates",
      startX +
        slWidth +
        teacherWidth,
      startY + 18,
      {
        width: dateWidth,
        align: "center",
      }
    );

    startY += rowHeight;

        // =============================================
    // TABLE DATA
    // =============================================

    doc.font("Helvetica");
    doc.fontSize(11);

    teachers.forEach((teacher, index) => {

      // Auto Page Break
      if (startY > 740) {

        doc.addPage();

        startY = 50;

        // Header
        doc
          .font("Helvetica-Bold")
          .fontSize(16)
          .text(
            "Date Wise Absent Teacher Report (Continued)",
            {
              align: "center",
            }
          );

        startY = 90;

        doc
          .rect(startX, startY, slWidth, rowHeight)
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
            startX + slWidth + teacherWidth,
            startY,
            dateWidth,
            rowHeight
          )
          .stroke();

        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(
            "SL.No",
            startX,
            startY + 18,
            {
              width: slWidth,
              align: "center",
            }
          );

        doc.text(
          "Teachers",
          startX + slWidth,
          startY + 18,
          {
            width: teacherWidth,
            align: "center",
          }
        );

        doc.text(
          "Dates",
          startX + slWidth + teacherWidth,
          startY + 18,
          {
            width: dateWidth,
            align: "center",
          }
        );

        startY += rowHeight;
      }

      // Draw Row
      doc
        .rect(startX, startY, slWidth, rowHeight)
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
          startX + slWidth + teacherWidth,
          startY,
          dateWidth,
          rowHeight
        )
        .stroke();

      // SL
      doc
        .font("Helvetica")
        .fontSize(11)
        .text(
          index + 1,
          startX,
          startY + 18,
          {
            width: slWidth,
            align: "center",
          }
        );

      // Teacher
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
          teacher.teacherName,
          startX + slWidth + 8,
          startY + 8
        );

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("red")
        .text(
          `Total Absent : ${teacher.totalAbsent} Day(s)`,
          startX + slWidth + 8,
          startY + 28
        );

      doc.fillColor("black");

      // Dates (Comma Separated)
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(
          teacher.dates.join(", "),
          startX + slWidth + teacherWidth + 8,
          startY + 10,
          {
            width: dateWidth - 16,
            align: "left",
          }
        );

      startY += rowHeight;

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

    doc.end();

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};