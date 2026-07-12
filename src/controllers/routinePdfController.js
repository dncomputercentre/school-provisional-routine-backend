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
      orderBy: [
        { day: "asc" },
        { period: "asc" },
      ],
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

    res.setHeader(
      "Content-Disposition",
      `inline; filename=Routine.pdf`
    );

    doc.pipe(res);

    // =====================================
    // HEADER
    // =====================================

    const drawHeader = () => {

      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .text(
          "BHANGAR HIGH SCHOOL (H.S)",
          {
            align: "center",
          }
        );

      doc
        .moveDown(0.2)
        .font("Helvetica")
        .fontSize(13)
        .text(
          "Bhangar, South 24 Parganas",
          {
            align: "center",
          }
        );

      doc
        .moveDown(0.4)
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(
          `Class : ${className}   |   Section : ${section}`,
          {
            align: "center",
          }
        );

    };

    drawHeader();

    // =====================================
    // TABLE SETTINGS
    // =====================================

    const startX = 35;
    const startY = 105;

    const dayWidth = 80;
    const periodWidth = 76;
    const headerHeight = 50;

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

    // =====================================
    // DRAW TABLE HEADER
    // =====================================

    const drawTableHeader = (y) => {

      doc
        .rect(
          startX,
          y,
          dayWidth,
          headerHeight
        )
        .stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
          "Day",
          startX,
          y + 18,
          {
            width: dayWidth,
            align: "center",
          }
        );

      periods.forEach((period, index) => {

        const x =
          startX +
          dayWidth +
          index * periodWidth;

        doc
          .rect(
            x,
            y,
            periodWidth,
            headerHeight
          )
          .stroke();

        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .text(
            period,
            x,
            y + 5,
            {
              width: periodWidth,
              align: "center",
            }
          );

        const routine = routines.find(
          r => r.period === period
        );

        if (routine?.time) {

          doc
            .font("Helvetica")
            .fontSize(8)
            .text(
              routine.time,
              x,
              y + 25,
              {
                width: periodWidth,
                align: "center",
              }
            );

        }

      });

    };

    drawTableHeader(startY);

    // ==========================
    // PART-2 এখান থেকে শুরু হবে
    // ==========================

    let currentY =
      startY + headerHeight;

    // =====================================
    // DAY ROWS
    // =====================================

    for (const day of days) {

      // এই দিনের সবচেয়ে বড় Period-এর Entry Count
      let maxItems = 1;

      periods.forEach((period) => {

        const count = routines.filter(
          r =>
            r.day === day &&
            r.period === period
        ).length;

        if (count > maxItems) {
          maxItems = count;
        }

      });

      // Dynamic Row Height
      let rowHeight;

      if (
        className === "Class-XI" ||
        className === "Class-XII"
      ) {
        rowHeight = Math.max(90, maxItems * 18 + 15);
      } else {
        rowHeight = 50;
      }

      // ================= PAGE BREAK =================

      if (
        currentY + rowHeight >
        doc.page.height - 40
      ) {

        doc.addPage();

        drawHeader();

        drawTableHeader(startY);

        currentY =
          startY + headerHeight;

      }

      // ================= DAY CELL =================

      doc
        .rect(
          startX,
          currentY,
          dayWidth,
          rowHeight
        )
        .stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
          day,
          startX,
          currentY + rowHeight / 2 - 6,
          {
            width: dayWidth,
            align: "center",
          }
        );

      // ================= PERIOD CELLS =================

      periods.forEach((period, colIndex) => {

        const x =
          startX +
          dayWidth +
          colIndex * periodWidth;

        doc
          .rect(
            x,
            currentY,
            periodWidth,
            rowHeight
          )
          .stroke();

        const items = routines.filter(
          r =>
            r.day === day &&
            r.period === period
        );

        if (items.length === 0) return;
        let lineY = currentY + 5;

        items.forEach((item) => {

          // Subject (Bold)
          doc
            .font("Helvetica-Bold")
            .fontSize(
              className === "Class-XI" ||
                className === "Class-XII"
                ? 8
                : 9
            )
            .text(
              item.subject,
              x + 3,
              lineY,
              {
                width: periodWidth - 6,
                align: "center",
              }
            );

          lineY += 11;

          // Teacher (Normal)
          doc
            .font("Helvetica")
            .fontSize(
              className === "Class-XI" ||
                className === "Class-XII"
                ? 7
                : 8
            )
            .text(
              item.teacher?.name || "",
              x + 3,
              lineY,
              {
                width: periodWidth - 6,
                align: "center",
              }
            );

          // Subject-Teacher pair এর মাঝে Gap
          lineY += 12;

        });

      });

      currentY += rowHeight;

    }

    doc.end();

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};