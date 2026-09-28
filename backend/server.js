const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Correct answers for the existing Basic Computers exam
const correctAnswers = {
  q1: "A",
  q2: "B",
  q3: "C",
  q4: "A",
  q5: "A",
  q6: "C",
  q7: "B",
  q8: "A",
  q9: "B",
  q10: "C",
};

const ExamReport = mongoose.model(
  "ExamReport",
  new mongoose.Schema({
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
    },
    examName: {
      type: String,
      default: "Basic Computers",
    },
    score: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      default: 10,
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  })
);

app.get("/", (req, res) => {
  res.send("Exam backend is running");
});

// Save one student's exam report
app.post("/api/reports", async (req, res) => {
  try {
    const { studentName, rollNumber, selectedAnswers } = req.body;

    if (
      typeof studentName !== "string" ||
      !studentName.trim() ||
      typeof rollNumber !== "string" ||
      !rollNumber.trim() ||
      !selectedAnswers ||
      typeof selectedAnswers !== "object" ||
      Array.isArray(selectedAnswers)
    ) {
      return res.status(400).json({
        message: "Student name, roll number, and answers are required.",
      });
    }

    // Keep only valid answer choices
    const answers = {};

    for (let i = 1; i <= 10; i++) {
      const key = `q${i}`;
      const value = selectedAnswers[key];

      answers[key] = ["A", "B", "C", "D"].includes(value)
        ? value
        : null;
    }

    // Calculate the score on the backend
    let score = 0;

    for (let i = 1; i <= 10; i++) {
      const key = `q${i}`;

      if (answers[key] === correctAnswers[key]) {
        score++;
      }
    }

    const report = await ExamReport.create({
      studentName: studentName.trim(),
      rollNumber: rollNumber.trim(),
      examName: "Basic Computers",
      score,
      totalMarks: 10,
      answers,
    });

    res.status(201).json({
      message: "Exam report saved successfully",
      report,
    });
  } catch (error) {
    console.error("Report save error:", error);

    res.status(500).json({
      message: "Failed to save exam report",
    });
  }
});

// Retrieve all student reports


async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();