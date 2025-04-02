import React, { useState } from "react";
import Nav from "./Navigation/Navbar";
import Header from "./Navigation/Header";
import Footer from "./Navigation/Footer";
import addIcon from "../../assets/add.png";
import deleteIcon from "../../assets/delete.png";
import calenderIcon from "../../assets/calender.png";
import editIcon from "../../assets/edit.png";
import uploadIcon from "../../assets/upload.png";
import searchIcon from "../../assets/search.png";
import AddTimetable from "./AddTimetable";
import UpdateTimetable from "./updateTimetable";
import "./timetable.css";
import { motion } from "framer-motion";

function Timetable() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddTimetableForm, setShowAddTimetableForm] = useState(false);
  const [showUpdateTimetableForm, setShowUpdateTimetableForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [timetableData, setTimetableData] = useState([
    {
      id: "TT001",
      group: "G1",
      course: "CS101",
      lecturer: "L101",
      room: "R201",
      day: "Monday",
      start: "08:00 AM",
      end: "10:00 AM",
      type: "Lecture",
    },
    {
      id: "TT002",
      group: "G2",
      course: "CS102",
      lecturer: "L102",
      room: "R202",
      day: "Tuesday",
      start: "10:00 AM",
      end: "12:00 PM",
      type: "Practical",
    },
    {
      id: "TT003",
      group: "G3",
      course: "CS103",
      lecturer: "L103",
      room: "R203",
      day: "Wednesday",
      start: "01:00 PM",
      end: "03:00 PM",
      type: "Tutorial",
    },
  ]);

  const handleAddTimetable = () => {
    setShowAddTimetableForm(true);
  };

  const handleCloseAddTimetableForm = () => {
    setShowAddTimetableForm(false);
  };

  const handleEditTimetable = (timetable) => {
    setSelectedTimetable(timetable);
    setShowUpdateTimetableForm(true);
  };

  const handleCloseUpdateTimetableForm = () => {
    setShowUpdateTimetableForm(false);
    setSelectedTimetable(null);
  };

  const handleUpdateTimetable = (updatedData) => {
    setTimetableData((prevData) =>
      prevData.map((timetable) =>
        timetable.id === selectedTimetable.id
          ? { ...timetable, ...updatedData }
          : timetable
      )
    );
  };

  const handleDeleteClick = (timetable) => {
    setSelectedTimetable(timetable);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    setTimetableData((prevData) =>
      prevData.filter((timetable) => timetable.id !== selectedTimetable.id)
    );
    setShowDeleteConfirmation(false);
    setSelectedTimetable(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setSelectedTimetable(null);
  };

  return (
    <div className="admin-dashboard-container">
      {/* Pass collapse state & setter to Navbar */}
      <Nav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`admin-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        <div className="admin-maincontent-container">
          <div className="admin-page-name">
            <h2>Timetable Management</h2>
          </div>
          {/*main-top-container */}
          <div className="admin-main-top-content">
            <div className="admin-cards-container">
              <div className="admin-card">
                <div className="admin-card-text">
                  <div className="admin-card-title">Total Timetables</div>
                  <div className="admin-card-value">245</div>
                </div>
                <div className="admin-card-icon">
                  <img src={calenderIcon} alt="Calendar Icon" />
                </div>
              </div>
              <div className="admin-card">
                <div className="admin-card-text">
                  <div className="admin-card-title">Added Today</div>
                  <div className="admin-card-value">12</div>
                </div>
                <div className="admin-card-icon">
                  <img src={addIcon} alt="Add Icon" />
                </div>
              </div>
              <div className="admin-card">
                <div className="admin-card-text">
                  <div className="admin-card-title">Updated Today</div>
                  <div className="admin-card-value">8</div>
                </div>
                <div className="admin-card-icon">
                  <img src={editIcon} alt="Edit Icon" />
                </div>
              </div>
              <div className="admin-card">
                <div className="admin-card-text">
                  <div className="admin-card-title">Deleted Today</div>
                  <div className="admin-card-value">3</div>
                </div>
                <div className="admin-card-icon">
                  <img src={deleteIcon} alt="Delete Icon" />
                </div>
              </div>
            </div>
          </div>
          {/*main-middle-container */}
          <div className="admin-main-middle-content">
            <div className="admin-main-addtimetable-container">
              <motion.button
                className="admin-btnn admin-add-btn"
                onClick={handleAddTimetable}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <img src={addIcon} alt="Add" className="admin-icon" /> Add New
                Timetable
              </motion.button>
              <motion.button
                className="admin-btnn admin-upload-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <img src={uploadIcon} alt="Upload" className="admin-icon" />{" "}
                Upload PDF
              </motion.button>
            </div>
            <div className="admin-search-container">
              <img src={searchIcon} alt="search" className="admin-icon" />
              <input type="text" placeholder="Search timetables" />
            </div>
          </div>

          {/*main-bottom-container */}
          <div className="admin-main-bottom-content">
            <div className="admin-main-timetable-container">
              <h2>Timetable</h2>
              <table className="admin-timetable">
                <thead>
                  <tr>
                    <th>Timetable ID</th>
                    <th>Group ID</th>
                    <th>Course ID</th>
                    <th>Lecturer ID</th>
                    <th>Room ID</th>
                    <th>Day of Week</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Session Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timetableData.map((timetable) => (
                    <tr key={timetable.id}>
                      <td>{timetable.id}</td>
                      <td>{timetable.group}</td>
                      <td>{timetable.course}</td>
                      <td>{timetable.lecturer}</td>
                      <td>{timetable.room}</td>
                      <td>{timetable.day}</td>
                      <td>{timetable.start}</td>
                      <td>{timetable.end}</td>
                      <td>
                        <span
                          className={`admin-session admin-${timetable.type.toLowerCase()}`}
                        >
                          {timetable.type}
                        </span>
                      </td>
                      <td className="admin-actions">
                        <button
                          className="admin-edit-btn"
                          onClick={() => handleEditTimetable(timetable)}
                        >
                          <img src={editIcon} alt="Edit" />
                        </button>
                        <button
                          className="admin-delete-btn"
                          onClick={() => handleDeleteClick(timetable)}
                        >
                          <img src={deleteIcon} alt="Delete" />
                        </button>
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
      {showAddTimetableForm && (
        <AddTimetable onClose={handleCloseAddTimetableForm} />
      )}
      {showUpdateTimetableForm && (
        <UpdateTimetable
          timetable={selectedTimetable}
          onClose={handleCloseUpdateTimetableForm}
          onUpdate={handleUpdateTimetable}
        />
      )}
      {showDeleteConfirmation && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content-container admin-delete-confirmation">
            <div className="admin-form-name-container">
              <h2>Confirm Delete</h2>
              <p>Are you sure you want to delete this timetable entry?</p>
            </div>
            <div className="admin-confirmation-details">
              <p>
                <strong>Timetable ID:</strong> {selectedTimetable?.id}
              </p>
              <p>
                <strong>Course:</strong> {selectedTimetable?.course}
              </p>
              <p>
                <strong>Group:</strong> {selectedTimetable?.group}
              </p>
              <p>
                <strong>Day:</strong> {selectedTimetable?.day}
              </p>
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

export default Timetable;
