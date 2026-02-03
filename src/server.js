const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("School Provisional Routine Backend Running ✅");
});

app.use("/api/headmaster", require("./routes/headmasterRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/absent", require("./routes/absentRoutes"));
app.use("/api/class-routine", require("./routes/classRoutineRoutes"));
app.use("/api/provisional", require("./routes/provisionalRoutes"));
app.use("/api/teacher-wise-pdf", require("./routes/teacherWisePdfRoutes"));





const PORT = 5000;
app.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server running on http://0.0.0.0:5000");
});
