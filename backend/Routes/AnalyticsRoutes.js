import express from 'express';
import { generateAttendanceRecommendations, calculateParticipationTrends, getStudentEnrollmentSummary, getLecturerSummary, getDegreeSummary, getStudentGrowthTrend, getAttendanceByDayOfWeek } from '../Controllers/AdminControllers/AnalyticsController.js';
import mongoose from 'mongoose';
import { getGeminiInsights, askGeminiQuestion } from '../Controllers/AdminControllers/AIInsightsController.js';

const router = express.Router();

// GET /api/analysis/recommendations - Generate attendance recommendations
router.get('/recommendations', async (req, res) => {
  // Optional: Check DB connection state if desired
  if (mongoose.connection.readyState !== 1) { // 1 === connected
      console.error("MongoDB not connected. Cannot generate recommendations.");
      return res.status(503).json({ message: "Database service unavailable. Please try again later." });
  }

  try {
    console.log("Route /api/analysis/recommendations called");
    const recommendations = await generateAttendanceRecommendations();
    console.log("Recommendations generated successfully:", recommendations);

    if (recommendations.error) {
        // Handle case where service indicates no data
        return res.status(404).json({ message: recommendations.error });
    }

    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error in /api/analysis/recommendations route:", error);
    res.status(500).json({ message: "Failed to generate attendance recommendations.", error: error.message });
  }
});

// GET /api/analysis/participation-trends - Get data for participation chart
router.get('/participation-trends', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    console.error("MongoDB not connected. Cannot get participation trends.");
    return res.status(503).json({ message: "Database service unavailable." });
  }

  try {
    console.log("Route /api/analysis/participation-trends called");
    const trendsData = await calculateParticipationTrends();
    console.log("Participation trends data fetched successfully.");
    res.status(200).json(trendsData);
  } catch (error) {
    console.error("Error in /api/analysis/participation-trends route:", error);
    res.status(500).json({ message: "Failed to get participation trends.", error: error.message });
  }
});

// GET /api/analysis/student-summary - Get student enrollment summary data
router.get('/student-summary', async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        console.error("MongoDB not connected. Cannot get student summary.");
        return res.status(503).json({ message: "Database service unavailable." });
    }
    try {
        console.log("Route /api/analysis/student-summary called");
        const summaryData = await getStudentEnrollmentSummary();
        console.log("Student summary data fetched successfully.");
        res.status(200).json(summaryData);
    } catch (error) {
        console.error("Error in /api/analysis/student-summary route:", error);
        res.status(500).json({ message: "Failed to get student enrollment summary.", error: error.message });
    }
});

// GET /api/analysis/lecturer-summary - Get lecturer summary data
router.get('/lecturer-summary', async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        console.error("MongoDB not connected. Cannot get lecturer summary.");
        return res.status(503).json({ message: "Database service unavailable." });
    }
    try {
        console.log("Route /api/analysis/lecturer-summary called");
        const summaryData = await getLecturerSummary();
        console.log("Lecturer summary data fetched successfully.");
        res.status(200).json(summaryData);
    } catch (error) {
        console.error("Error in /api/analysis/lecturer-summary route:", error);
        res.status(500).json({ message: "Failed to get lecturer summary.", error: error.message });
    }
});

// GET /api/analysis/degree-summary - Get degree summary data
router.get('/degree-summary', async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        console.error("MongoDB not connected. Cannot get degree summary.");
        return res.status(503).json({ message: "Database service unavailable." });
    }
    try {
        console.log("Route /api/analysis/degree-summary called");
        const summaryData = await getDegreeSummary();
        console.log("Degree summary data fetched successfully.");
        res.status(200).json(summaryData);
    } catch (error) {
        console.error("Error in /api/analysis/degree-summary route:", error);
        res.status(500).json({ message: "Failed to get degree summary.", error: error.message });
    }
});

// GET /api/analysis/student-growth-trend - Get student growth data
router.get('/student-growth-trend', async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        console.error("MongoDB not connected. Cannot get student growth trend.");
        return res.status(503).json({ message: "Database service unavailable." });
    }
    try {
        console.log("Route /api/analysis/student-growth-trend called");
        const growthData = await getStudentGrowthTrend();
        console.log("Student growth data fetched successfully.");
        res.status(200).json(growthData);
    } catch (error) {
        console.error("Error in /api/analysis/student-growth-trend route:", error);
        res.status(500).json({ message: "Failed to get student growth trend.", error: error.message });
    }
});

// GET /api/analysis/gemini-insights - Get AI insights
router.get('/gemini-insights', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    console.error("MongoDB not connected. Cannot get AI insights.");
    return res.status(503).json({ message: "Database service unavailable." });
  }

  try {
    console.log("Route /api/analysis/gemini-insights called");
    const insights = await getGeminiInsights();
    console.log("AI insights generated successfully.");
    res.status(200).json({ insights });
  } catch (error) {
    console.error("Error in /api/analysis/gemini-insights route:", error);
    res.status(500).json({ message: "Failed to generate AI insights.", error: error.message });
  }
});

// GET /api/analysis/attendance-by-day - Get average attendance rate per day
router.get('/attendance-by-day', async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        console.error("MongoDB not connected. Cannot get attendance by day.");
        return res.status(503).json({ message: "Database service unavailable." });
    }
    try {
        console.log("Route /api/analysis/attendance-by-day called");
        const data = await getAttendanceByDayOfWeek();
        console.log("Attendance by day data fetched successfully.");
        res.status(200).json(data);
    } catch (error) {
        console.error("Error in /api/analysis/attendance-by-day route:", error);
        res.status(500).json({ message: "Failed to get attendance by day.", error: error.message });
    }
});

// POST /api/analysis/ask-ai - Handle specific user questions
router.post('/ask-ai', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    console.error("MongoDB not connected. Cannot handle AI question.");
    return res.status(503).json({ message: "Database service unavailable." });
  }

  const { question } = req.body; // Get the question from the request body

  if (!question || typeof question !== 'string' || question.trim() === '') {
    return res.status(400).json({ message: "Invalid question provided." });
  }

  try {
    console.log(`Route /api/analysis/ask-ai called with question: "${question}"`);
    const answer = await askGeminiQuestion(question.trim()); // Call the controller function
    console.log("AI answer generated successfully for question.");
    res.status(200).json({ answer }); // Send the answer back
  } catch (error) {
    console.error(`Error in /api/analysis/ask-ai route for question "${question}":`, error);
    // Send back the specific error message from the controller if available
    res.status(500).json({ message: `Failed to get AI answer: ${error.message}` });
  }
});

export default router; 