import PDFDocument from "pdfkit";
import prisma from "../prismaClient.js";

export const generateTeacherWisePdf = async (req, res) => {
  try {
    const teachers = await prisma.schoolTeacher.findMany();

    const doc = new PDFDocument({ size: "A4", margin: 30 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Teacher_Routine.pdf"
    );

    doc.pipe(res);

    doc.fontSize(16).text("Teacher Wise Routine", { align: "center" });
    doc.moveDown();

    teachers.forEach((t, i) => {
      doc.text(`${i + 1}. ${t.name} - ${t.mainSubject}`);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
