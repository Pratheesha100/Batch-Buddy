import React, { useState, useEffect, Suspense, lazy } from "react";
import Nav from "./Navigation/Navbar";
import Header from "./Navigation/Header";
import Footer from "./Navigation/Footer";
import { PlusCircle, Trash2, Pencil, MapPin, AlarmClock, ChevronLeft, ChevronRight } from "lucide-react";
import EventCardSkeleton from "./EventCardSkeleton";
import RescheduleTableSkeleton from "./RescheduleTableSkeleton";
// Lazy load modal components
const AddReschedule = lazy(() => import("./AddReschedule"));
const UpdateReschedule = lazy(() => import("./UpdateReschedule"));
const AddEvent = lazy(() => import("./AddEvent"));
const UpdateEvent = lazy(() => import("./UpdateEvent"));
import "./shared.css";
import "./event.css";
import Swal from 'sweetalert2';

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (err) {
    console.error("Error formatting date:", err);
    return '-';
  }
};

// Move fetchEvents helper above useEffect
const fetchEvents = async (setError, setEvents) => {
  try {
    const eventsRes = await fetch("http://localhost:5000/api/admin/events");
    if (!eventsRes.ok) throw new Error("Failed to fetch events");
    const eventsData = await eventsRes.json();
    setEvents(eventsData);
  } catch (err) {
    setError(err.message);
    console.error("Error fetching events:", err);
  }
};

function Event() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for real data
  const [events, setEvents] = useState([]);
  const [reschedules, setReschedules] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [batches, setBatches] = useState([]);

  // Pagination state for Reschedules table
  const [currentReschedulePage, setCurrentReschedulePage] = useState(1);
  const [reschedulesPerPage] = useState(10); // Adjust number per page as needed

  // Create a ref for the container width measurement
  const scrollContainerRef = React.useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);

  // Add a resize observer to update container width
  useEffect(() => {
    if (scrollContainerRef.current) {
      setContainerWidth(scrollContainerRef.current.offsetWidth);
      
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      
      resizeObserver.observe(scrollContainerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use Promise.all to fetch data in parallel
        const [eventsRes, reschedulesRes, facRes, batchRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/events"),
          fetch("http://localhost:5000/api/admin/reschedules"),
          fetch('http://localhost:5000/api/admin/getFaculties'),
          fetch('http://localhost:5000/api/admin/getBatches')
        ]);

        // Process Events response
        if (!eventsRes.ok) throw new Error("Failed to fetch events");
        const eventsData = await eventsRes.json();
        setEvents(eventsData);

        // Process Reschedules response
        if (!reschedulesRes.ok) throw new Error("Failed to fetch reschedules");
        const reschedulesData = await reschedulesRes.json();
        setReschedules(reschedulesData || []);

        // Process Faculties response
        if (!facRes.ok) throw new Error('Failed to fetch faculties');
        const facData = await facRes.json();
        setFaculties(facData);

        // Process Batches response
        if (!batchRes.ok) throw new Error('Failed to fetch batches');
        const batchData = await batchRes.json();
        setBatches(batchData);

      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Pagination Logic for Reschedules ---
  const indexOfLastReschedule = currentReschedulePage * reschedulesPerPage;
  const indexOfFirstReschedule = indexOfLastReschedule - reschedulesPerPage;
  const currentRescheduleRecords = reschedules.slice(indexOfFirstReschedule, indexOfLastReschedule);
  const totalReschedulePages = Math.ceil(reschedules.length / reschedulesPerPage);

  const paginateReschedules = (pageNumber) => setCurrentReschedulePage(pageNumber);
  const nextReschedulePage = () => setCurrentReschedulePage(prev => Math.min(prev + 1, totalReschedulePages));
  const prevReschedulePage = () => setCurrentReschedulePage(prev => Math.max(prev - 1, 1));
  // --- End Reschedule Pagination Logic ---

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

  const handleUpdateSchedule = async (id, updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/updateReschedules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        // Try to get error message from backend
        const errorData = await res.json().catch(() => ({ message: 'Failed to update reschedule' }));
        throw new Error(errorData.message || 'Failed to update reschedule');
      }

      // Don't use the direct response, re-fetch the list instead
      // const updated = await res.json(); 
      // setReschedules(prevReschedules =>
      //  prevReschedules.map(schedule =>
      //    schedule._id === id ? updated : schedule
      //  )
      // );

      await fetchReschedules(); // Re-fetch the list to get populated data

      setShowUpdateForm(false);
      setSelectedSchedule(null);
      await Swal.fire({
        icon: 'success',
        title: 'Reschedule Updated',
        text: 'The reschedule was updated successfully.',
        confirmButtonColor: '#2563eb',
        width: 400,
      });
    } catch (err) {
      console.error('Error updating reschedule:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.message || 'Failed to update reschedule. Please try again.', // Show backend error message if available
        confirmButtonColor: '#ef4444',
        width: 400,
      });
    }
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowUpdateForm(true);
  };

  const handleUpdateEvent = async (id, updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/updateEvents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error('Failed to update event');
      await res.json();
      await fetchEvents(setError, setEvents);
      setShowUpdateForm(false);
      setSelectedEvent(null);
      await Swal.fire({
        icon: 'success',
        title: 'Event Updated',
        text: 'The event was updated successfully.',
        confirmButtonColor: '#2563eb',
        width: 400,
      });
    } catch (err) {
      console.error('Error updating event:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update event. Please try again.',
        confirmButtonColor: '#ef4444',
        width: 400,
      });
    }
  };

  const handleDeleteClick = (item, type) => {
    if (type === "event") {
      setSelectedEvent(item);
      setDeleteType("event");
    } else {
      setSelectedSchedule(item);
      setDeleteType("schedule");
    }
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      let successTitle = '';
      let successText = '';
      if (deleteType === "event") {
        const res = await fetch(`http://localhost:5000/api/admin/deleteEvents/${selectedEvent._id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete event');
        setEvents(prevEvents => prevEvents.filter(event => event._id !== selectedEvent._id));
        successTitle = 'Event Deleted';
        successText = 'The event was deleted successfully.';
      } else {
        const res = await fetch(`http://localhost:5000/api/admin/deleteReschedules/${selectedSchedule._id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete reschedule');
        setReschedules(prevReschedules => prevReschedules.filter(schedule => schedule._id !== selectedSchedule._id));
        successTitle = 'Reschedule Deleted';
        successText = 'The reschedule was deleted successfully.';
      }
      // Hide the confirmation modal and reset state BEFORE showing SweetAlert
      setShowDeleteConfirmation(false);
      setSelectedEvent(null);
      setSelectedSchedule(null);
      setDeleteType(null);

      await Swal.fire({
        icon: 'success',
        title: successTitle,
        text: successText,
        confirmButtonColor: '#2563eb',
        width: 400,
      });
    } catch (err) {
      console.error('Error deleting:', err);
      setShowDeleteConfirmation(false);
      setSelectedEvent(null);
      setSelectedSchedule(null);
      setDeleteType(null);
      await Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Failed to delete. Please try again.',
        confirmButtonColor: '#ef4444',
        width: 400,
      });
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setSelectedEvent(null);
    setSelectedSchedule(null);
    setDeleteType(null);
  };

  const handleCreateEvent = async (newEventData) => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/addEvents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEventData),
      });
      if (!res.ok) throw new Error('Failed to create event');
      await res.json();
      await fetchEvents(setError, setEvents);
      setShowAddEventForm(false);
      await Swal.fire({
        icon: 'success',
        title: 'Event Created',
        text: 'The event was created successfully.',
        confirmButtonColor: '#2563eb',
        width: 400,
      });
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'Create Failed',
        text: 'Failed to create event. Please try again.',
        confirmButtonColor: '#ef4444',
        width: 400,
      });
    }
  };

  // Add a fetchReschedules function to refresh the reschedule list
  const fetchReschedules = async () => {
    try {
      const reschedulesRes = await fetch("http://localhost:5000/api/admin/reschedules");
      if (!reschedulesRes.ok) throw new Error("Failed to fetch reschedules");
      const reschedulesData = await reschedulesRes.json();
      setReschedules(reschedulesData || []);
    } catch (err) {
      console.error("Error fetching reschedules:", err);
    }
  };

  // Ensure fetchReschedules is called on initial load
  useEffect(() => {
    fetchReschedules();
  }, []);

  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="admin-dashboard-container">
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
                <button 
                  className="carousel-button prev"
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      scrollContainerRef.current.scrollBy({ left: -364, behavior: 'smooth' });
                    }
                  }}
                >
                  <ChevronLeft size={24} />
                </button>
                <div 
                  className="admin-events-card-container-scroll" 
                  ref={scrollContainerRef}
                >
                  {loading ? (
                    <>
                      {/* Render multiple skeletons to fill the initial view */}
                      <EventCardSkeleton />
                      <EventCardSkeleton />
                      <EventCardSkeleton />
                    </>
                  ) : events.length > 0 ? (
                    events.map((event) => (
                      <EventCard
                        key={event._id || `event-${Math.random()}`}
                        event={event}
                        onEdit={() => handleEditEvent(event)}
                        onDelete={() => handleDeleteClick(event, "event")}
                        formatDate={formatDate}
                      />
                    ))
                  ) : (
                    <div className="text-center py-4">No events found</div>
                  )}
                </div>
                <button 
                  className="carousel-button next"
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      scrollContainerRef.current.scrollBy({ left: 364, behavior: 'smooth' });
                    }
                  }}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
              <div className="admin-add-button-container">
                <button
                  className="admin-add-event-button"
                  onClick={handleAddEvent}
                >
                  <PlusCircle size={21} /> Add New Event
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
                <button
                  className="admin-add-schedule-btn"
                  onClick={handleAddSchedule}
                >
                  <PlusCircle size={21} />
                  Add New Schedule
                </button>
              </div>
            </div>
            <div className="admin-table-container">
              <table className="admin-reschedule-table">
                <thead>
                  <tr>
                    <th>Faculty</th>
                    <th>Year</th>
                    <th>Group</th>
                    <th>Batch</th>
                    <th>Module</th>
                    <th>Original Date</th>
                    <th>New Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Location</th>
                    <th>Lecturer</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <RescheduleTableSkeleton rows={5} /> // Show 5 skeleton rows
                  ) : reschedules && reschedules.length > 0 ? (
                    currentRescheduleRecords.map((schedule) => (
                      <tr key={schedule._id || `schedule-${Math.random()}`}>
                        <td>{schedule.faculty?.facultyName || '-'}</td>
                        <td>{schedule.year || '-'}</td>
                        <td>{schedule.group?.groupNum || '-'}</td>
                        <td>{schedule.batch?.batchType || '-'}</td>
                        <td>{schedule.module?.moduleName || '-'}</td>
                        <td>{formatDate(schedule.oldDate)}</td>
                        <td>{formatDate(schedule.newDate)}</td>
                        <td>{schedule.startTime || '-'}</td>
                        <td>{schedule.endTime || '-'}</td>
                        <td>{schedule.location?.locationCode || '-'}</td>
                        <td>{schedule.lecturer?.lecturerName || '-'}</td>
                        <td>{schedule.type || '-'}</td>
                        <td className="admin-table-actions">
                          <span onClick={() => handleEditSchedule(schedule)}>
                            <Pencil
                              size={21} color="#121c14" className="admin-edit-icon"
                            />
                          </span>
                          <span onClick={() => handleDeleteClick(schedule, "schedule")}>
                            <Trash2
                              size={21} color="#d12929" className="admin-delete-icon"
                            />
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="13" className="text-center py-4">
                        {loading ? '' : 'No reschedules found'} {/* Hide message during load */}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Pagination Controls for Reschedule Table */}
              {totalReschedulePages > 1 && (
                <div className="flex items-center justify-between mt-6 px-4">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstReschedule + 1} to {Math.min(indexOfLastReschedule, reschedules.length)} of {reschedules.length} entries
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={prevReschedulePage}
                      disabled={currentReschedulePage === 1}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${currentReschedulePage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                    >
                      <ChevronLeft size={18} className="mr-1" /> Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pageNumbers = [];
                        const maxPagesToShow = 7;
                        let startPage, endPage;
                        if (totalReschedulePages <= maxPagesToShow) {
                          startPage = 1; endPage = totalReschedulePages;
                        } else {
                          const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
                          const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
                          if (currentReschedulePage <= maxPagesBeforeCurrent) {
                            startPage = 1; endPage = maxPagesToShow;
                          } else if (currentReschedulePage + maxPagesAfterCurrent >= totalReschedulePages) {
                            startPage = totalReschedulePages - maxPagesToShow + 1; endPage = totalReschedulePages;
                          } else {
                            startPage = currentReschedulePage - maxPagesBeforeCurrent; endPage = currentReschedulePage + maxPagesAfterCurrent;
                          }
                        }
                        for (let i = startPage; i <= endPage; i++) {
                          pageNumbers.push(
                            <button
                              key={i}
                              onClick={() => paginateReschedules(i)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${currentReschedulePage === i ? 'bg-blue-600 text-white' : 'text-gray-600 bg-white hover:bg-gray-100'}`}
                            >
                              {i}
                            </button>
                          );
                        }
                        return pageNumbers;
                      })()}
                    </div>
                    <button
                      onClick={nextReschedulePage}
                      disabled={currentReschedulePage === totalReschedulePages}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${currentReschedulePage === totalReschedulePages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                    >
                      Next <ChevronRight size={18} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>

      <Suspense fallback={
        <div className="admin-modal-overlay">
          <div className="admin-modal-content-container" style={{textAlign: 'center', padding: '40px 0'}}>
            Loading form...
          </div>
        </div>
      }>
        {showForm && (
          <AddReschedule
            onClose={handleCloseForm}
            onRescheduleAdded={() => fetchReschedules()}
          />
        )}
      </Suspense>
      
      <Suspense fallback={
        <div className="admin-modal-overlay">
          <div className="admin-modal-content-container" style={{textAlign: 'center', padding: '40px 0'}}>
            Loading form...
          </div>
        </div>
      }>
        {showUpdateForm && selectedSchedule && (
          <UpdateReschedule
            schedule={selectedSchedule}
            faculties={faculties}
            batches={batches}
            onClose={handleCloseUpdateForm}
            onUpdate={handleUpdateSchedule}
          />
        )}
      </Suspense>

      <Suspense fallback={
        <div className="admin-modal-overlay">
          <div className="admin-modal-content-container" style={{textAlign: 'center', padding: '40px 0'}}>
            Loading form...
          </div>
        </div>
      }>
        {showUpdateForm && selectedEvent && (
          <UpdateEvent
            event={selectedEvent}
            faculties={faculties}
            onClose={handleCloseUpdateForm}
            onUpdate={handleUpdateEvent}
          />
        )}
      </Suspense>

      <Suspense fallback={
        <div className="admin-modal-overlay">
          <div className="admin-modal-content-container" style={{textAlign: 'center', padding: '40px 0'}}>
            Loading form...
          </div>
        </div>
      }>
        {showAddEventForm && (
          <AddEvent
            onClose={handleCloseAddEventForm}
            onEventAdded={() => fetchEvents(setError, setEvents)}
          />
        )}
      </Suspense>

      {showDeleteConfirmation && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content-container admin-delete-confirmation">
            <div className="admin-form-name-container">
              <h2>Confirm Delete</h2>
              <p>
                Are you sure you want to delete this{" "}
                {deleteType === "event" ? "event" : "schedule"}?
              </p>
            </div>
            <div className="admin-confirmation-details">
              {deleteType === "event" ? (
                <>
                  <p>
                    <strong>Event Title:</strong> {selectedEvent?.eventName}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(selectedEvent?.eventDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedEvent?.location}
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedEvent?.time}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Module:</strong> {selectedSchedule?.module?.moduleName}
                  </p>
                  <p>
                    <strong>Faculty:</strong> {selectedSchedule?.faculty?.facultyName}
                  </p>
                  <p>
                    <strong>Group:</strong> {selectedSchedule?.group?.groupNum}
                  </p>
                  <p>
                    <strong>New Date:</strong> {new Date(selectedSchedule?.newDate).toLocaleDateString()}
                  </p>
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

// EventCard component 
const EventCard = ({ event, onEdit, onDelete, formatDate }) => (
  <div className="admin-event-card">
    <h3 className="admin-event-title">{event.eventName || 'Untitled Event'}</h3>
    <p className="admin-event-date">{formatDate(event.eventDate)}</p>
    <div className="admin-event-content">
      <p className="admin-event-description">{event.eventDescription || 'No description available'}</p>
      <p className="admin-event-faculty">{event.faculty?.facultyName || 'No faculty specified'}</p>
    </div>
    <div className="admin-event-details">
      <span>
        <MapPin size={7} color="#999999" className="adminicon" />
        {event.location || 'No location specified'}
      </span>
      <span>
        <AlarmClock size={7} color="#999999" className="adminicon" /> 
        {event.time || 'No time specified'}
      </span>
    </div>
    <div className="admin-event-actions">
      <button className="admin-action-button edit" onClick={onEdit}>
        <Pencil size={16} />
      </button>
      <button className="admin-action-button delete" onClick={onDelete}>
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

export default Event;
