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

  // Teacher Header

  doc
    .save()
    .fillColor("#DCEAFB")
    .rect(
      startX,
      startY,
      teacherWidth,
      rowHeight
    )
    .fill()
    .restore();

  doc
    .rect(
      startX,
      startY,
      teacherWidth,
      rowHeight
    )
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("black")
    .text(
      "Absent Teacher",
      startX,
      startY + 15,
      {
        width: teacherWidth,
        align: "center",
      }
    );

  // Period Header

  periods.forEach((period, index) => {

    const x =
      startX +
      teacherWidth +
      index * periodWidth;

    doc
      .save()
      .fillColor("#DCEAFB")
      .rect(
        x,
        startY,
        periodWidth,
        rowHeight
      )
      .fill()
      .restore();

    doc
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
        startY + 6,
        {
          width: periodWidth,
          align: "center",
        }
      );

    doc
      .font("Helvetica")
      .fontSize(6)
      .text(
        `(${period.time})`,
        x,
        startY + 18,
        {
          width: periodWidth,
          align: "center",
        }
      );

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

    // Teacher Column

    doc
      .rect(
        startX,
        y,
        teacherWidth,
        rowHeight
      )
      .stroke();

    // Period Columns

    periods.forEach((_, col) => {

      const x =
        startX +
        teacherWidth +
        col * periodWidth;

      doc
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