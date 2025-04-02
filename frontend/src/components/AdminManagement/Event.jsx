import React, { useState } from "react";
import Nav from "./Navigation/Navbar";
import Header from "./Navigation/Header";
import Footer from "./Navigation/Footer";
import locationIcon from "../../assets/location.png";
import editIcon from "../../assets/edit.png";
import addIcon from "../../assets/add.png";
import deleteIcon from "../../assets/delete.png";
import timeIcon from "../../assets/time.png";
//import { useNavigate } from "react-router-dom";
import AddReschedule from "./AddReschedule";
import UpdateReschedule from "./UpdateReschedule";
import AddEvent from "./AddEvent";
import UpdateEvent from "./UpdateEvent";
import "./shared.css";
import "./event.css";

function Event() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'event' or 'schedule'
  //const navigate = useNavigate();

  // Sample data for schedules
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      faculty: "Computing",
      year: "2",
      batch: "Weekday",
      group: "Group 1",
      course: "Advanced Mathematics",
      originalDate: "Mar 10, 2025",
      newDate: "Mar 12, 2025",
      professor: "Dr. Smith",
      room: "Room A301",
      oldTime: "09:00",
      newTime: "11:00"
    },
    {
      id: 2,
      faculty: "Engineering",
      year: "3",
      batch: "Weekend",
      group: "Group 2",
      course: "Computer Science",
      originalDate: "Mar 15, 2025",
      newDate: "Mar 17, 2025",
      professor: "Prof. Johnson",
      room: "Lab F201",
      oldTime: "14:00",
      newTime: "16:00"
    },
    {
      id: 3,
      faculty: "Business",
      year: "1",
      batch: "Weekday",
      group: "Group 3",
      course: "Database Systems",
      originalDate: "Mar 20, 2025",
      newDate: "Mar 23, 2025",
      professor: "Dr. Samantha",
      room: "Lab G301",
      oldTime: "10:00",
      newTime: "12:00"
    }
  ]);

  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Annual Tech Festival",
      date: "March 15, 2025",
      description:
        "Join us for an exciting day of technology demonstrations, workshops, and networking.",
      location: "Main Auditorium",
      time: "9:00 AM",
    },
    {
      id: 2,
      title: "Cultural Night",
      date: "April 5, 2025",
      description:
        "Experience diverse cultural performances by our talented students.",
      location: "Open Theater",
      time: "6:00 PM",
    },
  ]);

  const handleAddSchedule = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleAddEvent = () => {
    setShowAddEventForm(true);
  };

  const handleCloseAddEventForm = () => {
    setShowAddEventForm(false);
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowUpdateForm(true);
  };

  const handleCloseUpdateForm = () => {
    setShowUpdateForm(false);
    setSelectedSchedule(null);
  };

  const handleUpdateSchedule = async (updatedData) => {
    setSchedules(prevSchedules => 
      prevSchedules.map(schedule => 
        schedule.id === updatedData.id 
          ? {
              ...schedule,
              faculty: updatedData.faculty,
              year: updatedData.year,
              batch: updatedData.batch,
              group: updatedData.group,
              course: updatedData.course,
              originalDate: schedule.originalDate,
              newDate: updatedData.newDate,
              professor: updatedData.lecturer,
              room: updatedData.room,
              oldTime: updatedData.oldTime,
              newTime: updatedData.newTime
            }
          : schedule
      )
    );
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowUpdateForm(true);
  };

  const handleUpdateEvent = async (id, updatedData) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === id 
          ? {
              ...event,
              title: updatedData.eventName,
              date: updatedData.date,
              time: updatedData.time,
              location: updatedData.location,
              description: updatedData.notes
            }
          : event
      )
    );
  };

  const handleDeleteClick = (item, type) => {
    if (type === 'event') {
      setSelectedEvent(item);
      setDeleteType('event');
    } else {
      setSelectedSchedule(item);
      setDeleteType('schedule');
    }
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteType === 'event') {
      setEvents(prevEvents => 
        prevEvents.filter(event => event.id !== selectedEvent.id)
      );
    } else {
      setSchedules(prevSchedules => 
        prevSchedules.filter(schedule => schedule.id !== selectedSchedule.id)
      );
    }
    setShowDeleteConfirmation(false);
    setSelectedEvent(null);
    setSelectedSchedule(null);
    setDeleteType(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setSelectedEvent(null);
    setSelectedSchedule(null);
    setDeleteType(null);
  };

  return (
    <div className="admin-dashboard-container">
      {/* Pass collapse state & setter to Navbar */}
      <Nav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`admin-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        <div className="admin-main-content-container">
          <div className="admin-page-namee">
            <h2>Event Management</h2>
          </div>
           {/*main-top-container */}
          <div className="admin-main-top-container">
            <h3 className="admin-section-title">Social Events</h3>
            <div className="admin-events-container">
              <div className="admin-events-card-container">
                {events.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onEdit={() => handleEditEvent(event)}
                    onDelete={() => handleDeleteClick(event, 'event')}
                  />
                ))}
              </div>
              <div className="admin-add-button-container">
                <button className="admin-add-event-button" onClick={handleAddEvent}>
                  <img src={addIcon} alt="Add Event" className="admin-add-icon" /> Add
                  New Event
                </button>
              </div>
            </div>
          </div>
          {/*main-bottom-container */}
          <div className="admin-main-bottom-container">
            <div className="admin-bottom-top-container">
            <div className="admin-section-name-container"> 
            <h2 className="admin-section-title2">Rescheduled Lectures</h2>
            </div>
            <div className="admin-add-edit-button-container">
              <button className="admin-add-schedule-btn" onClick={handleAddSchedule}> <img src={addIcon} alt="Add Event" className="icon"/>Add New Schedule</button>
              </div>
              </div>
            <div className="admin-table-container">
              <table className="admin-reschedule-table">
                <thead>
                  <tr>
                    <th>Faculty</th>
                    <th>Year</th>
                    <th>Batch</th>
                    <th>Group</th>
                    <th>Course</th>
                    <th>Original Date</th>
                    <th>New Date</th>
                    <th>Professor</th>
                    <th>Room</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map(schedule => (
                    <tr key={schedule.id}>
                      <td>{schedule.faculty}</td>
                      <td>{schedule.year}</td>
                      <td>{schedule.batch}</td>
                      <td>{schedule.group}</td>
                      <td>{schedule.course}</td>
                      <td>{schedule.originalDate}</td>
                      <td>{schedule.newDate}</td>
                      <td>{schedule.professor}</td>
                      <td>{schedule.room}</td>
                      <td className="admin-table-actions">
                        <span className="admin-edit-icon" onClick={() => handleEditSchedule(schedule)}>
                          <img src={editIcon} alt="Edit Event" className="admin-edit-icon" />
                        </span>
                        <span 
                          className="admin-delete-icon"
                          onClick={() => handleDeleteClick(schedule, 'schedule')}
                        >
                          <img src={deleteIcon} alt="Delete Event" className="admin-delete-icon" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      <Footer />
      </div>
      {showForm && <AddReschedule onClose={handleCloseForm} />}
      {showUpdateForm && selectedSchedule && (
        <UpdateReschedule 
          schedule={selectedSchedule}
          onClose={handleCloseUpdateForm}
          onUpdate={handleUpdateSchedule}
        />
      )}
      {showUpdateForm && selectedEvent && (
        <UpdateEvent 
          event={selectedEvent}
          onClose={handleCloseUpdateForm}
          onUpdate={handleUpdateEvent}
        />
      )}
      {showAddEventForm && <AddEvent onClose={handleCloseAddEventForm} />}
      {showDeleteConfirmation && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content-container admin-delete-confirmation">
            <div className="admin-form-name-container">
              <h2>Confirm Delete</h2>
              <p>Are you sure you want to delete this {deleteType === 'event' ? 'event' : 'schedule'}?</p>
            </div>
            <div className="admin-confirmation-details">
              {deleteType === 'event' ? (
                <>
                  <p><strong>Event Title:</strong> {selectedEvent?.title}</p>
                  <p><strong>Date:</strong> {selectedEvent?.date}</p>
                  <p><strong>Location:</strong> {selectedEvent?.location}</p>
                  <p><strong>Time:</strong> {selectedEvent?.time}</p>
                </>
              ) : (
                <>
                  <p><strong>Course:</strong> {selectedSchedule?.course}</p>
                  <p><strong>Faculty:</strong> {selectedSchedule?.faculty}</p>
                  <p><strong>Group:</strong> {selectedSchedule?.group}</p>
                  <p><strong>New Date:</strong> {selectedSchedule?.newDate}</p>
                </>
              )}
            </div>
            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-btn admin-cancel-btn"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="admin-btn admin-delete-confirm-btn"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const EventCard = ({ event, onEdit, onDelete }) => (
  <div className="admin-event-card">
    <h3 className="admin-event-title">{event.title}</h3>
    <p className="admin-event-date">{event.date}</p>
    <p className="admin-event-description">{event.description}</p>
    <div className="admin-event-details">
      <span>
        <img src={locationIcon} alt="Location" className="icon" />{" "}
        {event.location}
      </span>
      <span>
        <img src={timeIcon} alt="Time" className="icon" /> {event.time}
      </span>
    </div>
    <div className="admin-event-actions">
      <img 
        src={editIcon} 
        alt="Edit" 
        className="admin-action-icon1"
        onClick={onEdit}
      />
      <img 
        src={deleteIcon} 
        alt="Delete" 
        className="admin-action-icon2"
        onClick={onDelete}
      />
    </div>
  </div>
);
export default Event;

