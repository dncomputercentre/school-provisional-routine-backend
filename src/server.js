import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// ROUTES IMPORT
import subjectRoutes from "./routes/subjectRoutes.js";
import classRoutineRoutes from "./routes/classRoutineRoutes.js";
import headmasterRoutes from "./routes/headmasterRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import absentRoutes from "./routes/absentRoutes.js";
import provisionalRoutineRoutes from "./routes/provisionalRoutineRoutes.js";
import teacherWisePdfRoutes from "./routes/teacherWisePdfRoutes.js";
import teacherNormalRoutineRoutes from "./routes/teacherNormalRoutineRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ROUTE MOUNTING
app.use("/api/subjects", subjectRoutes);
app.use("/api/class-routine", classRoutineRoutes);
app.use("/api/headmaster", headmasterRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/absent", absentRoutes);
app.use("/api/provisional-routine", provisionalRoutineRoutes);
app.use("/api/teacher-pdf", teacherWisePdfRoutes);
app.use("/api/teacher-normal-routine", teacherNormalRoutineRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("School Routine Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
