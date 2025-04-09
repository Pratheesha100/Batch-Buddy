import express from 'express';
import { getAllFaculties, addFaculties } from '../Controllers/AdminController.js';
import { getAllBatches, addBatches  } from '../Controllers/AdminController.js';
import { getAllDegrees, addDegrees, addMultipleDegrees } from '../Controllers/AdminController.js';
import { getAllLocations, addLocations, addMultipleLocations } from '../Controllers/AdminController.js';
import { getAllGroups, addGroups, addMultipleGroups } from '../Controllers/AdminController.js';
import { getAllModules, addModules, addMultipleModule} from '../Controllers/AdminController.js';
import { getAllLecturers, addLecturers, addMultipleLecturers } from '../Controllers/AdminController.js';
import { getAllStudents, addStudents } from '../Controllers/AdminController.js';
import { getAllLecturerModules, addLecturerModules, addMultipleLecModules } from '../Controllers/AdminController.js';
import { getAllStudentGroups, addStudentGroups } from '../Controllers/AdminController.js';
import { getAllStudentModules, addStudentModules } from '../Controllers/AdminController.js';
import { getAllTimetables, addTimetables} from '../Controllers/AdminController.js';
import { getAllEvents, addEvents, updateEvents, deleteEvents } from '../Controllers/AdminController.js';
import { getAllReschedules, addReschedules, updateReschedules, deleteReschedules } from '../Controllers/AdminController.js';

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

//path for groups
router.get("/groups", getAllGroups);
router.post("/addGroups", addGroups);
router.post("/addGroups/bulk", addMultipleGroups);

//path for modules
router.get("/modules", getAllModules);
router.post("/addModules", addModules);
router.post("/modules/bulk", addMultipleModule);

//path for lecturers
router.get("/lecturers", getAllLecturers);
router.post("/addLecturers", addLecturers);
router.post("/lecturers/bulk", addMultipleLecturers);

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


//path for events
router.get("/events", getAllEvents);
router.post("/addEvents", addEvents);
router.put("/updateEvents", updateEvents);
router.delete("/deleteEvents", deleteEvents);


//path for reschedules
router.get("/reschedules", getAllReschedules);
router.post("/addReschedules", addReschedules);
router.put("/updateReschedules", updateReschedules);
router.delete("/deleteReschedules", deleteReschedules);

export default router;