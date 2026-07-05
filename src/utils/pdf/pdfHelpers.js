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
// =============================
// H.M Signature
// =============================

doc
  .save()
  .font("Helvetica-Bold")
  .fontSize(10)
  .fillColor("black")
  .text(
    "H.M Signature & Seal",
    20,
    25,
    {
      width: 220,
      align: "left",
    }
  )
  .restore();
  // ----------------------------
  // School Name
  // ----------------------------

  doc
    .save()
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#1E3A8A")
    .text(
      "Bhangar High School (H.S)",
      20,
      20,
      {
        width: doc.page.width - 40,
        align: "center",
        lineBreak: false,
      }
    )
    .restore();

  // ----------------------------
  // Address
  // ----------------------------

  doc
    .save()
    .font("Helvetica")
    .fontSize(11)
    .fillColor("black")
    .text(
      "Bhangar, South 24 Parganas",
      20,
      46,
      {
        width: doc.page.width - 40,
        align: "center",
        lineBreak: false,
      }
    )
    .restore();

  // ----------------------------
  // Date
  // ----------------------------

  doc
    .save()
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("black")
    .text(
      `Date : ${date}`,
      430,
      80,
      {
        lineBreak: false,
      }
    )
    .restore();

  // ----------------------------
  // Day
  // ----------------------------

  doc
    .save()
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("black")
    .text(
      `Day : ${day}`,
      560,
      80,
      {
        lineBreak: false,
      }
    )
    .restore();

  // ----------------------------
  // Absent Count
  // ----------------------------

  doc
    .save()
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("black")
    .text(
      `Absent Teacher : ${absentCount}`,
      675,
      80,
      {
        lineBreak: false,
      }
    )
    .restore();

}

// ========================================
// FOOTER
// ========================================

export function drawFooter(
  doc,
  signY
) {

  // ----------------------------
  // Generated Time
  // ----------------------------

  doc
    .save()
    .font("Helvetica-Oblique")
    .fontSize(8)
    .fillColor("#444")
    .text(
      `Generated On : ${new Date().toLocaleString()}`,
      20,
      signY + 18,
      {
        lineBreak: false,
      }
    )
    .restore();

  // ----------------------------
  // Signature Line
  // ----------------------------

  doc
    .save()
    .moveTo(650, signY)
    .lineTo(790, signY)
    .lineWidth(1)
    .strokeColor("black")
    .stroke()
    .restore();

  // ----------------------------
  // Signature Text
  // ----------------------------

  doc
    .save()
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("black")
    .text(
      "H.M Signature & Seal",
      650,
      signY + 6,
      {
        width: 140,
        align: "center",
        lineBreak: false,
      }
    )
    .restore();

}