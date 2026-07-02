// ========================================
// PDF HELPERS
// ========================================

// ========================================
// SCHOOL HEADER
// ========================================

export function drawSchoolHeader(
  doc,
  date,
  day,
  absentCount
) {

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor("#1E3A8A")
    .text(
      "Bhangar High School (H.S)",
      {
        align: "center",
      }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("black")
    .text(
      "Bhangar, South 24 Parganas",
      {
        align: "center",
      }
    );

  // ===========================
  // Header Line
  // ===========================

  doc
    .moveTo(20, 58)
    .lineTo(
      doc.page.width - 20,
      58
    )
    .lineWidth(1)
    .strokeColor("#666666")
    .stroke();

  // ===========================
  // Date
  // ===========================

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("black");

  doc.text(
    `Date : ${date}`,
    430,
    82
  );

  doc.text(
    `Day : ${day}`,
    560,
    82
  );

  doc.text(
    `Absent Teacher : ${absentCount}`,
    675,
    82
  );

}

// ========================================
// FOOTER
// ========================================

export function drawFooter(
  doc,
  signY
) {

  // ===========================
  // Generated Time
  // ===========================

  doc
    .font("Helvetica-Oblique")
    .fontSize(9)
    .fillColor("black")
    .text(
      `Generated On : ${new Date().toLocaleString()}`,
      25,
      signY + 25
    );

  // ===========================
  // Signature Line
  // ===========================

  doc
    .moveTo(650, signY)
    .lineTo(790, signY)
    .lineWidth(1)
    .strokeColor("black")
    .stroke();

  // ===========================
  // Signature
  // ===========================

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("black")
    .text(
      "H.M Signature & Seal",
      650,
      signY + 8,
      {
        width: 140,
        align: "center",
      }
    );

}