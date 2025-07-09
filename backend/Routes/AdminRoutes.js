import express from 'express';
import { getAllFaculties, addFaculties } from '../Controllers/AdminControllers/AdminController.js';
import { getAllBatches, addBatches  } from '../Controllers/AdminControllers/AdminController.js';
import { getAllDegrees, addDegrees, addMultipleDegrees } from '../Controllers/AdminControllers/AdminController.js';
import { getAllLocations, addLocations, addMultipleLocations, getLocationsByFaculty } from '../Controllers/AdminControllers/AdminController.js';
import { getAllGroups, addGroups, addMultipleGroups, getGroupsByFaculty } from '../Controllers/AdminControllers/AdminController.js';
import { getAllModules, addModules, addMultipleModule,  getModulesByFaculty} from '../Controllers/AdminControllers/AdminController.js';
import { getAllLecturers, addLecturers, addMultipleLecturers, getLecturersByFaculty } from '../Controllers/AdminControllers/AdminController.js';
import { getAllStudents, addStudents } from '../Controllers/AdminControllers/AdminController.js';
import { getAllLecturerModules, addLecturerModules, addMultipleLecModules } from '../Controllers/AdminControllers/AdminController.js';
import { getAllStudentGroups, addStudentGroups } from '../Controllers/AdminControllers/AdminController.js';
import { getAllStudentModules, addStudentModules } from '../Controllers/AdminControllers/AdminController.js';
import { getAllTimetables, addTimetables, updateTimetable, deleteTimetable, getDeletedTodayCount } from '../Controllers/AdminControllers/AdminController.js';
import { getAllEvents, addEvents, updateEvents, deleteEvents } from '../Controllers/AdminControllers/AdminController.js';
import { getAllReschedules, addReschedules, updateReschedules, deleteReschedules } from '../Controllers/AdminControllers/AdminController.js';
import { upload, processTimetableFile } from '../Controllers/AdminControllers/UploadController.js';
import {generateAnalysisReport} from '../Controllers/AdminControllers/ReportController.js';


const router = express.Router();
//path for faculties
router.get("/getFaculties", getAllFaculties);
router.post("/addFaculties", addFaculties);

//path for batches
router.get("/getBatches", getAllBatches);
router.post("/addBatches", addBatches);

//path for degrees
router.get("/getDegrees", getAllDegrees);
router.post("/addDegrees", addDegrees);
router.post("/degrees/bulk", addMultipleDegrees);

//path for locations
router.get("/locations", getAllLocations);
router.post("/addLocations", addLocations);
router.post("/locations/bulk", addMultipleLocations);
router.get("/locations/faculty/:facultyId", getLocationsByFaculty);

//path for groups
router.get("/groups", getAllGroups);
router.post("/addGroups", addGroups);
router.post("/addGroups/bulk", addMultipleGroups);
router.get("/groups/faculty/:facultyId", getGroupsByFaculty);

//path for modules
router.get("/modules", getAllModules);
router.post("/addModules", addModules);
router.post("/modules/bulk", addMultipleModule);
router.get("/modules/faculty/:facultyId", getModulesByFaculty);

//path for lecturers
router.get("/lecturers", getAllLecturers);
router.post("/addLecturers", addLecturers);
router.post("/lecturers/bulk", addMultipleLecturers);
router.get("/lecturers/faculty/:facultyId", getLecturersByFaculty);

//path for students
router.get("/students", getAllStudents);
router.post("/addStudents", addStudents);

//path for lecturer modules
router.get("/lecturerModules", getAllLecturerModules);
router.post("/addLecturerModules", addLecturerModules);
router.post("/lecturerModules/bulk", addMultipleLecModules); 

//path for studentgroups
router.get("/studentGroups", getAllStudentGroups);
router.post("/addStudentGroups", addStudentGroups); 

//path for studentmodules
router.get("/studentModules", getAllStudentModules);
router.post("/addStudentModules", addStudentModules);

//path for timetables
router.get("/timetables", getAllTimetables);
router.post("/addTimetables", addTimetables);
router.put("/updateTimetable/:id", updateTimetable);
router.delete("/deleteTimetable/:id", deleteTimetable);
router.get("/timetables/deleted-today-count", getDeletedTodayCount);
router.post('/uploadTimetable', (req, res) => {
    console.log('Received file:', req.file);
    console.log('Body:', req.body);
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      processTimetableFile(req, res);
    });
  });

//path for events
router.get("/events", getAllEvents);
router.post("/addEvents", addEvents);
router.put("/updateEvents/:id", updateEvents);
router.delete("/deleteEvents/:id", deleteEvents);


//path for reschedules
router.get("/reschedules", getAllReschedules);
router.post("/addReschedules", addReschedules);
router.put("/updateReschedules/:id", updateReschedules);
router.delete("/deleteReschedules/:id", deleteReschedules);

//Download the analysis PDF report
router.get('/analysis', generateAnalysisReport);

export default router;