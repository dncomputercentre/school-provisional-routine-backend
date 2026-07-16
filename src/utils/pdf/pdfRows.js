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

  // =====================================
  // Teacher Name
  // =====================================

  doc.save();

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("black")
    .text(
      row.teacherName || "-",
      startX + 3,
      y + 20,
      {
        width: teacherWidth - 6,
        height: 16,
        align: "center",
        lineBreak: false,
        ellipsis: true,
      }
    );

  doc.restore();

  // =====================================
  // Period Cells
  // =====================================

  periods.forEach((period, index) => {

    const info = row.periods[period.name];

    if (!info) return;

    const x =
      startX +
      teacherWidth +
      index * periodWidth;

    // -----------------------------
    // Class
    // -----------------------------

    doc.save();

    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
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
          ellipsis: true,
        }
      );

    doc.restore();

    // -----------------------------
    // Subject
    // -----------------------------

    doc.save();

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("black")
      .text(
        info.subject || "-",
        x + 2,
        y + 16,
        {
          width: periodWidth - 4,
          height: 10,
          align: "center",
          lineBreak: false,
          ellipsis: true,
        }
      );

    doc.restore();

    // -----------------------------
    // Assigned Teacher
    // -----------------------------

    doc.save();

    doc
      .font("Helvetica-Bold")
      .fontSize(7)
      .fillColor("#15803D")
      .text(
        info.substituteTeacher || "-",
        x + 2,
        y + 29,
        {
          width: periodWidth - 4,
          height: 10,
          align: "center",
          lineBreak: false,
          ellipsis: true,
        }
      );

    doc.restore();

    // -----------------------------
    // Reason
    // -----------------------------

    let reasonColor = "#666666";

    switch ((info.reason || "").toLowerCase()) {

      case "main subject":
        reasonColor = "#15803D";
        break;

      case "optional subject":
        reasonColor = "#2563EB";
        break;

      case "free teacher":
        reasonColor = "#D97706";
        break;

      case "senior class":
        reasonColor = "#DC2626";
        break;

      case "no substitute available":
        reasonColor = "#B91C1C";
        break;
    }

    doc.save();

    doc
      .font("Helvetica")
      .fontSize(6)
      .fillColor(reasonColor)
      .text(
        info.reason || "",
        x + 2,
        y + 42,
        {
          width: periodWidth - 4,
          height: 10,
          align: "center",
          lineBreak: false,
          ellipsis: true,
        }
      );

    doc.restore();

  });

}

// ========================================
// ASSIGNED TEACHER ROW
// ========================================

export function drawAssignedTeacherRow(
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
      row.teacherName || "-",
      startX + 3,
      y + 20,
      {
        width: teacherWidth - 6,
        align: "center",
        lineBreak: false,
      }
    )
    .restore();

  // ===========================
  // Period Cells
  // ===========================

  periods.forEach((period, index) => {

    const info =
      row.periods[period.name];

    if (!info) return;

    const x =
      startX +
      teacherWidth +
      index * periodWidth;

    // -----------------------
    // Class
    // -----------------------

    doc
      .save()
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor("black")
      .text(
        `${info.className}-${info.section}`,
        x + 2,
        y + 4,
        {
          width: periodWidth - 4,
          align: "center",
          lineBreak: false,
        }
      )
      .restore();

    // -----------------------
    // Subject
    // -----------------------

    doc
      .save()
      .font("Helvetica")
      .fontSize(7)
      .fillColor("black")
      .text(
        info.subject,
        x + 2,
        y + 17,
        {
          width: periodWidth - 4,
          align: "center",
          lineBreak: false,
        }
      )
      .restore();

    // -----------------------
    // Type
    // -----------------------

    const color =
      info.type === "Normal"
        ? "#15803D"
        : "#2563EB";

    doc
      .save()
      .font("Helvetica-Bold")
      .fontSize(7)
      .fillColor(color)
      .text(
        info.type,
        x + 2,
        y + 31,
        {
          width: periodWidth - 4,
          align: "center",
          lineBreak: false,
        }
      )
      .restore();

  });

}