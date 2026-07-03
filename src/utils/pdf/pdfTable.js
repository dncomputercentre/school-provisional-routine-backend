// ========================================
// PDF TABLE
// ========================================

// ========================================
// DRAW TABLE HEADER
// ========================================

export function drawTableHeader(
  doc,
  startX,
  startY,
  teacherWidth,
  periodWidth,
  rowHeight,
  periods
) {

  // ===========================
  // Teacher Header
  // ===========================

  doc.save();

  doc
    .fillColor("#DCEAFB")
    .rect(
      startX,
      startY,
      teacherWidth,
      rowHeight
    )
    .fill();

  doc
    .lineWidth(0.7)
    .strokeColor("black")
    .rect(
      startX,
      startY,
      teacherWidth,
      rowHeight
    )
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("black")
    .text(
      "Absent Teacher",
      startX,
      startY + 18,
      {
        width: teacherWidth,
        align: "center",
        lineBreak: false,
      }
    );

  doc.restore();

  // ===========================
  // Period Headers
  // ===========================

  periods.forEach((period, index) => {

    const x =
      startX +
      teacherWidth +
      index * periodWidth;

    doc.save();

    doc
      .fillColor("#DCEAFB")
      .rect(
        x,
        startY,
        periodWidth,
        rowHeight
      )
      .fill();

    doc
      .lineWidth(0.7)
      .strokeColor("black")
      .rect(
        x,
        startY,
        periodWidth,
        rowHeight
      )
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("black")
      .text(
        period.name,
        x,
        startY + 8,
        {
          width: periodWidth,
          align: "center",
          lineBreak: false,
        }
      );

    doc
      .font("Helvetica")
      .fontSize(6)
      .fillColor("black")
      .text(
        `(${period.time})`,
        x,
        startY + 22,
        {
          width: periodWidth,
          align: "center",
          lineBreak: false,
        }
      );

    doc.restore();

  });

}

// ========================================
// DRAW GRID
// ========================================

export function drawGrid(
  doc,
  startX,
  startY,
  teacherWidth,
  periodWidth,
  rowHeight,
  totalRows,
  periods
) {

  for (let row = 0; row < totalRows; row++) {

    const y =
      startY +
      rowHeight +
      row * rowHeight;

    // Teacher Cell

    doc
      .lineWidth(0.6)
      .strokeColor("#666")
      .rect(
        startX,
        y,
        teacherWidth,
        rowHeight
      )
      .stroke();

    // Period Cells

    periods.forEach((_, col) => {

      const x =
        startX +
        teacherWidth +
        col * periodWidth;

      doc
        .lineWidth(0.6)
        .strokeColor("#666")
        .rect(
          x,
          y,
          periodWidth,
          rowHeight
        )
        .stroke();

    });

  }

}