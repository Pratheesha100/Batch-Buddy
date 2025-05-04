import mongoose from 'mongoose';
import moment from 'moment';
import Attendance from '../../Models/Attendance.js';
import Timetables from '../../Models/Timetables.js';
import Modules from '../../Models/Modules.js';
import Lecturers from '../../Models/Lecturers.js'; 
import Students from '../../Models/Students.js';
import Degrees from '../../Models/Degrees.js';
import Reschedules from '../../Models/Reschedules.js';
import Faculties from '../../Models/Faculty.js';
import Batches from '../../Models/Batches.js';
import Groups from '../../Models/Groups.js';
import Locations from '../../Models/Location.js';

// --- Helper Functions ---

// Function to calculate attendance rate
const calculateAttendanceRate = (presentCount, totalCount) => {
  // Avoid division by zero
  if (totalCount === 0) return 0;
  return (presentCount / totalCount) * 100;
};

// --- Internal Helper Functions (Not Exported Directly) ---

// Find Best Times for Lectures and Practicals (Used by generateAttendanceRecommendations)
async function findBestTimes(attendanceData) {
  const timeSlotAttendance = {};
  attendanceData.forEach(att => {
    // Enhanced Check: Ensure timetable exists and has the required fields
    if (!att.timetable || typeof att.timetable !== 'object' || !att.timetable.day || !att.timetable.startTime || !att.timetable.type) {
        // console.warn(`Skipping attendance record due to missing/incomplete timetable data: ${att._id}`); // Keep this commented unless debugging
        return; // Skip this record
    }
    // Check if timetable fields are valid strings (basic validation)
    if (typeof att.timetable.day !== 'string' || typeof att.timetable.startTime !== 'string' || typeof att.timetable.type !== 'string') {
        // console.warn(`Skipping attendance record due to invalid timetable field types: ${att._id}`); // Keep this commented unless debugging
        return; // Skip this record
    }

    const key = `${att.timetable.day}-${att.timetable.startTime}-${att.timetable.type}`;
    if (!timeSlotAttendance[key]) {
      timeSlotAttendance[key] = { present: 0, total: 0, day: att.timetable.day, time: att.timetable.startTime, type: att.timetable.type };
    }
    timeSlotAttendance[key].total++;
    if (att.status === 'Present') {
      timeSlotAttendance[key].present++;
    }
  });
  const timeSlots = Object.values(timeSlotAttendance).map(slot => ({ ...slot, rate: calculateAttendanceRate(slot.present, slot.total) }));
  timeSlots.sort((a, b) => b.rate - a.rate);
  const bestLectureTimes = timeSlots.filter(slot => slot.type === 'Lecture').slice(0, 3);
  const bestPracticalTimes = timeSlots.filter(slot => slot.type === 'Practical').slice(0, 3);
  return {
      bestLectureTimes: bestLectureTimes.map(s => ({ day: s.day, time: s.time, attendanceRate: s.rate.toFixed(1) })),
      bestPracticalTimes: bestPracticalTimes.map(s => ({ day: s.day, time: s.time, attendanceRate: s.rate.toFixed(1) }))
  };
}

// Calculate Weekly Attendance Trends (Used by generateAttendanceRecommendations)
async function calculateWeeklyTrends(attendanceData) {
    const weeklyAttendance = {};
    attendanceData.forEach(att => {
        const weekKey = moment(att.date).format('YYYY-WW');
        if (!weeklyAttendance[weekKey]) {
            weeklyAttendance[weekKey] = { present: 0, total: 0 };
        }
        weeklyAttendance[weekKey].total++;
        if (att.status === 'Present') {
            weeklyAttendance[weekKey].present++;
        }
    });
    const weeks = Object.keys(weeklyAttendance).sort();
    if (weeks.length < 2) {
        return { trend: "Insufficient data (need at least 2 weeks)", currentWeekRate: null, previousWeekRate: null, currentWeek: null, previousWeek: null };
    }
    const currentWeekKey = weeks[weeks.length - 1];
    const previousWeekKey = weeks[weeks.length - 2];
    const currentWeekData = weeklyAttendance[currentWeekKey];
    const previousWeekData = weeklyAttendance[previousWeekKey];
    const currentWeekRate = calculateAttendanceRate(currentWeekData.present, currentWeekData.total);
    const previousWeekRate = calculateAttendanceRate(previousWeekData.present, previousWeekData.total);
    let trend;
    const difference = currentWeekRate - previousWeekRate;
    if (difference > 5) trend = `Improved significantly by ${difference.toFixed(1)}% compared to the previous week.`;
    else if (difference > 0) trend = `Slight improvement of ${difference.toFixed(1)}% compared to the previous week.`;
    else if (difference < -5) trend = `Decreased significantly by ${Math.abs(difference).toFixed(1)}% compared to the previous week.`;
    else if (difference < 0) trend = `Slight decrease of ${Math.abs(difference).toFixed(1)}% compared to the previous week.`;
    else trend = "Attendance rate remained stable compared to the previous week.";
    return {
        trend,
        currentWeekRate: currentWeekRate.toFixed(1),
        previousWeekRate: previousWeekRate.toFixed(1),
        currentWeek: currentWeekKey,
        previousWeek: previousWeekKey,
    };
}

// Find Top 5 Most Attended Lectures/Modules (Used by generateAttendanceRecommendations)
async function findTopModulesAggregated() {
  try {
    const topModulesPipeline = [
      { $match: { status: 'Present' } },
      { $lookup: { from: 'timetables', localField: 'timetable', foreignField: '_id', as: 'timetableDetails' } },
      { $unwind: '$timetableDetails' },
      { $match: { 'timetableDetails.type': 'Lecture' } }, // Focus on Lectures for this metric
      { $group: { _id: '$timetableDetails.module', presentCount: { $sum: 1 }, lecturerId: { $first: '$timetableDetails.lecturer' } } },
      { $sort: { presentCount: -1 } }, { $limit: 5 },
      { $lookup: { from: 'modules', localField: '_id', foreignField: '_id', as: 'moduleInfo' } },
      { $lookup: { from: 'lecturers', localField: 'lecturerId', foreignField: '_id', as: 'lecturerInfo' } },
      { $unwind: { path: '$moduleInfo', preserveNullAndEmptyArrays: true } }, // Handle cases where module might not exist
      { $unwind: { path: '$lecturerInfo', preserveNullAndEmptyArrays: true } }, // Handle cases where lecturer might not exist
      { $project: { _id: 0, moduleName: { $ifNull: ['$moduleInfo.moduleName', 'Unknown Module'] }, lecturerName: { $ifNull: ['$lecturerInfo.lecturerName', 'Unknown Lecturer'] }, attendanceCount: '$presentCount' } }
    ];
    return await Attendance.aggregate(topModulesPipeline);
  } catch (error) {
    console.error("Error calculating top modules:", error);
    return []; // Return empty array on error
  }
}

// --- Exported Analysis Functions ---

// Calculate Weekly Participation Trends for Chart
export async function calculateParticipationTrends() {
  console.log("Calculating participation trends...");
  try {
      const weeklyParticipation = {};
  const attendanceData = await Attendance.find({}, 'status date').lean();
      if (!attendanceData || attendanceData.length === 0) {
          console.log("No attendance data found for participation trends.");
          return [];
      }
  attendanceData.forEach(att => {
          const weekKey = moment(att.date).format('YYYY-WW');
      if (!weeklyParticipation[weekKey]) {
          weeklyParticipation[weekKey] = { present: 0, total: 0, week: weekKey };
      }
      weeklyParticipation[weekKey].total++;
      if (att.status === 'Present') {
          weeklyParticipation[weekKey].present++;
      }
  });
  const participationTrends = Object.values(weeklyParticipation).map(weekData => ({
      week: weekData.week,
          rate: calculateAttendanceRate(weekData.present, weekData.total),
      present: weekData.present,
      total: weekData.total
  }));
  participationTrends.sort((a, b) => a.week.localeCompare(b.week));
  return participationTrends;
  } catch (error) {
      console.error("Error calculating participation trends:", error);
      throw new Error("Failed to calculate participation trends.");
  }
}

// Get Student Enrollment Summary (Exported)
export async function getStudentEnrollmentSummary() {
  console.log("Calculating student enrollment summary...");
  try {
    const todayStart = moment().startOf('day').toDate(); const todayEnd = moment().endOf('day').toDate();
    const res = await Students.aggregate([{ $facet: {
      "total": [{ $count: "count" }],
      "byFaculty": [{ $lookup:{from:'faculties',localField:'faculty',foreignField:'_id',as:'f'}},{$unwind:{path:"$f",preserveNullAndEmptyArrays: true}},{$group:{_id:"$f.facultyName",count:{$sum:1}}},{$match:{_id:{$ne:null}}},{$sort:{count:-1}}],
      "byBatch": [{ $lookup:{from:'batches',localField:'batch',foreignField:'_id',as:'b'}},{$unwind:{path:"$b",preserveNullAndEmptyArrays: true}},{$group:{_id:"$b.batchType",count:{$sum:1}}},{$match:{_id:{$ne:null}}},{$sort:{count:-1}}],
      "addedToday": [{$match:{createdAt:{$gte:todayStart,$lt:todayEnd}}},{$count:"count"}]}}]);
    return { totalStudents:res[0]?.total[0]?.count||0, byFaculty:res[0]?.byFaculty||[], byBatch:res[0]?.byBatch||[], addedToday:res[0]?.addedToday[0]?.count||0 };
  } catch (e) { console.error("Err stud summary:", e); throw new Error("Failed to calculate student summary."); }
}

// Get Lecturer Summary (Exported)
export async function getLecturerSummary() {
   console.log("Calculating lecturer summary...");
   try {
    const res = await Lecturers.aggregate([{ $facet: {
      "total": [{ $count: "count" }],
      "byFaculty": [{ $lookup:{from:'faculties',localField:'faculty',foreignField:'_id',as:'f'}},{$unwind:{path:"$f",preserveNullAndEmptyArrays: true}},{$group:{_id:"$f.facultyName",count:{$sum:1}}},{$match:{_id:{$ne:null}}},{$sort:{count:-1}}]
    }}]);
    return { totalLecturers:res[0]?.total[0]?.count||0, byFaculty:res[0]?.byFaculty||[] };
  } catch (e) { console.error("Err lec summary:", e); throw new Error("Failed to calculate lecturer summary."); }
}

// Get Degree Summary (Exported)
export async function getDegreeSummary() {
   console.log("Calculating degree summary...");
   try {
    const res = await Degrees.aggregate([{ $facet: {
      "total": [{ $count: "count" }],
      "byFaculty": [{ $lookup:{from:'faculties',localField:'faculty',foreignField:'_id',as:'f'}},{$unwind:{path:"$f",preserveNullAndEmptyArrays: true}},{$group:{_id:"$f.facultyName",count:{$sum:1}}},{$match:{_id:{$ne:null}}},{$sort:{count:-1}}]
    }}]);
    return { totalDegrees:res[0]?.total[0]?.count||0, byFaculty:res[0]?.byFaculty||[] };
  } catch (e) { console.error("Err deg summary:", e); throw new Error("Failed to calculate degree summary."); }
}

// Get Student Growth Trend (Monthly) (Exported)
export async function getStudentGrowthTrend() {
  console.log("Calculating student growth...");
  try {
    return await Students.aggregate([
      {$group:{_id:{$dateToString:{format:"%Y-%m",date:"$createdAt"}},count:{$sum:1}}},
      {$sort:{"_id":1}},
      {$project:{_id:0,period:"$_id",students:"$count"}}
    ]);
  } catch (e) { console.error("Err stud growth:", e); throw new Error("Failed to calculate student growth trend."); }
}

// Get Students with Low Attendance (Exported)
export async function getStudentsWithLowAttendance(threshold = 70) {
   console.log(`Finding low attendance students (<${threshold}%)...`);
   try {
    return await Attendance.aggregate([
      {$group:{_id:"$student",total:{$sum:1},present:{$sum:{$cond:[{$eq:["$status","Present"]},1,0]}}}},
      {$match:{total:{$gt:0}}},
      {$project:{sId:"$_id",rate:{$multiply:[{$divide:["$present","$total"]},100]}}},
      {$match:{rate:{$lt:threshold}}},
      {$lookup:{from:"students",localField:"sId",foreignField:"_id",as:"sInfo"}},{$unwind:"$sInfo"},
      {$project:{_id:0,studentName:"$sInfo.studentName",studentId:"$sInfo.studentId",attendanceRate:{$round:["$rate",1]}}},
      {$sort:{attendanceRate:1}},{$limit:20}
    ]);
  } catch (e) { console.error("Err low att stud:", e); throw new Error("Failed to find students with low attendance."); }
}

// Get Attendance Details for a Specific Student (Exported)
export async function getAttendanceForStudent(studentId) {
   console.log(`Fetching attendance for student: ${studentId}`);
   try {
    const student = await Students.findOne({studentId: studentId}).lean();
    if (!student) return {error:`Student ${studentId} not found.`};
    const attendance = await Attendance.aggregate([
      {$match:{student:student._id}},
      {$lookup:{from:'timetables',localField:'timetable',foreignField:'_id',as:'tt',pipeline:[{$lookup:{from:'modules',localField:'module',foreignField:'_id',as:'mod'}},{$unwind:{path:"$mod",preserveNullAndEmptyArrays: true}}]}},
      {$unwind:{path:"$tt",preserveNullAndEmptyArrays: true}},
      {$sort:{date:-1}},{$limit:50},
      {$project:{_id:0,date:{$dateToString:{format:"%Y-%m-%d",date:"$date"}},status:1,moduleName:{$ifNull:["$tt.mod.moduleName","N/A"]},sessionType:{$ifNull:["$tt.type","N/A"]},startTime:{$ifNull:["$tt.startTime","N/A"]},day:{$ifNull:["$tt.day","N/A"]}}}
    ]);
    return {studentName:student.studentName,studentId:studentId,attendance:attendance,message:attendance.length===0?"No records found.":undefined};
  } catch (e) { console.error("Err stud att:", e); throw new Error(`Failed to fetch attendance data for student ${studentId}.`); }
}

// Get Average Attendance Rate by Day of the Week (Exported)
export async function getAttendanceByDayOfWeek() {
  console.log("Calculating attendance by day...");
  try {
    const res = await Attendance.aggregate([
      {$lookup:{from:'timetables',localField:'timetable',foreignField:'_id',as:'tt'}},{$unwind:{path:"$tt",preserveNullAndEmptyArrays: true}},
      {$match:{"tt.day":{$exists:true,$ne:null,$ne:""}}},
      {$group:{_id:"$tt.day",total:{$sum:1},present:{$sum:{$cond:[{$eq:["$status","Present"]},1,0]}}}},
      {$match:{total:{$gt:0}}},
      {$project:{_id:0,day:"$_id",rate:{$round:[{$multiply:[{$divide:["$present","$total"]},100]},1]}}}
    ]);
    const order=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    res.sort((a,b)=>order.indexOf(a.day)-order.indexOf(b.day));
    return res;
  } catch (e) { console.error("Err att day:", e); throw new Error("Failed to calculate attendance by day."); }
}

// Get Module Attendance Summary (Identify Low Performing) (Exported)
export async function getModuleAttendanceSummary() {
  console.log("Calculating module attendance summary...");
  try {
    const res = await Attendance.aggregate([
      {$lookup:{from:'timetables',localField:'timetable',foreignField:'_id',as:'tt'}},{$unwind:{path:"$tt",preserveNullAndEmptyArrays: true}},
      {$match:{"tt.module":{$exists:true,$ne:null}}},
      {$group:{_id:"$tt.module",total:{$sum:1},present:{$sum:{$cond:[{$eq:["$status","Present"]},1,0]}}}},
      {$match:{total:{$gt:0}}},
      {$lookup:{from:'modules',localField:'_id',foreignField:'_id',as:'mod'}},{$unwind:{path:"$mod",preserveNullAndEmptyArrays: true}},
      {$project:{_id:0,moduleId:"$_id",moduleName:{$ifNull:["$mod.moduleName","Unknown"]},moduleCode:{$ifNull:["$mod.moduleCode","N/A"]},attendanceRate:{$round:[{$multiply:[{$divide:["$present","$total"]},100]},1]},totalSessions:"$total"}},
      {$sort:{attendanceRate:1}}
    ]);
    return {low:res.slice(0,5),high:res.slice(-5).reverse(),count:res.length};
  } catch (e) { console.error("Err mod summary:", e); throw new Error("Failed to calculate module summary."); }
}

// Get Lecturer Attendance Summary (Identify Low Performing) (Exported)
export async function getLecturerAttendanceSummary() {
  console.log("Calculating lecturer attendance summary...");
   try {
    const res = await Attendance.aggregate([
      {$lookup:{from:'timetables',localField:'timetable',foreignField:'_id',as:'tt'}},{$unwind:{path:"$tt",preserveNullAndEmptyArrays: true}},
      {$match:{"tt.lecturer":{$exists:true,$ne:null}}},
      {$group:{_id:"$tt.lecturer",total:{$sum:1},present:{$sum:{$cond:[{$eq:["$status","Present"]},1,0]}}}},
      {$match:{total:{$gt:0}}},
      {$lookup:{from:'lecturers',localField:'_id',foreignField:'_id',as:'lec'}},{$unwind:{path:"$lec",preserveNullAndEmptyArrays: true}},
      {$project:{_id:0,lecturerId:"$_id",lecturerName:{$ifNull:["$lec.lecturerName","Unknown"]},lecturerCode:{$ifNull:["$lec.lecturerCode","N/A"]},attendanceRate:{$round:[{$multiply:[{$divide:["$present","$total"]},100]},1]},totalSessions:"$total"}},
      {$sort:{attendanceRate:1}}
    ]);
    return {low:res.slice(0,5),high:res.slice(-5).reverse(),count:res.length};
  } catch (e) { console.error("Err lec summary:", e); throw new Error("Failed to calculate lecturer summary."); }
}

// Get Potentially Underutilized Resources (Locations/Time Slots) (Exported)
export async function getUnderutilizedResources() {
  console.log("Analyzing resource utilization...");
  try {
    const peakStart=9,peakEnd=17;
    const locUsage = await Timetables.aggregate([
      {$group:{_id:"$location",count:{$sum:1}}},
      {$lookup:{from:'locations',localField:'_id',foreignField:'_id',as:'loc'}},{$unwind:{path:"$loc",preserveNullAndEmptyArrays: true}},
      {$project:{_id:0,locId:"$_id",locationName:{$ifNull:["$loc.locationName","Unknown"]},locCode:{$ifNull:["$loc.locationCode","N/A"]},sessionCount:"$count"}},
      {$sort:{sessionCount:1}}
    ]);
    const slotUsage = await Timetables.aggregate([
       {$addFields:{hour:{$toInt:{$substr:["$startTime",0,2]}}}},
       {$group:{_id:{day:"$day",time:"$startTime"},count:{$sum:1},isPeak:{$first:{$and:[{$gte:["$hour",peakStart]},{$lt:["$hour",peakEnd]},{$nin:["$day",["Saturday","Sunday"]]}]}}}},
       {$project:{_id:0,day:"$_id.day",startTime:"$_id.time",sessionCount:"$count",isPeak:1}},
       {$sort:{sessionCount:1,day:1,startTime:1}}
    ]);
    return {locations:locUsage.slice(0,5),slots:slotUsage.filter(s=>s.sessionCount<=2).slice(0,10),freePeakSlots:slotUsage.filter(s=>s.isPeak&&s.sessionCount===0).slice(0,5)};
  } catch (e) { console.error("Err resource util:", e); throw new Error("Failed to analyze resource utilization."); }
}

// Get Module Reschedule Frequency (Exported)
export async function getModuleRescheduleFrequency() {
   console.log("Analyzing reschedule frequency...");
   try {
    return await Reschedules.aggregate([
      {$group:{_id:"$module",count:{$sum:1}}},
      {$lookup:{from:'modules',localField:'_id',foreignField:'_id',as:'mod'}},{$unwind:{path:"$mod",preserveNullAndEmptyArrays: true}},
      {$project:{_id:0,modId:"$_id",moduleName:{$ifNull:["$mod.moduleName","Unknown"]},moduleCode:{$ifNull:["$mod.moduleCode","N/A"]},rescheduleCount:"$count"}},
      {$sort:{rescheduleCount:-1}},{$limit:10}
    ]);
  } catch (e) { console.error("Err reschedule freq:", e); throw new Error("Failed to calculate reschedule frequency."); }
}

// Get Attendance Rate by Time/Day/Faculty/Year (Exported)
export async function getAttendanceByDemographics() {
  console.log("Calculating demographic breakdown...");
   try {
    return await Attendance.aggregate([
      {$lookup:{from:'timetables',localField:'timetable',foreignField:'_id',as:'tt'}},{$unwind:{path:"$tt",preserveNullAndEmptyArrays: true}},
      {$lookup:{from:'students',localField:'student',foreignField:'_id',as:'s'}},{$unwind:{path:"$s",preserveNullAndEmptyArrays: true}},
      {$lookup:{from:'faculties',localField:'s.faculty',foreignField:'_id',as:'f'}},{$unwind:{path:"$f",preserveNullAndEmptyArrays: true}},
      {$lookup:{from:'batches',localField:'s.batch',foreignField:'_id',as:'b'}},{$unwind:{path:"$b",preserveNullAndEmptyArrays: true}},
      {$match:{"tt.day":{$ne:null},"tt.startTime":{$ne:null},"f.facultyName":{$ne:null}}},
      {$group:{_id:{day:"$tt.day",slot:{$cond:[{$lt:[{$toInt:{$substr:["$tt.startTime",0,2]}},13]},"Morning","Afternoon"]},fac:"$f.facultyName",yr:{$ifNull:["$b.year","Unknown"]}},total:{$sum:1},present:{$sum:{$cond:[{$eq:["$status","Present"]},1,0]}}}},
      {$match:{total:{$gt:0}}},
      {$project:{_id:0,day:"$_id.day",timeSlot:"$_id.slot",faculty:"$_id.fac",year:"$_id.yr",attendanceRate:{$round:[{$multiply:[{$divide:["$present","$total"]},100]},1]},totalSessions:"$total"}},
      {$sort:{attendanceRate:1,faculty:1,year:1}},{$limit:50}
    ]);
  } catch (e) { console.error("Err demo breakdown:", e); throw new Error("Failed to calculate demographic breakdown."); }
}

// Main Analysis Function for Initial Recommendations (Exported)
export async function generateAttendanceRecommendations() {
  console.log("Fetching data for general recommendations...");
  try {
    const attendanceData = await Attendance.find({})
        .populate({
            path: 'timetable',
          select: 'day startTime type module lecturer' // Include module/lecturer needed by helpers
      })
      .select('status date timetable') // Select only necessary fields from Attendance
        .lean();
      
    if (!attendanceData || attendanceData.length === 0) {
      console.log("No attendance data found for recommendations.");
      return { error: "No attendance data available." };
    }
    console.log(`Fetched ${attendanceData.length} records for recommendations.`);
    
    // Run helpers concurrently
    const [bestTimes, weeklyTrends, topModules] = await Promise.all([
        findBestTimes(attendanceData),
        calculateWeeklyTrends(attendanceData),
        findTopModulesAggregated() // This helper now needs module/lecturer from populated data
    ]);
    console.log("General recommendation analysis complete.");
    return { bestTimes, weeklyTrends, topModules };
  } catch (error) {
      console.error("Error generating recommendations:", error);
      throw new Error("Failed to generate recommendations.");
  }
}
