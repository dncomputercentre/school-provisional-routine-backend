import PDFDocument from "pdfkit";
import prisma from "../prismaClient.js";

export const generateRoutinePdf = async (req, res) => {
  try {
    const { className, section } = req.query;

    const routines = await prisma.classRoutine.findMany({
      where: {
        className,
        OR: [
          { section },
          { section: "Combined" },
        ],
      },
      include: {
        teacher: true,
      },
    });

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 20,
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    doc.pipe(res);

    // ================= HEADER =================

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
      .text("Bhangar, South 24 Pgs (S)", {
        align: "center",
      });

    doc
      .moveDown(0.4)
      .fontSize(17)
      .font("Helvetica-Bold")
      .text(`Class : ${className}   |   ${section}`, {
        align: "center",
      });

    doc.moveDown(2);

    // ================= TABLE SETTINGS =================

    const startX = 40;
    const startY = 90;

    const dayColWidth = 85;
    const periodWidth = 75;

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

    // ================= HEADER ROW =================

    doc.rect(
      startX,
      startY,
      dayColWidth,
      60
    ).stroke();

    periods.forEach((period, index) => {

      const x =
        startX +
        dayColWidth +
        index * periodWidth;

      doc.rect(
        x,
        startY,
        periodWidth,
        60
      ).stroke();

      doc
        .fontSize(10)
        .text(
          period,
          x,
          startY + 8,
          {
            width: periodWidth,
            align: "center",
          }
        );

      const routine = routines.find(
        (r) => r.period === period
      );

      if (routine?.time) {
        doc
          .fontSize(9)
          .text(
            routine.time,
            x,
            startY + 28,
            {
              width: periodWidth,
              align: "center",
            }
          );
      }
    });

    // ================= DAY ROWS =================

    const rowHeight = 68;

    days.forEach((day, rowIndex) => {

      const y =
        startY +
        60 +
        rowIndex * rowHeight;

      // Day Cell

      doc.rect(
        startX,
        y,
        dayColWidth,
        rowHeight
      ).stroke();

      doc
        .fontSize(11)
        .text(
          day,
          startX + 8,
          y + 25
        );

      periods.forEach(
        (period, colIndex) => {

          const x =
            startX +
            dayColWidth +
            colIndex * periodWidth;

          doc.rect(
            x,
            y,
            periodWidth,
            rowHeight
          ).stroke();

          const item =
            routines.find(
              (r) =>
                r.day === day &&
                r.period === period
            );

          if (item) {

            doc
              .fontSize(10)
              .text(
                item.subject || "",
                x + 5,
                y + 10,
                {
                  width:
                    periodWidth - 10,
                  align: "center",
                }
              );

            doc
              .fontSize(9)
              .text(
                item.teacher?.name || "",
                x + 5,
                y + 32,
                {
                  width:
                    periodWidth - 10,
                  align: "center",
                }
              );
          }
        }
      );
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