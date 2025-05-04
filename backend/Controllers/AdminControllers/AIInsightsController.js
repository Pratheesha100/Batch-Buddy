import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
// Import the necessary functions from AnalyticsController
import {
  generateAttendanceRecommendations, 
  calculateParticipationTrends, 
  getStudentsWithLowAttendance, 
  getAttendanceForStudent,
  getModuleAttendanceSummary,    
  getLecturerAttendanceSummary,  
  getUnderutilizedResources,     
  getModuleRescheduleFrequency,  
  getAttendanceByDemographics    
} from './AnalyticsController.js';  

dotenv.config();

// Initialize Gemini API with your API key
// Ensure GEMINI_API_KEY is set in your .env file
if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in the environment variables.");
    // Optionally exit or throw an error to prevent the app from running without the key
    // process.exit(1); 
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function for the initial "Generate AI Summary" button
export async function getGeminiInsights() {
  console.log("Fetching initial AI Summary data...");
  try {
    // Get the base data needed for the general summary
    const [recommendations, participationData] = await Promise.all([
      generateAttendanceRecommendations(),
      calculateParticipationTrends()
    ]);

    // Check if data was retrieved successfully
    if (!recommendations || !participationData) {
      console.warn("Could not retrieve recommendations or participation data for initial summary.");
       // Decide how to handle - return partial summary or error?
      // Returning a message indicating partial data for now.
      return "Could not retrieve all necessary data for a full summary.";
    }

    // Format data into a comprehensive text summary (using the helper)
    const dataPayload = {
        recommendations,
        participation: participationData // Align key name with formatter
        // Other keys will be null/undefined, formatter handles this
    };
    const formattedSummary = formatDataForPrompt(dataPayload);

    // Construct the specific prompt for the initial summary
    const prompt = `
As an educational analytics expert, provide a concise summary based on the following university attendance data:

${formattedSummary}

Focus on:
1. Key insights about overall attendance patterns (trends, best times, top modules).
2. 2-3 actionable recommendations for the administration.

Format the answer clearly.
`;

    // Call the Gemini AI
    console.log("Requesting initial summary from Gemini...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Ensure model name is current
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();
    console.log("Initial AI Summary received.")
    return responseText;

  } catch (error) {
    console.error('Error in getGeminiInsights:', error);
    // Provide a more user-friendly error message if possible
    const message = error.message.includes('API key') ? "Invalid API Key" : `Failed to generate AI insights: ${error.message}`;
    throw new Error(message);
  }
}

// Function for the interactive "Ask AI Assistant"
export async function askGeminiQuestion(userQuestion) {
  console.log(`Processing AI question: \"${userQuestion}\"`);
  
  // --- Determine Data Needs Based on Keywords --- 
  const lowerCaseQuestion = userQuestion.toLowerCase();
  
  // Specific student check
  const studentIdMatch = userQuestion.match(/\b(IT\d{8}|\d{8})\b/i);
  const specificStudentId = studentIdMatch ? studentIdMatch[0].toUpperCase() : null;
  const asksForSpecificStudent = !!specificStudentId;

  // Other keyword checks
  const asksForLowAttendanceList = !asksForSpecificStudent && (lowerCaseQuestion.includes('low attendance') || lowerCaseQuestion.includes('poor attendance'));
  const asksAboutModules = lowerCaseQuestion.includes('module');
  const asksAboutLecturers = lowerCaseQuestion.includes('lecturer');
  const asksAboutDemographics = lowerCaseQuestion.includes('faculty') || lowerCaseQuestion.includes('year') || lowerCaseQuestion.includes('time') || lowerCaseQuestion.includes('day');
  const asksAboutReschedules = lowerCaseQuestion.includes('reschedule');
  const asksAboutResources = lowerCaseQuestion.includes('resource') || lowerCaseQuestion.includes('utilization') || lowerCaseQuestion.includes('underutilized') || lowerCaseQuestion.includes('slot') || lowerCaseQuestion.includes('location');

  try {
    // --- Fetch Data Conditionally --- 
    // Use Promise.allSettled to handle potential errors in individual fetches gracefully
    const dataPromises = {
      recommendations: generateAttendanceRecommendations(),
      participation: calculateParticipationTrends(),
      specificStudent: asksForSpecificStudent ? getAttendanceForStudent(specificStudentId) : null,
      lowAttendanceList: asksForLowAttendanceList ? getStudentsWithLowAttendance() : null,
      moduleSummary: asksAboutModules ? getModuleAttendanceSummary() : null,
      lecturerSummary: asksAboutLecturers ? getLecturerAttendanceSummary() : null,
      demographics: asksAboutDemographics ? getAttendanceByDemographics() : null,
      reschedules: asksAboutReschedules ? getModuleRescheduleFrequency() : null,
      resources: asksAboutResources ? getUnderutilizedResources() : null,
    };

    const results = await Promise.allSettled(Object.values(dataPromises).filter(p => p !== null));
    const promiseKeys = Object.keys(dataPromises).filter(k => dataPromises[k] !== null);
    
    const fetchedData = {};
    results.forEach((result, index) => {
        const key = promiseKeys[index];
        if (result.status === 'fulfilled') {
            fetchedData[key] = result.value;
        } else {
            console.error(`Failed to fetch data for key '${key}':`, result.reason);
            fetchedData[key] = { error: `Failed to fetch data for ${key}` }; // Mark data as errored
        }
    });
    
    // Ensure base data keys exist even if fetches failed
    if (!fetchedData.recommendations) fetchedData.recommendations = { error: "Failed to fetch" };
    if (!fetchedData.participation) fetchedData.participation = []; // or { error: ... }

    // --- Construct Prompt --- 
    const prompt = `
      As an educational analytics expert, analyze the available university data to answer the user's question.
      
      USER QUESTION: "${userQuestion}"
      
      AVAILABLE DATA SUMMARY (Note: Some data sections might be missing or contain errors if fetching failed):
      ${formatDataForPrompt(fetchedData)} 
      
      INSTRUCTIONS:
      - Answer the user's question directly and thoroughly using ONLY the provided data.
      - If a specific data section has an error or is missing, state that you cannot answer fully due to unavailable data for that section.
      - Do not make up information or perform calculations not present in the data.
      - Be concise and clear.
    `;
    
    console.log("Sending data summary to Gemini...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response) {
        throw new Error("No response received from Gemini API.");
    }

    const responseText = response.text();
    console.log("Received response from Gemini.");
    
    return responseText;

  } catch (error) {
    console.error("Error in askGeminiQuestion:", error);
    const message = error.message.includes('API key') ? "Invalid API Key" : `Failed to process AI question: ${error.message}`;
    throw new Error(message);
  }
}

// --- Formatter Function --- 
function formatDataForPrompt(fetchedData) {
  const {
    recommendations, participation, 
    specificStudent, lowAttendanceList, 
    moduleSummary, lecturerSummary, 
    demographics, reschedules, resources
  } = fetchedData;
  
  let formattedText = '';
  const addSection = (title, content) => {
      if (content && (!content.error || content.length > 0)) { // Add if content exists and is not just an error marker
          formattedText += `${title}:\n${content}\n\n`;
      } else if (content?.error) {
          formattedText += `${title}: Error fetching data.\n\n`;
      } else {
          // Optionally add a note if data wasn't fetched/relevant for this query
          // formattedText += `${title}: Data not included for this query.\n\n`; 
      }
  };

  // --- General Summary ---
  let generalContent = "Not available.";
  if (recommendations && !recommendations.error) {
      const bestTimes = recommendations.bestTimes ? 
          `Best lecture times: ${recommendations.bestTimes.bestLectureTimes.map(t => `${t.day} ${t.time} (${t.attendanceRate}% rate)`).join(', ')}. \nBest practical times: ${recommendations.bestTimes.bestPracticalTimes.map(t => `${t.day} ${t.time} (${t.attendanceRate}% rate)`).join(', ')}.` : "N/A";
      const trend = recommendations.weeklyTrends?.trend || "N/A";
      const topModules = recommendations.topModules?.length > 0 ? recommendations.topModules.map(m => `${m.moduleName} (${m.lecturerName || 'N/A'})`).join('; ') : "N/A";
      generalContent = `- Trend: ${trend}\n- Optimal Times: ${bestTimes}\n- Top Attended Modules: ${topModules}`; 
  } else if (recommendations?.error) {
      generalContent = "Error fetching general summary data.";
  }
  addSection("General Summary", generalContent);

  // --- Participation Data ---
  let participationContent = "Not available.";
  if (participation && !participation.error && participation.length > 0) {
      const participationSummary = `Recent weekly participation: ${participation.slice(-5).map(w => `${w.week}: ${w.rate.toFixed(1)}%`).join(', ')}.`;
      let totalPresent = 0, totalPossible = 0;
      participation.forEach(week => { totalPresent += week.present || 0; totalPossible += week.total || 0; });
      const avg = totalPossible === 0 ? 0 : ((totalPresent / totalPossible) * 100);
      participationContent = `- ${participationSummary}\n- Overall Avg: ${avg.toFixed(1)}%`;
  } else if (participation?.error) {
      participationContent = "Error fetching participation data.";
  }
  addSection("Participation Data", participationContent);

  // --- Specific Student ---
  if (specificStudent) { 
      let studentContent = "Error or no data.";
      if (specificStudent.error) {
         studentContent = `Error - ${specificStudent.error}`;
      } else if (specificStudent.studentName) {
          studentContent = `Details for ${specificStudent.studentName} (${specificStudent.studentId}):\n`;
          if (specificStudent.attendance?.length > 0) {
             specificStudent.attendance.forEach(att => { studentContent += `- ${att.date}: ${att.moduleName || 'N/A'} (${att.sessionType || 'N/A'}) - ${att.status}\n`; });
          } else {
              studentContent += `- ${specificStudent.message || 'No recent records found.'}\n`;
          }
      }
      addSection("Specific Student", studentContent);
  }
  
  // --- Low Attendance List ---
  if (lowAttendanceList) {
      let lowAttContent = "Error or no data.";
      if (lowAttendanceList.error) {
          lowAttContent = `Error - ${lowAttendanceList.error}`;
      } else if (lowAttendanceList.length > 0) {
          lowAttContent = lowAttendanceList.map((s, i) => `${i + 1}. ${s.studentName} (${s.studentId}) - Rate: ${s.attendanceRate.toFixed(1)}%`).join('\n');
      } else {
          lowAttContent = "None found below threshold.";
      }
       addSection("Students With Low Attendance (Sample)", lowAttContent);
  }
  
  // --- Module Summary ---
   if (moduleSummary) {
      let modSumContent = "Error or no data.";
       if (moduleSummary.error) {
           modSumContent = `Error - ${moduleSummary.error}`;
       } else if (moduleSummary.low || moduleSummary.high) {
           modSumContent = "";
           if (moduleSummary.low?.length > 0) modSumContent += `- Lowest (${moduleSummary.low.length}): ${moduleSummary.low.map(m => `${m.moduleName} (${m.attendanceRate}%)`).join(', ')}\n`;
           if (moduleSummary.high?.length > 0) modSumContent += `- Highest (${moduleSummary.high.length}): ${moduleSummary.high.map(m => `${m.moduleName} (${m.attendanceRate}%)`).join(', ')}\n`;
           if (modSumContent === "") modSumContent = "No significant variations found.";
       }
       addSection("Module Attendance Summary", modSumContent.trim());
  }
  
  // --- Lecturer Summary ---
   if (lecturerSummary) {
       let lecSumContent = "Error or no data.";
       if (lecturerSummary.error) {
           lecSumContent = `Error - ${lecturerSummary.error}`;
       } else if (lecturerSummary.low || lecturerSummary.high) {
           lecSumContent = "";
           if (lecturerSummary.low?.length > 0) lecSumContent += `- Lowest (${lecturerSummary.low.length}): ${lecturerSummary.low.map(l => `${l.lecturerName} (${l.attendanceRate}%)`).join(', ')}\n`;
           if (lecturerSummary.high?.length > 0) lecSumContent += `- Highest (${lecturerSummary.high.length}): ${lecturerSummary.high.map(l => `${l.lecturerName} (${l.attendanceRate}%)`).join(', ')}\n`;
           if (lecSumContent === "") lecSumContent = "No significant variations found.";
       }
       addSection("Lecturer Attendance Summary", lecSumContent.trim());
  }

  // --- Demographics ---
  if (demographics) {
      let demoContent = "Error or no data.";
       if (demographics.error) {
           demoContent = `Error - ${demographics.error}`;
       } else if (demographics.length > 0) {
           demoContent = demographics.map(d => `- ${d.faculty}, Year ${d.year || 'N/A'}, ${d.day} ${d.timeSlot}: ${d.attendanceRate.toFixed(1)}%`).join('\n');
       } else {
           demoContent = "No specific demographic trends found in sample.";
       }
       addSection("Demographic Attendance Breakdown (Sample)", demoContent);
  }
  
  // --- Reschedules ---
   if (reschedules) {
       let reschedContent = "Error or no data.";
        if (reschedules.error) {
           reschedContent = `Error - ${reschedules.error}`;
       } else if (reschedules.length > 0) {
           reschedContent = reschedules.map((r, i) => `${i + 1}. ${r.moduleName} - ${r.rescheduleCount} times`).join('\n');
       } else {
           reschedContent = "No significant rescheduling found.";
       }
       addSection(`Most Frequently Rescheduled Modules (Top ${reschedules?.length || 0})`, reschedContent);
   }
  
  // --- Resources ---
   if (resources) {
       let resourceContent = "Error or no data.";
        if (resources.error) {
            resourceContent = `Error - ${resources.error}`;
       } else if (resources.locations || resources.slots || resources.freePeakSlots) {
            resourceContent = "";
            if (resources.locations?.length > 0) resourceContent += `- Least Used Locations: ${resources.locations.map(l => `${l.locationName} (${l.sessionCount} sessions)`).join(', ')}\n`;
            if (resources.slots?.length > 0) resourceContent += `- Least Used Time Slots (Sample): ${resources.slots.map(s => `${s.day} ${s.startTime} (${s.sessionCount} sessions)`).join('; ')}\n`;
            if (resources.freePeakSlots?.length > 0) resourceContent += `- Potentially Free Peak Slots: ${resources.freePeakSlots.map(s => `${s.day} ${s.startTime}`).join('; ')}\n`;
            if (resourceContent === "") resourceContent = "No significant underutilization detected.";
       }
       addSection("Resource Utilization Analysis", resourceContent.trim());
  }

  return formattedText.trim() || "No relevant data could be formatted for this query.";
} 