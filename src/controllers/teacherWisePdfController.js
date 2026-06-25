import PDFDocument from "pdfkit";
import prisma from "../prismaClient.js";

export const generateTeacherPdf = async (req, res) => {
  try {
    const { teacherId } = req.query;

    const routines = await prisma.classRoutine.findMany({
      where: {
        teacherId,
      },
      include: {
        teacher: true,
      },
    });

    const teacherName =
      routines[0]?.teacher?.name || "Teacher";

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 20,
    });

    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // ================= SCHOOL HEADER =================

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Bhangar High School (H.S)", {
        align: "center",
      });

    doc
      .moveDown(0.2)
      .fontSize(13)
      .font("Helvetica")
      .text("Bhangar, South 24 Pgs", {
        align: "center",
      });

    doc
      .moveDown(0.4)
      .fontSize(17)
      .font("Helvetica-Bold")
      .text(`Teacher Name : ${teacherName}`, {
        align: "center",
      });

    doc.moveDown(1);
    doc.moveDown();

    const startX = 40;
    const startY = 100;

    const dayColWidth = 83;
    const periodWidth = 75;
    const rowHeight = 68;

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

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // ===== Header =====

    doc.rect(startX, startY, dayColWidth, 60).stroke();

    periods.forEach((period, index) => {
      const x =
        startX +
        dayColWidth +
        index * periodWidth;

      doc.rect(x, startY, periodWidth, 60).stroke();

      doc
        .fontSize(10)
        .text(period, x, startY + 8, {
          width: periodWidth,
          align: "center",
        });

      const routine = routines.find(
        (r) => r.period === period
      );

      if (routine?.time) {
        doc
          .fontSize(9)
          .text(routine.time, x, startY + 28, {
            width: periodWidth,
            align: "center",
          });
      }
    });

    // ===== Rows =====

    days.forEach((day, rowIndex) => {
      const y =
        startY +
        60 +
        rowIndex * rowHeight;

      doc.rect(startX, y, dayColWidth, rowHeight).stroke();

      doc
        .fontSize(11)
        .text(day, startX + 8, y + 25);

      periods.forEach((period, colIndex) => {
        const x =
          startX +
          dayColWidth +
          colIndex * periodWidth;

        doc.rect(x, y, periodWidth, rowHeight).stroke();

        const item = routines.find(
          (r) =>
            r.day === day &&
            r.period === period
        );

        if (item) {
          doc
            .fontSize(10)
            .text(item.subject || "", x + 5, y + 8, {
              width: periodWidth - 10,
              align: "center",
            });

          doc
            .fontSize(9)
            .text(item.className || "", x + 5, y + 28, {
              width: periodWidth - 10,
              align: "center",
            });

          doc
            .fontSize(9)
            .text(item.section || "", x + 5, y + 44, {
              width: periodWidth - 10,
              align: "center",
            });
        }
      });
    });

    doc.end();
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};