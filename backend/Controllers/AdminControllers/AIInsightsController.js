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
  getAttendanceByDemographics,    
  analyzeEventImpactOnAttendance,    
  analyzeRescheduleImpactOnAttendance
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

  const lowerCaseQuestion = userQuestion.toLowerCase();

  // --- Enhanced Keyword Identification for Prediction Types ---
  const asksForLowAttendancePrediction = lowerCaseQuestion.includes('predict') && (lowerCaseQuestion.includes('low attendance') || lowerCaseQuestion.includes('poor attendance') || lowerCaseQuestion.includes('session risk'));
  const asksForTrendPrediction = lowerCaseQuestion.includes('predict') && lowerCaseQuestion.includes('trend');
  const asksForResourcePrediction = lowerCaseQuestion.includes('predict') && (lowerCaseQuestion.includes('resource') || lowerCaseQuestion.includes('conflict') || lowerCaseQuestion.includes('clash'));
  const asksForBestSlotPrediction = lowerCaseQuestion.includes('best time') || lowerCaseQuestion.includes('best slot') || lowerCaseQuestion.includes('allocate');
  const asksForModuleLecturerPerformance = (lowerCaseQuestion.includes('module') || lowerCaseQuestion.includes('lecturer')) && (lowerCaseQuestion.includes('low attendance') || lowerCaseQuestion.includes('high attendance') || lowerCaseQuestion.includes('performance'));

  // Specific student check (remains the same)
  const studentIdMatch = userQuestion.match(/\b(IT\d{8}|\d{8})\b/i);
  const specificStudentId = studentIdMatch ? studentIdMatch[0].toUpperCase() : null;
  const asksForSpecificStudent = !!specificStudentId;

  // General low attendance list check (if not predicting)
   const asksForLowAttendanceList = !asksForSpecificStudent && !asksForLowAttendancePrediction && (lowerCaseQuestion.includes('low attendance') || lowerCaseQuestion.includes('poor attendance'));

  // General analysis flags (can overlap with prediction)
  const asksAboutModules = lowerCaseQuestion.includes('module');
  const asksAboutLecturers = lowerCaseQuestion.includes('lecturer');
  const asksAboutDemographics = lowerCaseQuestion.includes('faculty') || lowerCaseQuestion.includes('year') || lowerCaseQuestion.includes('time') || lowerCaseQuestion.includes('day');
  const asksAboutReschedules = lowerCaseQuestion.includes('reschedule');
  const asksAboutEvents = lowerCaseQuestion.includes('event');
  const asksAboutResources = lowerCaseQuestion.includes('resource') || lowerCaseQuestion.includes('utilization') || lowerCaseQuestion.includes('underutilized') || lowerCaseQuestion.includes('slot') || lowerCaseQuestion.includes('location');
  const asksAboutAttendanceFactors = lowerCaseQuestion.includes('factor') || lowerCaseQuestion.includes('influence') || lowerCaseQuestion.includes('impact') || lowerCaseQuestion.includes('correlat');

  let predictionType = null; // To tailor the prompt
  if (asksForLowAttendancePrediction) predictionType = 'low_attendance';
  else if (asksForTrendPrediction) predictionType = 'trend';
  else if (asksForResourcePrediction) predictionType = 'resource_conflict';
  else if (asksForBestSlotPrediction) predictionType = 'best_slot';
  else if (asksForModuleLecturerPerformance) predictionType = 'module_lecturer_performance';

  try {
    // --- Targeted Data Fetching Based on Question Type --- 
    const dataPromises = {};

    // Always fetch base recommendations & participation for general context
    dataPromises.recommendations = generateAttendanceRecommendations();
    dataPromises.participation = calculateParticipationTrends();

    if (asksForSpecificStudent) {
        dataPromises.specificStudent = getAttendanceForStudent(specificStudentId);
    } else if (asksForLowAttendanceList || asksForLowAttendancePrediction) {
        dataPromises.lowAttendanceList = getStudentsWithLowAttendance();
        dataPromises.moduleSummary = getModuleAttendanceSummary(); // Relevant for prediction
        dataPromises.lecturerSummary = getLecturerAttendanceSummary(); // Relevant for prediction
        dataPromises.demographics = getAttendanceByDemographics(); // Day/Time trends relevant
    } else if (asksForTrendPrediction) {
        // Participation trends already fetched
        dataPromises.demographics = getAttendanceByDemographics(); // For context
    } else if (asksForResourcePrediction || asksForBestSlotPrediction || asksAboutResources) {
        dataPromises.resources = getUnderutilizedResources();
        dataPromises.demographics = getAttendanceByDemographics(); // Day/Time trends relevant
    } else if (asksForModuleLecturerPerformance || asksAboutModules || asksAboutLecturers) {
         dataPromises.moduleSummary = getModuleAttendanceSummary();
         dataPromises.lecturerSummary = getLecturerAttendanceSummary();
    }
    
    // Fetch other data if mentioned, avoiding redundant fetches
    if (asksAboutModules && !dataPromises.moduleSummary) dataPromises.moduleSummary = getModuleAttendanceSummary();
    if (asksAboutLecturers && !dataPromises.lecturerSummary) dataPromises.lecturerSummary = getLecturerAttendanceSummary();
    if (asksAboutDemographics && !dataPromises.demographics) dataPromises.demographics = getAttendanceByDemographics();
    if (asksAboutReschedules) dataPromises.reschedules = getModuleRescheduleFrequency();
    if (asksAboutResources && !dataPromises.resources) dataPromises.resources = getUnderutilizedResources();

    // --- Add fetches for new correlation analysis --- 
    // Fetch if predicting, asking about factors, events, or reschedules
    if (predictionType === 'low_attendance' || predictionType === 'trend' || asksAboutAttendanceFactors || asksAboutEvents) {
        dataPromises.eventImpact = analyzeEventImpactOnAttendance();
    }
    if (predictionType === 'low_attendance' || predictionType === 'trend' || asksAboutAttendanceFactors || asksAboutReschedules) {
         dataPromises.rescheduleImpact = analyzeRescheduleImpactOnAttendance();
    }
    // --- End of new fetches ---

    const results = await Promise.allSettled(Object.values(dataPromises));
    const promiseKeys = Object.keys(dataPromises);

    const fetchedData = {};
    results.forEach((result, index) => {
        const key = promiseKeys[index];
        if (result.status === 'fulfilled') {
            fetchedData[key] = result.value;
        } else {
            console.error(`Failed to fetch data for key '${key}':`, result.reason);
            fetchedData[key] = { error: `Failed to fetch data for ${key}` };
        }
    });

    // --- Refined Prompt Engineering --- 
    let specificInstructions = "Answer the user's question directly and thoroughly using ONLY the provided data."; // Default instruction
    
    switch (predictionType) {
        case 'low_attendance':
            specificInstructions = "Based *only* on the historical attendance summaries (modules, lecturers, demographics) AND the correlation analysis with events/reschedules, identify potential future sessions, modules, or lecturers that might face low attendance. Explain your reasoning based on all relevant data provided. State these are potential risks based on past data, not guarantees.";
            break;
        case 'trend':
            specificInstructions = "Analyze the overall weekly participation trend data, recent demographic trends, AND any potential correlation with event/reschedule patterns. Based *only* on this historical data, describe the likely short-term future direction of overall attendance. Explain your reasoning.";
            break;
        case 'resource_conflict':
            specificInstructions = "Using the resource utilization data (least used locations/slots, potentially free peak slots) and demographic attendance trends, identify potential future scheduling conflicts or resource bottlenecks. Explain the potential issues based *only* on the provided data.";
            break;
        case 'best_slot':
            specificInstructions = "Based *only* on historical attendance data (demographic breakdown by time/day, least used slots, best performing times from general summary), recommend the most suitable days/time slots for scheduling new sessions to maximize potential attendance. Justify your recommendations using the data.";
            break;
        case 'module_lecturer_performance':
             specificInstructions = "Analyze the provided module and lecturer attendance summaries. Identify the key high and low performers based on historical attendance rates. Explain the patterns observed in the data.";
             break;
        default:
             if (asksAboutAttendanceFactors) {
                 specificInstructions = "Analyze the provided data, including attendance summaries, event/reschedule correlations, and demographic breakdowns, to identify potential factors influencing student attendance patterns. Focus only on correlations shown in the data.";
             }
            break;
    }

    const prompt = `
      As an educational analytics expert, analyze the available university data to answer the user's question.

      USER QUESTION: "${userQuestion}"

      AVAILABLE HISTORICAL DATA & ANALYSIS SUMMARY (Note: Some sections may have errors or be missing if fetching failed):
      ${formatDataForPrompt(fetchedData)}

      INSTRUCTIONS:
      - ${specificInstructions}
      - If relevant data for the specific question is missing or errored, clearly state that you cannot provide a complete answer due to unavailable data.
      - Do not make up information or perform calculations not present in the summary data.
      - Be concise and clear.
    `;

    console.log("Sending request to Gemini...");
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

// --- formatDataForPrompt function remains the same for now ---
// It already handles missing/errored data points.
// Consider adding more detail here if needed for specific prediction types.
function formatDataForPrompt(fetchedData) {
    const {
    recommendations, participation, 
    specificStudent, lowAttendanceList, 
    moduleSummary, lecturerSummary, 
    demographics, reschedules, resources,
    eventImpact, rescheduleImpact
  } = fetchedData;
  
  let formattedText = '';
  const addSection = (title, content) => {
      if (content && (!content.error || (Array.isArray(content) && content.length > 0))) { 
          formattedText += `${title}:\n${typeof content === 'string' ? content : JSON.stringify(content, null, 2)}\n\n`; // Basic formatting, adjust as needed
      } else if (content?.error) {
          formattedText += `${title}: Error fetching data.\n\n`;
      } else {
          // formattedText += `${title}: Data not included/available.\n\n`; 
      }
  };

  // Format general recommendations (more detailed)
  if (recommendations && !recommendations.error) {
    let recContent = '';
    if (recommendations.weeklyTrends?.trend) {
      recContent += `- Weekly Trend: ${recommendations.weeklyTrends.trend}\n`;
    }
    if (recommendations.bestTimes?.bestLectureTimes?.length > 0) {
      recContent += `- Best Lecture Times (Rate %): ${recommendations.bestTimes.bestLectureTimes.map(t => `${t.day} ${t.time} (${t.attendanceRate})`).join(', ')}\n`;
    }
    if (recommendations.bestTimes?.bestPracticalTimes?.length > 0) {
      recContent += `- Best Practical Times (Rate %): ${recommendations.bestTimes.bestPracticalTimes.map(t => `${t.day} ${t.time} (${t.attendanceRate})`).join(', ')}\n`;
    }
    if (recommendations.topModules?.length > 0) {
      recContent += `- Top Attended Lectures (Module - Lecturer): ${recommendations.topModules.map(m => `${m.moduleName} - ${m.lecturerName}`).join('; ')}\n`;
    }
    addSection("General Attendance Summary", recContent.trim() || "No specific summary data available.");
  } else if (recommendations?.error) {
      addSection("General Attendance Summary", "Error fetching data.");
  }

  // Format participation trends (more detailed)
  if (participation && !participation.error && participation.length > 0) {
      const participationSummary = `Recent weekly participation rates (%): ${participation.slice(-5).map(w => `${w.week}: ${w.rate.toFixed(1)}`).join(', ')}.`;
      let totalPresent = 0, totalPossible = 0;
      participation.forEach(week => { totalPresent += week.present || 0; totalPossible += week.total || 0; });
      const avg = totalPossible === 0 ? 0 : ((totalPresent / totalPossible) * 100);
      addSection("Participation Trend Data", `${participationSummary}\n- Overall Avg Rate: ${avg.toFixed(1)}%`);
  } else if (participation?.error) {
      addSection("Participation Trend Data", "Error fetching data.");
  }

  // Format Specific Student Data
   if (specificStudent) { 
      let studentContent;
      if (specificStudent.error) {
         studentContent = `Error - ${specificStudent.error}`;
      } else if (specificStudent.studentName) {
          studentContent = `Attendance Records for ${specificStudent.studentName} (${specificStudent.studentId}):\n`;
          if (specificStudent.attendance?.length > 0) {
             studentContent += specificStudent.attendance.map(att => `- ${att.date}: ${att.moduleName || 'N/A'} (${att.sessionType || 'N/A'}) - ${att.status}`).join('\n');
          } else {
              studentContent += `- ${specificStudent.message || 'No recent records found.'}`;
          }
      } else {
          studentContent = "Student data format issue.";
      }
      addSection("Specific Student Details", studentContent);
  }

  // Format Low Attendance List
  if (lowAttendanceList) {
      let lowAttContent;
      if (lowAttendanceList.error) {
          lowAttContent = `Error - ${lowAttendanceList.error}`;
      } else if (lowAttendanceList.length > 0) {
          lowAttContent = lowAttendanceList.map((s, i) => `${i + 1}. ${s.studentName} (${s.studentId}) - Rate: ${s.attendanceRate}%`).join('\n');
      } else {
          lowAttContent = "No students found with attendance significantly below threshold.";
      }
       addSection("Students With Low Attendance (Sample)", lowAttContent);
  }

  // Format Module Summary
  if (moduleSummary) {
      let modSumContent;
       if (moduleSummary.error) {
           modSumContent = `Error - ${moduleSummary.error}`;
       } else if (moduleSummary.low || moduleSummary.high) {
           modSumContent = "";
           if (moduleSummary.low?.length > 0) modSumContent += `- Lowest Attendance Modules (Rate %): ${moduleSummary.low.map(m => `${m.moduleName} (${m.attendanceRate})`).join(', ')}\n`;
           if (moduleSummary.high?.length > 0) modSumContent += `- Highest Attendance Modules (Rate %): ${moduleSummary.high.map(m => `${m.moduleName} (${m.attendanceRate})`).join(', ')}\n`;
           if (modSumContent === "") modSumContent = "No significant variations found among modules.";
           else modSumContent += `- Total Modules Analyzed: ${moduleSummary.count || 'N/A'}`; 
       } else {
           modSumContent = "No module summary data available.";
       }
       addSection("Module Attendance Summary", modSumContent.trim());
  }

  // Format Lecturer Summary
  if (lecturerSummary) {
       let lecSumContent;
       if (lecturerSummary.error) {
           lecSumContent = `Error - ${lecturerSummary.error}`;
       } else if (lecturerSummary.low || lecturerSummary.high) {
           lecSumContent = "";
           if (lecturerSummary.low?.length > 0) lecSumContent += `- Lowest Attendance Lecturers (Rate %): ${lecturerSummary.low.map(l => `${l.lecturerName} (${l.attendanceRate})`).join(', ')}\n`;
           if (lecturerSummary.high?.length > 0) lecSumContent += `- Highest Attendance Lecturers (Rate %): ${lecturerSummary.high.map(l => `${l.lecturerName} (${l.attendanceRate})`).join(', ')}\n`;
           if (lecSumContent === "") lecSumContent = "No significant variations found among lecturers.";
            else lecSumContent += `- Total Lecturers Analyzed: ${lecturerSummary.count || 'N/A'}`; 
       } else {
            lecSumContent = "No lecturer summary data available.";
       }
       addSection("Lecturer Attendance Summary", lecSumContent.trim());
  }

  // Format Demographics
  if (demographics) {
      let demoContent;
       if (demographics.error) {
           demoContent = `Error - ${demographics.error}`;
       } else if (demographics.length > 0) {
           // Maybe summarize instead of listing all 50?
           demoContent = "Sample breakdown provided (showing lowest rates first):\n";
           demoContent += demographics.slice(0, 10).map(d => `- ${d.faculty}, Year ${d.year || 'N/A'}, ${d.day} ${d.timeSlot}: ${d.attendanceRate}%`).join('\n'); 
       } else {
           demoContent = "No specific demographic trends found in sample.";
       }
       addSection("Demographic Attendance Breakdown (Sample)", demoContent);
  }

  // Format Reschedules
   if (reschedules) {
       let reschedContent;
        if (reschedules.error) {
           reschedContent = `Error - ${reschedules.error}`;
       } else if (reschedules.length > 0) {
           reschedContent = reschedules.map((r, i) => `${i + 1}. ${r.moduleName} - ${r.rescheduleCount} times`).join('\n');
       } else {
           reschedContent = "No significant rescheduling recorded recently.";
       }
       addSection(`Most Frequently Rescheduled Modules (Top ${reschedules?.length || 0})`, reschedContent);
   }

  // Format Resources
   if (resources) {
       let resourceContent;
        if (resources.error) {
            resourceContent = `Error - ${resources.error}`;
       } else if (resources.locations || resources.slots || resources.freePeakSlots) {
            resourceContent = "";
            if (resources.locations?.length > 0) resourceContent += `- Least Used Locations (Sessions): ${resources.locations.map(l => `${l.locationName} (${l.sessionCount})`).join(', ')}\n`;
            if (resources.slots?.length > 0) resourceContent += `- Least Used Time Slots (Day Time - Sessions): ${resources.slots.map(s => `${s.day} ${s.startTime} (${s.sessionCount})`).join('; ')}\n`;
            if (resources.freePeakSlots?.length > 0) resourceContent += `- Potentially Free Peak Slots (Day Time): ${resources.freePeakSlots.map(s => `${s.day} ${s.startTime}`).join('; ')}\n`;
            if (resourceContent === "") resourceContent = "No significant underutilization detected in analysis.";
       } else {
            resourceContent = "No resource utilization data available.";
       }
       addSection("Resource Utilization Analysis", resourceContent.trim());
  }

  // Format Event Impact Analysis
  if (eventImpact) {
      let content;
      if (eventImpact.error) {
          content = `Error - ${eventImpact.error}`;
      } else if (eventImpact.highEventMonths?.length > 0 || eventImpact.lowAttendanceMonths?.length > 0) {
          content = `${eventImpact.analysis || 'Event/Attendance Correlation:'}\n`;
          if (eventImpact.highEventMonths?.length > 0) {
              content += `- Months with Most Events (Attendance %): ${eventImpact.highEventMonths.map(m => `${m.month} (${m.eventCount} events, ${m.attendanceRate}%)`).join('; ')}\n`;
          }
          if (eventImpact.lowAttendanceMonths?.length > 0) {
              content += `- Months with Lowest Attendance (Event Count): ${eventImpact.lowAttendanceMonths.map(m => `${m.month} (${m.attendanceRate}%, ${m.eventCount} events)`).join('; ')}\n`;
          }
      } else {
          content = "No significant event impact data available or calculated.";
      }
      addSection("Event Impact on Attendance Analysis", content.trim());
  }

  // Format Reschedule Impact Analysis
  if (rescheduleImpact) {
      let content;
      if (rescheduleImpact.error) {
          content = `Error - ${rescheduleImpact.error}`;
      } else if (rescheduleImpact.highRescheduleModules?.length > 0 || rescheduleImpact.lowAttendanceModules?.length > 0) {
           content = `${rescheduleImpact.analysis || 'Reschedule/Attendance Correlation:'}\n`;
           if (rescheduleImpact.highRescheduleModules?.length > 0) {
              content += `- Top Rescheduled Modules (Attendance %): ${rescheduleImpact.highRescheduleModules.map(m => `${m.moduleName} (${m.rescheduleCount} resch, ${m.attendanceRate}%)`).join('; ')}\n`;
           }
           if (rescheduleImpact.lowAttendanceModules?.length > 0) {
              content += `- Lowest Attendance Modules (Reschedule Count): ${rescheduleImpact.lowAttendanceModules.map(m => `${m.moduleName} (${m.attendanceRate}%, ${m.rescheduleCount} resch)`).join('; ')}\n`;
           }
      } else {
          content = "No significant reschedule impact data available or calculated.";
      }
       addSection("Reschedule Impact on Attendance Analysis", content.trim());
  }

  return formattedText.trim() || "No relevant data could be formatted for this query.";
} 