import PDFDocument from "pdfkit";
import prisma from "../prismaClient.js";

export const generateRoutinePdf =
async (req,res)=>{

 const { className, section } =
 req.query;

 const routines =
 await prisma.classRoutine.findMany({
   where:{
     className,
     section,
   },
   include:{
     teacher:true,
   }
 });

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

 doc.fontSize(18)
 .text(
   `Class - ${className}    Section - ${section}`,
   {
     align:"center"
   }
 );

 // এখানে Table Draw হবে

 doc.end();
};