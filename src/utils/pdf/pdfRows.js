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
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("black")
    .text(
      row.teacherName,
      startX + 3,
      y + 18,
      {
        width: teacherWidth - 6,
        align: "center",
      }
    );

  // ===========================
  // Period Data
  // ===========================

  periods.forEach((period, colIndex) => {

    const info =
      row.periods[period.name];

    if (!info) return;

    const x =
      startX +
      teacherWidth +
      colIndex * periodWidth;

    // ===========================
    // Class
    // ===========================

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("black")
      .text(
        `${info.className}-${info.section}`,
        x + 2,
        y + 4,
        {
          width: periodWidth - 4,
          height: 10,
          align: "center",
          lineBreak: false,
        }
      );

    // ===========================
    // Subject
    // ===========================

    doc
      .font("Helvetica")
      .fontSize(7)
      .text(
        info.subject,
        x + 2,
        y + 16,
        {
          width: periodWidth - 4,
          height: 10,
          align: "center",
          lineBreak: false,
        }
      );

    // ===========================
    // Assigned Teacher
    // ===========================

    doc
      .font("Helvetica-Bold")
      .fontSize(7)
      .fillColor("#008000")
      .text(
        info.substituteTeacher,
        x + 2,
        y + 28,
        {
          width: periodWidth - 4,
          height: 10,
          align: "center",
          lineBreak: false,
        }
      );

    // ===========================
    // Reason
    // ===========================

    doc
      .font("Helvetica")
      .fontSize(6)
      .fillColor("#444444")
      .text(
        info.reason,
        x + 2,
        y + 40,
        {
          width: periodWidth - 4,
          height: 10,
          align: "center",
          lineBreak: false,
        }
      );

    doc.fillColor("black");

  });

}