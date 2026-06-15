import PDFDocument from "pdfkit";
import prisma from "../prismaClient.js";

export const generateTeacherPdf =
async (req,res)=>{

 const { teacherId } = req.query;

 const routines =
 await prisma.classRoutine.findMany({
   where:{
     teacherId,
   },
   include:{
     teacher:true,
   },
 });

 const teacherName =
   routines[0]?.teacher?.name ||
   "Teacher";

 const doc =
 new PDFDocument({
   size:"A4",
   layout:"landscape",
   margin:20,
 });

 res.setHeader(
   "Content-Type",
   "application/pdf"
 );

 doc.pipe(res);

 doc
 .fontSize(20)
 .text(
   `${teacherName} Routine`,
   {
     align:"center"
   }
 );

 doc.moveDown();

 routines.forEach((r)=>{

   doc.fontSize(12)
   .text(
     `${r.day} | ${r.period} | ${r.time} | ${r.subject} | ${r.className} | ${r.section}`
   );

 });

 doc.end();
};