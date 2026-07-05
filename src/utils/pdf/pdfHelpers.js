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
  .fontSize(8)
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