import mongoose from 'mongoose';
import moment from 'moment'; // Keep if needed for other parts, not used directly here
import Groups from '../Models/Groups.js'; // Adjust path if needed
import Timetables from '../Models/Timetables.js'; // Adjust path
import Location from '../Models/Location.js'; // Adjust path
import Module from '../Models/Modules.js'; // Adjust path
import Lecturers from '../Models/Lecturers.js'; // Adjust path
import Degrees from '../Models/Degrees.js'; // Adjust path
import Faculty from '../Models/Faculty.js'; // Adjust path
import Batches from '../Models/Batches.js'; // Adjust path
import LecturerModule from '../Models/LecturerModule.js'; // Adjust path
// Ensure all models are registered
const models = {
    Groups,
    Timetables,
    Location,
    Module,
    Lecturers,
    Degrees,
    Faculty,
    Batches,
    LecturerModule,
};

// Verify model registration
Object.entries(models).forEach(([name, model]) => {
    if (!model) {
        throw new Error(`Model ${name} failed to register properly`);
    }
});

// --- Configuration ---
const MONGODB_URI = 'mongodb+srv://myAtlasDBUser:batchbuddy123@batch-buddy.ei7he.mongodb.net/?retryWrites=true&w=majority';
const GROUP_LIMIT = 52;
const MAX_MODULES_PER_GROUP = 5;
const WEEKDAY_BATCH_ID = '67f5359c10409250e6e3f2ce';
const WEEKEND_BATCH_ID = '67f535a610409250e6e3f2d0';

// Updated time configurations
const WEEKDAY_START_HOUR = 8.5; // 8:30 AM
const WEEKDAY_END_HOUR = 20.0;  // 8:00 PM
const WEEKEND_EVENING_START = 18.0; // 6:00 PM
const WEEKEND_EVENING_END = 20.0;   // 8:00 PM
const WEEKEND_DAY_START = 8.5;      // 8:30 AM
const WEEKEND_DAY_END = 20.0;       // 8:00 PM
const TIME_SLOT_INCREMENT = 0.5;

const SESSION_CONFIG = {
    'Lecture': { duration: 1.5, locationType: 'Lecture Hall' },  // Reduced from 2 hours
    'Practical': { duration: 1.5, locationType: 'Laboratory' }, // Reduced from 2 hours
    'Tutorial': { duration: 1, locationType: 'Lecture Hall' },  // Keep 1 hour
};
// --- End Configuration ---

// --- Global Conflict Trackers ---
const locationUsedSlots = {};
const lecturerUsedSlots = {};

// --- Helper Functions ---

// --- Helper Functions ---
function isOverlapping(tracker, resourceId, day, proposedStartTime, proposedEndTime) {
    const key = `${resourceId}-${day}`;
    if (!tracker[key]) return false;
    for (const slot of tracker[key]) {
        if (proposedStartTime < slot.endTime && proposedEndTime > slot.startTime) {
            return true;
        }
    }
    return false;
}

function addSlot(tracker, resourceId, day, startTime, endTime) {
    const key = `${resourceId}-${day}`;
    if (!tracker[key]) tracker[key] = [];
    tracker[key].push({ startTime, endTime });
}

function hourToTime(hourFloat) {
    const totalMinutes = Math.round(hourFloat * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// --- Main Insertion Logic ---
async function insertTimetableRecords() {
    console.log('Starting timetable generation...');
    let connection;
    try {
        connection = await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected');

        console.log('Fetching initial data...');
        // Fetch Groups with necessary population
        const groups = await Groups.find()
            .limit(GROUP_LIMIT)
            .populate('degree faculty batch') // Keep population needed for group logic
            .lean();

        // Fetch Locations
        const allLocations = await Location.find().lean();

        // Fetch Modules (NO LONGER populating lecturerInCharge here)
        const allModules = await Module.find().lean();

        // *** FETCH LecturerModule Mapping Data ***
        const allLecturerModules = await LecturerModule.find().lean();

        // Validate fetched data
        if (!groups.length || !allLocations.length || !allModules.length || !allLecturerModules.length) {
            console.error('Missing essential data (groups, locations, modules, or lecturer-module mappings). Exiting.');
            console.log(`Counts - Groups: ${groups.length}, Locations: ${allLocations.length}, Modules: ${allModules.length}, LecturerModules: ${allLecturerModules.length}`);
            if (connection) await mongoose.disconnect();
            return;
        }

        // *** CREATE Lecturer Lookup Map (ModuleId -> LecturerId) ***
        const moduleLecturerMap = allLecturerModules.reduce((map, entry) => {
            if (entry.moduleCode && entry.lecturerCode) {
                // Use toString() for reliable key matching with ObjectIds
                map.set(entry.moduleCode.toString(), entry.lecturerCode);
            }
            return map;
        }, new Map());
        console.log(`Created map for ${moduleLecturerMap.size} module-lecturer assignments.`);

        // Organize locations by type
        const locationsByType = allLocations.reduce((acc, loc) => {
            const type = loc.locationType;
            if (!acc[type]) acc[type] = [];
            acc[type].push(loc);
            return acc;
        }, {});
        console.log(`Fetched ${groups.length} groups, ${allLocations.length} locations, ${allModules.length} modules.`);
        console.log('Location types found:', Object.keys(locationsByType));

        const timetableRecordsToInsert = [];
        let scheduledCount = 0;
        let failedToScheduleCount = 0;

        for (const group of groups) {
            console.log(`--- Processing Group: ${group.groupNum || group._id} (Year: ${group.year}, Sem: ${group.semester}, Batch: ${group.batch?.batchType}) ---`);

            if (!group.degree || !group.faculty || !group.batch || !group.year || group.semester === undefined || group.semester === null) {
                console.warn(`Skipping group ${group.groupNum || group._id} due to missing populated fields or year/semester.`);
                continue;
            }

            // Updated day and time slot configuration
            let applicableDays = [];
            let startHour, endHour;
            
            if (group.batch.batchType === 'Weekday') {
                applicableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                startHour = WEEKDAY_START_HOUR;
                endHour = WEEKDAY_END_HOUR;
            } else if (group.batch.batchType === 'Weekend') {
                applicableDays = ['Thursday', 'Friday', 'Saturday', 'Sunday'];
                // For Thursday and Friday, only evening slots
                startHour = WEEKEND_EVENING_START;
                endHour = WEEKEND_EVENING_END;
            } else {
                console.warn(`Group ${group.groupNum || group._id} has unknown batch type. Skipping.`);
                continue;
            }

            const modulesForGroupDegree = allModules.filter(m => m.degree.toString() === group.degree._id.toString());
            const selectedModules = modulesForGroupDegree.slice(0, MAX_MODULES_PER_GROUP);

            if (selectedModules.length === 0) {
                continue;
            }

            for (const currentModule of selectedModules) {
                const lecturerId = moduleLecturerMap.get(currentModule._id.toString());

                if (!lecturerId) {
                    console.warn(`   Skipping Module ${currentModule.moduleCode}: No lecturer found in LecturerModule mapping.`);
                    continue;
                }

                for (const sessionType in SESSION_CONFIG) {
                    const config = SESSION_CONFIG[sessionType];
                    const requiredLocationType = config.locationType;
                    const duration = config.duration;
                    let sessionScheduled = false;

                    const suitableLocations = locationsByType[requiredLocationType] || [];
                    if (suitableLocations.length === 0) {
                        failedToScheduleCount++;
                        continue;
                    }

                    findSlotLoop:
                    for (const location of suitableLocations) {
                        const locationId = location._id;
                        for (const day of applicableDays) {
                            // Adjust time slots based on day for weekend batches
                            let currentStartHour = startHour;
                            let currentEndHour = endHour;
                            
                            // For weekend batches, use full day slots on Saturday and Sunday
                            if (group.batch.batchType === 'Weekend' && (day === 'Saturday' || day === 'Sunday')) {
                                currentStartHour = WEEKEND_DAY_START;
                                currentEndHour = WEEKEND_DAY_END;
                            }

                            for (let potentialStartTime = currentStartHour; potentialStartTime + duration <= currentEndHour; potentialStartTime += TIME_SLOT_INCREMENT) {
                                const potentialEndTime = potentialStartTime + duration;

                                const locationConflict = isOverlapping(locationUsedSlots, locationId, day, potentialStartTime, potentialEndTime);
                                const lecturerConflict = isOverlapping(lecturerUsedSlots, lecturerId, day, potentialStartTime, potentialEndTime);

                                if (!locationConflict && !lecturerConflict) {
                                    addSlot(locationUsedSlots, locationId, day, potentialStartTime, potentialEndTime);
                                    addSlot(lecturerUsedSlots, lecturerId, day, potentialStartTime, potentialEndTime);

                                    timetableRecordsToInsert.push({
                                        module: currentModule._id,
                                        day: day,
                                        startTime: hourToTime(potentialStartTime),
                                        endTime: hourToTime(potentialEndTime),
                                        location: locationId,
                                        lecturer: lecturerId,
                                        group: group._id,
                                        batch: group.batch._id,
                                        faculty: group.faculty._id,
                                        year: group.year,
                                        semester: group.semester,
                                        type: sessionType
                                    });

                                    sessionScheduled = true;
                                    scheduledCount++;
                                    break findSlotLoop;
                                }
                            }
                        }
                    }

                    if (!sessionScheduled) {
                        failedToScheduleCount++;
                    }
                }
            }
        }

        // Insert records
        if (timetableRecordsToInsert.length > 0) {
            console.log(`--- Summary ---`);
            console.log(`Attempted to schedule for ${groups.length} groups.`);
            console.log(`Successfully scheduled ${scheduledCount} sessions.`);
            console.log(`Failed to find slots for ${failedToScheduleCount} sessions.`);
            console.log(`Generated ${timetableRecordsToInsert.length} timetable records. Inserting...`);
            const result = await Timetables.insertMany(timetableRecordsToInsert, { ordered: false });
            console.log(`Database Insert Result: ${result.length} records inserted.`);
        } else {
            console.log('No timetable records were generated or successfully scheduled.');
        }

    } catch (error) {
        console.error('Error during timetable generation:', error);
        if (error.writeErrors) {
            console.error("Write Errors (limit 5):", error.writeErrors.slice(0, 5));
        }
    } finally {
        if (connection) {
            await mongoose.disconnect();
            console.log('MongoDB disconnected. Script finished.');
        }
    }
}

// Run the insertion function
insertTimetableRecords();
