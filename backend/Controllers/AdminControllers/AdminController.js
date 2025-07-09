import Faculties from '../../Models/Faculty.js';
import Batches from '../../Models/Batches.js';
import Degrees from '../../Models/Degrees.js';
import Locations from '../../Models/Location.js';
import Groups from '../../Models/Groups.js';
import Modules from '../../Models/Modules.js';
import Lecturers from '../../Models/Lecturers.js';
import Students from '../../Models/Students.js';
import LecturerModule from '../../Models/LecturerModule.js';
import StudentGroup from '../../Models/StudentGroups.js';
import StudentModule from '../../Models/StudentModules.js';
import Timetable from '../../Models/Timetables.js';
import Events from '../../Models/Events.js';
import Reschedules from '../../Models/Reschedules.js';

//Faculties model
//Get all faculties
const getAllFaculties = async (req, res,) => {
    try {
        const faculties = await Faculties.find();

        if (!faculties || faculties.length === 0) {
            return res.status(404).json({ message: 'No faculties found' });
        }

        res.status(200).json(faculties);//display the faculties
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching faculties' });
    }
};
export { getAllFaculties };

//create faculties
const addFaculties = async (req, res) => {
    const { facultyName, facultyCode } = req.body;
    //input validation
    if (!facultyName || !facultyCode) {
        return res.status(404).json({ message: 'facultyName and facultyCode are required' });
    }

    try {
        const newFaculty = new Faculties({ facultyName, facultyCode });
        await newFaculty.save();
        res.status(200).json(newFaculty);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating faculty' });
    }
}
export { addFaculties };

//update fculties

//delete faculties
//---------------------------------------------------------------------------------------------------------------------------------------------




//Batches model
//Get all batches
const getAllBatches = async (req, res,) => {
    try {
        const batches = await Batches.find();

        if (!batches || batches.length === 0) {
            return res.status(404).json({ message: 'No batches found' });
        }

        res.status(200).json(batches);//display the batches
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching bathes' });
    }
};
export { getAllBatches };

//create batches
const addBatches = async (req, res) => {
    const { batchType, studentCount } = req.body;
    //input validation
    if (!batchType || !studentCount) {
        return res.status(404).json({ message: 'batchType and studentCount are required' });
    }

    try {
        const newBatch = new Batches({ batchType, studentCount });
        await newBatch.save();
        res.status(200).json(newBatch);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating batch' });
    }
}
export { addBatches };

//update batches

//delete batches
//---------------------------------------------------------------------------------------------------------------------------------------------




//Degrees model
//Get all degrees
const getAllDegrees = async (req, res,) => {
    try {
        const degrees = await Degrees.find();

        if (!degrees || degrees.length === 0) {
            return res.status(404).json({ message: 'No degrees found' });
        }

        res.status(200).json(degrees);//display the degrees
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching degrees' });
    }
};
export { getAllDegrees };

//create degrees
const addDegrees = async (req, res) => {
    const { degreeName, degreeCode, faculty, duration } = req.body;
    //input validation
    if (!degreeName || !degreeCode || !faculty || !duration) {
        return res.status(404).json({ message: 'degreeName, degreeCode, faculty and duration are required' });
    }

    try {
        const newDegree = new Degrees({ degreeName, degreeCode, faculty, duration });
        await newDegree.save();
        res.status(200).json(newDegree);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating degree' });
    }
}
export { addDegrees };

// Bulk insert degrees
const addMultipleDegrees = async (req, res) => {
    const degrees = req.body;

    if (!Array.isArray(degrees) || degrees.length === 0) {
        return res.status(400).json({ message: 'Please provide an array of degrees' });
    }

    try {
        const insertedDegrees = await Degrees.insertMany(degrees);
        res.status(201).json({ message: 'Degrees added successfully', data: insertedDegrees });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting degrees' });
    }
};

export { addMultipleDegrees };


//update degrees

//delete degrees
//---------------------------------------------------------------------------------------------------------------------------------------------





//Locations model
//Get all locations
const getAllLocations = async (req, res,) => {
    try {
        const locations = await Locations.find().populate('faculty', 'facultyName').lean();

        if (!locations || locations.length === 0) {
            return res.status(404).json({ message: 'No locations found' });
        }

        res.status(200).json(locations);//display the locations
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching locations' });
    }
};
export { getAllLocations };

// Get locations by faculty
const getLocationsByFaculty = async (req, res) => {
    const { facultyId } = req.params;
    try {
        const locations = await Locations.find({ faculty: facultyId })
            .populate('faculty', 'facultyName')
            .lean();
        if (!locations || locations.length === 0) {
            return res.status(404).json({ message: 'No locations found for this faculty' });
        }
        res.status(200).json(locations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching locations' });
    }
};

export { getLocationsByFaculty };


//create locations
const addLocations = async (req, res) => {
    const { locationName, locationCode, faculty, locationType } = req.body;
    //input validation
    if (!locationName || !locationCode || !faculty || !locationType) {
        return res.status(404).json({ message: 'locationName, locationCode, faculty and locationType are required' });
    }

    try {
        const newLocation = new Locations({ locationName, locationCode, faculty, locationType });
        await newLocation.save();
        res.status(200).json(newLocation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating location' });
    }
}
export { addLocations };

// Bulk insert locations
const addMultipleLocations = async (req, res) => {
    const locations = req.body;

    if (!Array.isArray(locations) || locations.length === 0) {
        return res.status(400).json({ message: 'Please provide an array of groups' });
    }

    try {
        const insertedlocations = await Locations.insertMany(locations);
        res.status(201).json({ message: 'Locations added successfully', data: insertedlocations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting locations' });
    }
};
export { addMultipleLocations };


//update locations


//delete locations
//---------------------------------------------------------------------------------------------------------------------------------------------




//Groups model
//Get all groups
const getAllGroups = async (req, res,) => {
    try {
        const groups = await Groups.find().lean();

        if (!groups || groups.length === 0) {
            return res.status(404).json({ message: 'No groups found' });
        }

        res.status(200).json(groups);//display the groups
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching groups' });
    }
};
export { getAllGroups };

// Get groups by faculty
const getGroupsByFaculty = async (req, res) => {
    const { facultyId } = req.params;
    try {
        const groups = await Groups.find({ faculty: facultyId })
            .populate('degree', 'degreeName')
            .populate('batch', 'batchType')
            .lean();
        if (!groups || groups.length === 0) {
            return res.status(404).json({ message: 'No groups found for this faculty' });
        }
        res.status(200).json(groups);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching groups' });
    }
};

export { getGroupsByFaculty };

//create groups
const addGroups = async (req, res) => {
    const { groupNum, degree, faculty, batch, year, semester, studentCount } = req.body;
    //input validation
    if (!groupNum || !degree || !faculty || !batch || !year || !semester || !studentCount) {
        return res.status(404).json({ message: 'groupNum, degree, faculty, batch, year, student count and semester are required' });
    }

    try {
        const newGroup = new Groups({ groupNum, degree, faculty, batch, year, semester, studentCount });
        await newGroup.save();
        res.status(200).json(newGroup);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating group' });
    }
}
export { addGroups };

// Bulk insert groups
const addMultipleGroups = async (req, res) => {
    const groups = req.body;

    if (!Array.isArray(groups) || groups.length === 0) {
        return res.status(400).json({ message: 'Please provide an array of groups' });
    }

    try {
        const insertedGroups = await Groups.insertMany(groups);
        res.status(201).json({ message: 'Groups added successfully', data: insertedGroups });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting groups' });
    }
};

export { addMultipleGroups };


//update groups


//delete groups
//---------------------------------------------------------------------------------------------------------------------------------------------





//Modules model
//Get all modules
const getAllModules = async (req, res,) => {
    try {
        const modules = await Modules.find();

        if (!modules || modules.length === 0) {
            return res.status(404).json({ message: 'No modules found' });
        }

        res.status(200).json(modules);//display the modules
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching modules' });
    }
};
export { getAllModules };

// Get modules by faculty
const getModulesByFaculty = async (req, res) => {
    const { facultyId } = req.params;
    try {
        const modules = await Modules.find({ faculty: facultyId }).lean();
        if (!modules || modules.length === 0) {
            return res.status(404).json({ message: 'No modules found for this faculty' });
        }
        res.status(200).json(modules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching modules' });
    }
};

export { getModulesByFaculty };

//create modules
const addModules = async (req, res) => {
    const { moduleCode, moduleName, degree, year, credits, faculty, lecturerInCharge } = req.body;
    //input validation
    if (!moduleCode || !moduleName || !degree || !year || !credits || !faculty || !lecturerInCharge) {
        return res.status(404).json({ message: 'moduleCode, moduleName, degree, year, credits, faculty and lecturerInCharge are required' });
    }

    try {
        const newModule = new Modules({ moduleCode, moduleName, degree, year, credits, faculty, lecturerInCharge});
        await newModule.save();
        res.status(200).json(newModule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating module' });
    }
}
export { addModules };

// Bulk insert modules
const addMultipleModule = async (req, res) => {
    const modules = req.body;

    if (!Array.isArray(modules) || modules.length === 0) {
        return res.status(400).json({ message: 'Please provide an array of modules' });
    }

    try {
        const inserted = await Modules.insertMany(modules);
        res.status(201).json({ message: 'Modules added successfully', data: inserted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting Modules' });
    }
};

export { addMultipleModule };

//update modules

//delete modules
// ---------------------------------------------------------------------------------------------------------------------------------------------




//Lecturers model
//Get all lecturers
const getAllLecturers = async (req, res,) => {
    try {
        const lecturers = await Lecturers.find()
            .populate('faculty', 'facultyName')
            .lean();

        if (!lecturers || lecturers.length === 0) {
            return res.status(404).json({ message: 'No lecturers found' });
        }

        res.status(200).json(lecturers);//display the lecturers
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching lecturers' });
    }
};
export { getAllLecturers };

// Get lecturers by faculty
const getLecturersByFaculty = async (req, res) => {
    const { facultyId } = req.params;
    try {
        const lecturers = await Lecturers.find({ faculty: facultyId })
            .populate('faculty', 'facultyName')
            .lean();
        if (!lecturers || lecturers.length === 0) {
            return res.status(404).json({ message: 'No lecturers found for this faculty' });
        }
        res.status(200).json(lecturers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching lecturers' });
    }
};

export { getLecturersByFaculty };


//create lecturers
const addLecturers = async (req, res) => {
    const { lecturerName, lecturerCode, lecturerEmail, faculty } = req.body;
    //input validation
    if (!lecturerName || !lecturerCode || !lecturerEmail || !faculty) {
        return res.status(404).json({ message: 'lecturerName, lecturerCode, lecturerEmail and faculty are required' });
    }

    try {
        const newLecturer = new Lecturers({ lecturerName, lecturerCode, lecturerEmail, faculty });
        await newLecturer.save();
        res.status(200).json(newLecturer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating lecturer' });
    }
}
export { addLecturers };

// Bulk insert lecturers
const addMultipleLecturers = async (req, res) => {
    const lecturers = req.body;

    if (!Array.isArray(lecturers) || lecturers.length === 0) {
        return res.status(400).json({ message: 'Please provide an array of lecturers' });
    }

    try {
        const inserted = await Lecturers.insertMany(lecturers);
        res.status(201).json({ message: 'Lecturers added successfully', data: inserted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting lecurers' });
    }
};

export {addMultipleLecturers };

//update lecturers

//delete lecturers
//---------------------------------------------------------------------------------------------------------------------------------------------




//Students model
//Get all students
const getAllStudents = async (req, res,) => {
    try {
        const students = await Students.find()
            .populate('faculty', 'facultyName')
            .populate('batch', 'batchType')
            .populate('degree', 'degreeName')
            .lean();

        if (!students || students.length === 0) {
            return res.status(404).json({ message: 'No students found' });
        }

        res.status(200).json(students);//display the students
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching students' });
    }
};
export { getAllStudents };

//create students
const addStudents = async (req, res) => {
    const { studentName, studentId, contactNumber, address, birthday, email, degree, faculty, batch } = req.body;
    //input validation
    if (!studentName || !studentId || !contactNumber || !address || !birthday || !email || !degree || !faculty || !batch) { 
        return res.status(404).json({ message: 'studentName, studentId, studentEmail, faculty, batch and group are required' });
    }

    try {
        const newStudent = new Students({ studentName, studentId, contactNumber, address, birthday, email, degree, faculty, batch });
        await newStudent.save();
        res.status(200).json(newStudent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating student' });
    }
}
export { addStudents };

//update students


//delete students
//---------------------------------------------------------------------------------------------------------------------------------------------




//LecturerModule model
//Get all lecturer modules
const getAllLecturerModules = async (req, res,) => {
    try {
        const lecturerModules = await LecturerModule.find();

        if (!lecturerModules || lecturerModules.length === 0) {
            return res.status(404).json({ message: 'No lecturer modules found' });
        }

        res.status(200).json(lecturerModules);//display the lecturer modules
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching lecturer modules' });
    }
};
export { getAllLecturerModules };

//create lecturerModules
const addLecturerModules = async (req, res) => {
   try{
        const { lecturerCode, moduleCode, duration } = req.body;
        //input validation
        if (!lecturerCode || !moduleCode || !duration) {
            return res.status(404).json({ message: 'lecturerCode, moduleCode and duration are required' });
        }

        const newLecturerModule = new LecturerModule({ lecturerCode, moduleCode, duration });
        await newLecturerModule.save();
        res.status(200).json(newLecturerModule);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating lecturer module' });
    }   
   }
export { addLecturerModules }; 

// Bulk insert lecturers
const addMultipleLecModules = async (req, res) => {
    const lecModules = req.body;

    if (!Array.isArray(lecModules) || lecModules.length === 0) {
        return res.status(400).json({ message: 'Please provide an array of lecModules' });
    }

    try {
        const inserted = await LecturerModule.insertMany(lecModules);
        res.status(201).json({ message: 'LecModules added successfully', data: inserted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting lecModules' });
    }
};

export { addMultipleLecModules };




//update lecturerModules

//delete lecturerModules
//---------------------------------------------------------------------------------------------------------------------------------------------



//StudentGroup model
//Get all student groups
const getAllStudentGroups = async (req, res,) => {
    try {
        const studentGroups = await StudentGroup.find();

        if (!studentGroups || studentGroups.length === 0) {
            return res.status(404).json({ message: 'No student groups found' });
        }

        res.status(200).json(studentGroups);//display the student groups
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching student groups' });
    }
};
export { getAllStudentGroups };

//create student groups
const addStudentGroups = async (req, res) => {
    const { studentId, groupNum } = req.body;
    //input validation
    if (!studentId || !groupNum) {
        return res.status(404).json({ message: 'groupNum and studentId are required' });
    }

    try {
        const newStudentGroup = new StudentGroup({ studentId, groupNum });
        await newStudentGroup.save();
        res.status(200).json(newStudentGroup);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating student group' });
    }
}
export { addStudentGroups };

//update student groups

//delete student groups
//---------------------------------------------------------------------------------------------------------------------------------------------


//StudentModule model
//Get all student modules
const getAllStudentModules = async (req, res,) => {
    try {
        const studentModules = await StudentModule.find();

        if (!studentModules || studentModules.length === 0) {
            return res.status(404).json({ message: 'No student modules found' });
        }

        res.status(200).json(studentModules);//display the student modules
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching student modules' });
    }
};
export { getAllStudentModules };

//create student modules
const addStudentModules = async (req, res) => {
    const { studentId, moduleCode } = req.body;
    //input validation
    if (!studentId || !moduleCode) {
        return res.status(404).json({ message: 'studentId and moduleCode are required' });
    }

    try {
        const newStudentModule = new StudentModule({ studentId, moduleCode });
        await newStudentModule.save();
        res.status(200).json(newStudentModule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating student module' });
    }
}
export { addStudentModules };

//update student modules

//delete student modules
//----------------------------------------------------------------------------------------------------------------------



//Timetable model
//Get all timetables
const getAllTimetables = async (req, res) => {
    try {
        const timetables = await Timetable.find()
            .populate('module', 'moduleCode moduleName')
            .populate('location', 'locationCode locationName')
            .populate('lecturer', 'lecturerCode lecturerName')
            .populate('group', 'groupNum year semester')
            .populate('batch', 'batchType')
            .populate('faculty', 'facultyName')
            .lean();
        res.status(200).json(timetables);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching timetables' });
    }
};
export { getAllTimetables };

//create timetables
const addTimetables = async (req, res) => {
    const timetableData = req.body;

    // Check if the input is an array (from bulk upload/preview confirm)
    if (Array.isArray(timetableData)) {
        // --- Bulk Insert Logic ---
        if (timetableData.length === 0) {
            return res.status(400).json({ message: 'No timetable entries provided.' });
        }

        // Optional: Filter out entries flagged as invalid during mapping, if the flag exists
        const validEntries = timetableData.filter(entry => entry._isValidForSave !== false);
        const invalidCount = timetableData.length - validEntries.length;

        if (validEntries.length === 0) {
             return res.status(400).json({ message: 'No valid timetable entries found to save after processing.' });
        }

        console.log(`Attempting to bulk insert ${validEntries.length} timetable entries...`);

        try {
            // Use insertMany for efficiency
            // Note: Mongoose insertMany bypasses schema validation & middleware by default.
            // Add explicit validation here if complex rules are needed beyond schema types.
            const insertedTimetables = await Timetable.insertMany(validEntries, { ordered: false }); // ordered: false allows partial success on errors like duplicates

            const successCount = insertedTimetables.length;
            let message = `Successfully added ${successCount} timetable entries.`;
            if (invalidCount > 0) {
                message += ` ${invalidCount} entries were skipped due to mapping errors or missing required fields.`;
            }
            console.log(message);

            // Respond with success count and informational message
            res.status(201).json({
                message: message,
                count: successCount
            });

        } catch (err) {
             console.error("Error during bulk timetable insert:", err);
             // Handle potential bulk write errors
             let errorMessage = err.message;
             let statusCode = 500;
             if (err.name === 'MongoBulkWriteError' && err.writeErrors) {
                errorMessage = `Failed to insert some entries. ${err.writeErrors.length} errors occurred. First error: ${err.writeErrors[0].errmsg}`;
                // Keep status 500, but provide more detail
             } else if (err.name === 'ValidationError'){
                 statusCode = 400; // If validation somehow runs and fails
                 errorMessage = `Validation Error: ${err.message}`;
             }
             res.status(statusCode).json({ message: `Error saving timetable entries: ${errorMessage}` });
        }

    } else {
        // --- Single Insert Logic (Manual Add Form) ---
        const { module, day, startTime, endTime, location, lecturer, group, year, semester, batch, faculty, type } = timetableData;

        // Validate required fields for single entry
        const requiredSingle = ['module', 'day', 'startTime', 'endTime', 'location', 'lecturer', 'group', 'year', 'semester', 'batch', 'faculty', 'type'];
        const missingSingle = requiredSingle.filter(f => !timetableData[f]);
        if (missingSingle.length > 0) {
           return res.status(400).json({ message: `Missing required fields for single entry: ${missingSingle.join(', ')}` });
        }

        try {
            const newTimetable = new Timetable({ module, day, startTime, endTime, location, lecturer, group, year, semester, batch, faculty, type });
            await newTimetable.save(); // .save() runs full validation and middleware

            // Populate the single saved document before sending back
            const populatedTimetable = await Timetable.findById(newTimetable._id)
                .populate('module', 'moduleCode moduleName')
                .populate('location', 'locationCode locationName')
                .populate('lecturer', 'lecturerCode lecturerName')
                .populate('group', 'groupNum year semester')
                .populate('batch', 'batchType')
                .populate('faculty', 'facultyName')
                .lean();

            res.status(201).json(populatedTimetable); // Send back the single populated entry

        } catch (err) {
            console.error("Error creating single timetable:", err);
            if (err.name === 'ValidationError') {
                 return res.status(400).json({ message: `Validation Error: ${err.message}` });
            }
            res.status(500).json({ message: `Error creating timetable entry: ${err.message}` });
        }
    }
};
export { addTimetables };

//update timetables
const updateTimetable = async (req, res) =>{
    const { id } = req.params;
    const { module, day, startTime, endTime, location, lecturer, group, year,semester, faculty, type } = req.body;

    // Input validation
    if (!module || !day || !startTime || !endTime || !location || !lecturer || !group || !year || !semester || !faculty || !type) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const updateTimetable = await Timetable.findByIdAndUpdate(id, { module, day, startTime, endTime, location, lecturer, group, year,semester, faculty, type }, { new: true });

        if (!updateTimetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }

        res.status(200).json(updateTimetable);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating timetable' });
    }
}
export { updateTimetable };

//delete timetables
const deleteTimetable = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTimetable = await Timetable.findByIdAndDelete(id);

        if (!deletedTimetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }

        res.status(200).json({ message: 'Timetable deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting timetable' });
    }
}
export { deleteTimetable };
//---------------------------------------------------------------------------------------------------------------------------------------------



//Events model
//Get all events
const getAllEvents = async (req, res,) => {
    try {
        const events = await Events.find().populate('faculty', 'facultyName').lean();

        if (!events || events.length === 0) {
            return res.status(404).json({ message: 'No events found' });
        }

        res.status(200).json(events);//display the events
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching events' });
    }
};
export { getAllEvents };

//create events
const addEvents = async (req, res) => {
    const { eventName, eventDescription, eventDate, time, location, faculty } = req.body;
    //input validation
    if (!eventName || !eventDescription || !eventDate || !time || !location || !faculty) {
        return res.status(404).json({ message: 'eventName, eventDescription, eventDate, time, location and faculty are required' });
    }

    try {
        const newEvent = new Events({ eventName, eventDescription, eventDate, time, location, faculty });
        await newEvent.save();
        res.status(200).json(newEvent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating event' });
    }
}
export { addEvents };

//update events

const updateEvents = async (req, res) => {
    const { id } = req.params;
    const { eventName, eventDescription, eventDate, time, location, faculty } = req.body;

    // Input validation
    if (!eventName || !eventDescription || !eventDate || !time || !location || !faculty) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const updatedEvent = await Events.findByIdAndUpdate(id, { eventName, eventDescription, eventDate, time, location, faculty }, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json(updatedEvent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating event' });
    }
}
export { updateEvents };

//delete events
const deleteEvents = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedEvent = await Events.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting event' });
    }
}
export { deleteEvents };
//-------------------------------------------------------------------------------------------------------------------------------------------



//Reschedules model
//Get all reschedules
const getAllReschedules = async (req, res,) => {
    try {
        const reschedules = await Reschedules.find()
            .populate('faculty', 'facultyName')
            .populate('module', 'moduleName')
            .populate('group', 'groupNum')
            .populate('location', 'locationName locationCode')
            .populate('lecturer', 'lecturerName')
            .populate('batch', 'batchType')
            .lean();

        if (!reschedules || reschedules.length === 0) {
            return res.status(404).json({ message: 'No reschedules found' });
        }

        res.status(200).json(reschedules);//display the reschedules
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching reschedules' });
    }
};
export { getAllReschedules };

//create reschedules
const addReschedules = async (req, res) => {
    const { module, oldDate, newDate, startTime, endTime, location, lecturer, year, group, batch, faculty, type } = req.body;
    //input validation
    if (!module || !oldDate || !newDate || !startTime || !endTime || !location || !lecturer || !year || !group || !batch || !faculty || !type) {
        return res.status(404).json({ message: 'module, oldDate, newDate, startTime, endTime, location, lecturer, year, group, batch, faculty and type are required' });
    }

    try {
        const newReschedule = new Reschedules({ module, oldDate, newDate, startTime, endTime, location, lecturer, year, group, batch, faculty, type });
        await newReschedule.save();
        res.status(200).json(newReschedule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating reschedule' });
    }
}
export { addReschedules };

//update reschedules
const updateReschedules = async (req, res) => {
    const { id } = req.params;
    const { module, oldDate, newDate, startTime, endTime, location, lecturer, year, group, batch, faculty, type } = req.body;

    // Input validation
    if (!module || !oldDate || !newDate || !startTime || !endTime || !location || !lecturer || !year || !group || !batch || !faculty || !type) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const updatedReschedule = await Reschedules.findByIdAndUpdate(id, { module, oldDate, newDate, startTime, endTime, location, lecturer, year, group, batch, faculty, type }, { new: true });

        if (!updatedReschedule) {
            return res.status(404).json({ message: 'Reschedule not found' });
        }

        res.status(200).json(updatedReschedule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating reschedule' });
    }
}
export { updateReschedules };

//delete reschedules
const deleteReschedules = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedReschedule = await Reschedules.findByIdAndDelete(id);

        if (!deletedReschedule) {
            return res.status(404).json({ message: 'Reschedule not found' });
        }

        res.status(200).json({ message: 'Reschedule deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting reschedule' });
    }
}
export { deleteReschedules };

// Get count of timetables deleted today (Placeholder)
const getDeletedTodayCount = async (req, res) => {
    try {
        // --- Placeholder Logic --- 
        // This requires a proper tracking mechanism (e.g., soft delete with deletedAt timestamp
        // or an audit log) to determine which timetables were deleted today.
        // For now, returning 0.
        //
        // Example (if using soft delete with deletedAt):
        // const today = new Date();
        // today.setHours(0, 0, 0, 0);
        // const tomorrow = new Date(today);
        // tomorrow.setDate(tomorrow.getDate() + 1);
        // const count = await Timetable.countDocuments({
        //     deletedAt: { $gte: today, $lt: tomorrow }
        // });

        const count = 0; // Replace with actual query logic later

        res.status(200).json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching deleted timetable count' });
    }
};
export { getDeletedTodayCount };







