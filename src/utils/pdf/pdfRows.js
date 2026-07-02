// ========================================
// PDF ROWS
// ========================================

export function drawTeacherRow(
  doc,
  row,
  y,
  startX,
  teacherWidth,
  periodWidth,
  periods
) {

  // ===========================
  // Teacher Name
  // ===========================

  doc
    .save()
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("black")
    .text(
      row.teacherName,
      startX + 3,
      y + 22,
      {
        width: teacherWidth - 6,
        align: "center",
        lineBreak: false,
      }
    )
    .restore();

  // ===========================
  // Period Data
  // ===========================

  periods.forEach((period, colIndex) => {

    const info = row.periods[period.name];

    if (!info) return;

    const x =
      startX +
      teacherWidth +
      colIndex * periodWidth;

    // ---------------------------
    // Class
    // ---------------------------

    doc.save();

    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor("black");

    doc.text(

      `${info.className}-${info.section}`,

      x + 2,

      y + 4,

      {

        width: periodWidth - 4,

        align: "center",

        lineBreak: false,

      }

    );

    doc.restore();

    // ---------------------------
    // Subject
    // ---------------------------

    doc.save();

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("black");

    doc.text(

      info.subject,

      x + 2,

      y + 16,

      {

        width: periodWidth - 4,

        align: "center",

        lineBreak: false,

      }

    );

    doc.restore();

    // ---------------------------
    // Substitute Teacher
    // ---------------------------

    doc.save();

    doc
      .font("Helvetica-Bold")
      .fontSize(7)
      .fillColor("#15803D");

    doc.text(

      info.substituteTeacher,

      x + 2,

      y + 29,

      {

        width: periodWidth - 4,

        align: "center",

        lineBreak: false,

      }

    );

    doc.restore();

    // ---------------------------
    // Reason
    // ---------------------------

    doc.save();

    doc
      .font("Helvetica")
      .fontSize(6)
      .fillColor("#666666");

    doc.text(

      info.reason,

      x + 2,

      y + 42,

      {

        width: periodWidth - 4,

        align: "center",

        lineBreak: false,

      }

    );

    doc.restore();

  });

}