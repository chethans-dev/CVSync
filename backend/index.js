import express from "express";
import multer from "multer";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

import cors from "cors";
import { scrapeLinkedIn } from "./utils/job-retrieve.js";
import { extractTextFromResume } from "./utils/text-extract.js";
import { analyzeResumeWithGemini } from "./utils/gemini.js";

config({ path: "backend/config/config.env" });

const app = express();
const PORT = process.env.PORT || 4000;
const __dirname = path.resolve();

app.use(cors());

const uploadDir = "./backend/uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// API to handle resume upload & extract text
app.post("/upload", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const filePath = req.file.path;
  const fileType = req.file.mimetype;
  const { jobDescription, state } = req.body;
  const timings = {};

  try {
    const totalStart = Date.now();

    const textExtractStart = Date.now();
    const text = await extractTextFromResume(filePath, fileType);
    fs.unlinkSync(filePath); // Clean up file after processing
    timings.textExtractionTime = Date.now() - textExtractStart;

    // Send extracted text to Gemini AI for analysis
    const aiAnalysisStart = Date.now();
    let aiAnalysis = await analyzeResumeWithGemini(text, jobDescription, state);
    timings.aiAnalysisTime = Date.now() - aiAnalysisStart;

    // Extract suggested job roles from AI analysis
    // Extract the JSON part separately
    const jobScrapingStart = Date.now();
    const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/);
    let jobRolesJSON = {};

    if (jsonMatch) {
      try {
        jobRolesJSON = JSON.parse(jsonMatch[0]); // Extract the JSON block
        aiAnalysis = aiAnalysis.replace(jsonMatch[0], "").trim();
        aiAnalysis = aiAnalysis.replace("**Structured JSON Format:**", "");
      } catch (error) {
        console.error("JSON parsing error:", error);
      }
    }

    // Fetch real-time jobs for the first suggested role
    const jobRoles = jobRolesJSON?.jobRoles || [];
    // const realTimeJobs = await fetchRealTimeJobs(jobRoles);
    const realTimeJobs = await scrapeLinkedIn(jobRoles, state);
    timings.jobScrapingTime = Date.now() - jobScrapingStart;

    timings.totalProcessingTime = Date.now() - totalStart;

    res.json({
      message: "Resume uploaded & parsed successfully",
      aiAnalysis,
      realTimeJobs,
      executionTimes: timings,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to extract text from resume." });
  }
});

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
