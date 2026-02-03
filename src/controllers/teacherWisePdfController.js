const PDFDocument = require("pdfkit");
const prisma = require("../prismaClient");

exports.generateTeacherWisePdf = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1️⃣ Load data
    const teachers = await prisma.schoolTeacher.findMany();
    const routines = await prisma.schoolClassRoutine.findMany();
    const absent = await prisma.schoolTeacherAbsent.findMany({
      where: { date: today },
    });

    const absentIds = absent.map(a => a.teacherId);

    // 2️⃣ Provisional assignment map
    const teacherTable = {};
    teachers.forEach(t => {
      teacherTable[t.id] = {
        name: t.name,
        periods: {}, // periodNo -> text
      };
    });

    for (const r of routines) {
      let assignedTeacherId = r.teacherId;

      if (absentIds.includes(r.teacherId)) {
        const eligible = teachers.filter(
          t =>
            (t.mainSubject === r.subject ||
              t.optionalSubjects.includes(r.subject)) &&
            !absentIds.includes(t.id)
        );

        if (eligible.length > 0) {
          assignedTeacherId = eligible[0].id;
        } else {
          continue;
        }
      }

      teacherTable[assignedTeacherId].periods[r.period] =
        `Class: ${r.className}, Subject: ${r.subject}\nTime: ${r.time}`;
    }

    // 3️⃣ PDF
    const doc = new PDFDocument({ size: "A4", margin: 30 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Teacher_Wise_Provisional_Routine.pdf"
    );

    doc.pipe(res);

    doc.fontSize(16).text("Teacher Wise Provisional Routine", {
      align: "center",
    });
    doc.moveDown();
    doc.fontSize(10).text(`Date: ${today.toDateString()}`);
    doc.moveDown();

    // Table Header
    const startX = 30;
    let y = doc.y;

    const colWidths = [30, 80, 60, 60, 60, 60, 60, 60, 60, 60];
    const headers = [
      "Sl",
      "Teacher",
      "1st",
      "2nd",
      "3rd",
      "4th",
      "5th",
      "6th",
      "7th",
      "8th",
    ];

    let x = startX;
    headers.forEach((h, i) => {
      doc.rect(x, y, colWidths[i], 25).stroke();
      doc.text(h, x + 2, y + 7, { width: colWidths[i] - 4 });
      x += colWidths[i];
    });

    y += 25;

    // Rows
    let sl = 1;
    for (const tId in teacherTable) {
      const row = teacherTable[tId];
      x = startX;

      const cells = [
        sl,
        row.name,
        row.periods[1] || "",
        row.periods[2] || "",
        row.periods[3] || "",
        row.periods[4] || "",
        row.periods[5] || "",
        row.periods[6] || "",
        row.periods[7] || "",
        row.periods[8] || "",
      ];

      const rowHeight = 50;

      cells.forEach((c, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(String(c), x + 2, y + 5, {
          width: colWidths[i] - 4,
        });
        x += colWidths[i];
      });

      y += rowHeight;
      sl++;

      if (y > 750) {
        doc.addPage();
        y = 50;
      }
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
