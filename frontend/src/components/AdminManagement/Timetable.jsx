import React, { useState, useEffect, useRef } from "react";
import Nav from "./Navigation/Navbar";
import Header from "./Navigation/Header";
import Footer from "./Navigation/Footer";
import AddTimetable from "./AddTimetable";
import UpdateTimetable from "./updateTimetable";
import "./timetable.css";
import { motion } from "framer-motion";
import { CalendarDays, PlusCircle, Trash2, Pencil, Upload, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from 'sweetalert2';
import PreviewModal from "./PreviewModal";

// Color hex codes for cards
const cardColors = [
  { bg: "#92DCE5", icon: "#7D5BA6" }, // Total Timetables - Indigo
  { bg: "#ABEDD4", icon: "#295135" }, // Added Today - Green
  { bg: "#D3E28D", icon: "#8B9556" }, // Updated Today - Amber
  { bg: "#FF99B3", icon: "#792A34" }, // Deleted Today - Red
];

function Timetable() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddTimetableForm, setShowAddTimetableForm] = useState(false);
  const [showUpdateTimetableForm, setShowUpdateTimetableForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [previewData, setPreviewData] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(50); // Or another number you prefer

  // Filter timetables similar to Student component
  const filteredTimetables = timetables.filter((t) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      t.module?.moduleCode.toLowerCase().includes(term) ||
      t.module?.moduleName.toLowerCase().includes(term) ||
      t.group?.groupNum.toLowerCase().includes(term);
    const matchesFaculty =
      facultyFilter === "all" || t.faculty?._id === facultyFilter;
    return matchesSearch && matchesFaculty;
  });

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredTimetables.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredTimetables.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Reset to first page when search or faculty filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, facultyFilter]);

  // Fetch timetables and faculties on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, fRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/timetables"),
          fetch("http://localhost:5000/api/admin/getFaculties"),
        ]);
        const tData = tRes.ok ? await tRes.json() : [];
        setTimetables(tData);
        const fData = fRes.ok ? await fRes.json() : [];
        setFaculties(fData);
      } catch (err) {
        console.error("Error fetching timetable data:", err);
        setTimetables([]);
        setFaculties([]);
      }
    };
    fetchData();
  }, []);

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
    setTimetables((prev) =>
      prev.map((t) =>
        t._id === selectedTimetable._id ? { ...t, ...updatedData } : t
      )
    );
  };

  const handleDeleteClick = (timetable) => {
    setSelectedTimetable(timetable);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    setTimetables((prev) =>
      prev.filter((t) => t._id !== selectedTimetable._id)
    );
    setShowDeleteConfirmation(false);
    setSelectedTimetable(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setSelectedTimetable(null);
  };

  // Function to handle file selection
  const handleFileSelection = () => {
    fileInputRef.current.click();
  };

  // Function to process the selected file
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    setIsUploading(true);
    
    try {
      // Create form data to send to backend
      const formData = new FormData();
      formData.append('timetableFile', file);
      
      // Send to backend
      const response = await fetch('http://localhost:5000/api/admin/uploadTimetable', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const extractedData = await response.json();
      const previewArray = extractedData.preview || [];
      setTimetables(prev => [...prev, ...previewArray]);
      await Swal.fire({
        icon: 'success',
        title: 'Upload Successful',
        text: `Successfully extracted ${previewArray.length} timetable entries`,
        confirmButtonColor: '#2563eb',
      });
      setPreviewData(previewArray);
    } catch (error) {
      console.error("Error processing file:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to process file. Please try again.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      e.target.value = null; // Reset file input
    }
  };

  const handleConfirmPreview = async (confirmedData) => {
    console.log("Confirmed data:", confirmedData);
    setPreviewData(null); // Close the preview modal

    if (!confirmedData || confirmedData.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Data', text: 'No data to save.', width: 400 });
      return;
    }

    try {
      // Send the confirmed (and possibly edited) data to the backend to save
      const response = await fetch('http://localhost:5000/api/admin/addTimetables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(confirmedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save timetable data');
      }

      const savedEntries = await response.json();

      // Update the main timetable list with the newly saved entries
      // Note: The backend should return the saved entries with _ids
      setTimetables(prev => [...prev, ...(Array.isArray(savedEntries) ? savedEntries : [])]);

      Swal.fire({
        icon: 'success',
        title: 'Save Successful',
        text: `Successfully saved ${savedEntries.length} timetable entries.`,
        confirmButtonColor: '#2563eb',
        width: 400,
      });

    } catch (error) {
      console.error("Error saving confirmed data:", error);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error.message || 'Failed to save timetable data. Please try again.',
        confirmButtonColor: '#ef4444',
        width: 400,
      });
    }
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
                  <div className="admin-card-value">{filteredTimetables.length}</div>
                </div>
                <div
                  className="admin-card-icon"
                  style={{ backgroundColor: cardColors[0].bg }}
                >
                  <CalendarDays
                    size={29}
                    style={{ color: cardColors[0].icon }}
                  />
                </div>
              </div>
              <div className="admin-card">
                <div className="admin-card-text">
                  <div className="admin-card-title">Added Today</div>
                  <div className="admin-card-value">
                    {timetables.filter(t => {
                      const createdDate = new Date(t.createdAt);
                      const today = new Date();
                      return createdDate.setHours(0,0,0,0) === today.setHours(0,0,0,0);
                    }).length || 0}
                  </div>
                </div>
                <div
                  className="admin-card-icon"
                  style={{ backgroundColor: cardColors[1].bg }}
                >
                  <PlusCircle size={28} style={{ color: cardColors[1].icon }} />
                </div>
              </div>
              <div className="admin-card">
                <div className="admin-card-text">
                  <div className="admin-card-title">Updated Today</div>
                  <div className="admin-card-value">
                    {timetables.filter(t => {
                      if (!t.updatedAt || t.updatedAt === t.createdAt) return false;
                      const updatedDate = new Date(t.updatedAt);
                      const today = new Date();
                      return updatedDate.setHours(0,0,0,0) === today.setHours(0,0,0,0);
                    }).length || 0}
                  </div>
                </div>
                <div
                  className="admin-card-icon"
                  style={{ backgroundColor: cardColors[2].bg }}
                >
                  <Pencil size={27} style={{ color: cardColors[2].icon }} />
                </div>
              </div>
              <div className="admin-card">
                <div className="admin-card-text">
                  <div className="admin-card-title">Deleted Today</div>
                  <div className="admin-card-value">-</div>
                </div>
                <div
                  className="admin-card-icon"
                  style={{ backgroundColor: cardColors[3].bg }}
                >
                  <Trash2 size={27} style={{ color: cardColors[3].icon }} />
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
              >
                <PlusCircle size={21} /> Add New Timetable
              </motion.button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,image/*"
                style={{ display: 'none' }}
              />
              <motion.button
                className="admin-btnn admin-upload-btn"
                onClick={handleFileSelection}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Upload size={21} /> Upload Files
                  </>
                )}
              </motion.button>
            </div>
            <div className="admin-search-container">
              <div className="flex items-center gap-2 rounded-lg px-2 py-2 shadow-sm">
              <Search size={20} style={{ color: "#6c757d" }} />
              <input
                type="text"
                placeholder="Search by module code/name or group"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none w-full"
                style={{ color: "#212529" }}
              />
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-2 shadow-sm">
              <Filter size={18} style={{ color: "#6c757d" }} />
                <select
                  value={facultyFilter}
                  onChange={(e) => setFacultyFilter(e.target.value)}
                  className="bg-transparent outline-none text-gray-400 text-[14px]"
                >
                  <option value="all">All Faculties</option>
                  {faculties.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.facultyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/*main-bottom-container */}
          <div className="admin-main-bottom-content">
            <div className="admin-main-timetable-container">
              <h2>
                Timetable
                {facultyFilter !== "all" && faculties.find(f => f._id === facultyFilter) && 
                  ` - ${faculties.find(f => f._id === facultyFilter).facultyName}`
                }
              </h2>
              <div className="overflow-x-auto" style={{ width: '100%' }}>
                <table className="admin-timetable" style={{ tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th>Timetable ID</th>
                      <th>Batch ID</th>
                      <th>Faculty ID</th>
                      <th>Group ID</th>
                      <th>Year</th>
                      <th>Module ID</th>
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
                    {currentRecords.length > 0 ? (
                      currentRecords.map((timetable) => (
                        <tr key={timetable._id}>
                          <td>
                            <div style={{ maxWidth: '230px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={timetable._id}>
                              {timetable._id}
                            </div>
                          </td>
                          <td>{timetable.batch?.batchType || "-"}</td>
                          <td>{timetable.faculty?.facultyName || "-"}</td>
                          <td>{timetable.group?.groupNum || "-"}</td>
                          <td>{timetable.group?.year || "-"}</td>
                          <td>
                            <div style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={timetable.module?.moduleCode || "-"}>
                              {timetable.module?.moduleCode || "-"}
                            </div>
                          </td>
                          <td>
                            <div style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={timetable.lecturer?.lecturerCode || "-"}>
                              {timetable.lecturer?.lecturerCode || "-"}
                            </div>
                          </td>
                          <td>
                            <div style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={timetable.location?.locationCode || "-"}>
                              {timetable.location?.locationCode || "-"}
                            </div>
                          </td>
                          <td>{timetable.day || "-"}</td>
                          <td>{timetable.startTime || "-"}</td>
                          <td>{timetable.endTime || "-"}</td>
                          <td>
                            <span
                              className={`admin-session admin-${timetable.type.toLowerCase()}`}
                            >
                              {timetable.type}
                            </span>
                          </td>
                          <td className="admin-actions">
                            <button
                              onClick={() => handleEditTimetable(timetable)}
                            >
                              <Pencil
                                className="adminbtn"
                                color="#121c14"
                                size={18}
                              />
                            </button>
                            <button onClick={() => handleDeleteClick(timetable)}>
                              <Trash2
                                className="adminbtn"
                                color="#d12929"
                                size={18}
                              />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center">
                          No timetables found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredTimetables.length > recordsPerPage && (
                <div className="flex items-center justify-between mt-6 px-4">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredTimetables.length)} of {filteredTimetables.length} entries
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                    >
                      <ChevronLeft size={18} className="mr-1" /> Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pageNumbers = [];
                        const maxPagesToShow = 7; // Number of page buttons to show (adjust as needed)
                        let startPage, endPage;

                        if (totalPages <= maxPagesToShow) {
                          // Less pages than max, show all
                          startPage = 1;
                          endPage = totalPages;
                        } else {
                          // More pages than max, calculate range
                          const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
                          const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;

                          if (currentPage <= maxPagesBeforeCurrent) {
                            // Near the start
                            startPage = 1;
                            endPage = maxPagesToShow;
                          } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
                            // Near the end
                            startPage = totalPages - maxPagesToShow + 1;
                            endPage = totalPages;
                          } else {
                            // In the middle
                            startPage = currentPage - maxPagesBeforeCurrent;
                            endPage = currentPage + maxPagesAfterCurrent;
                          }
                        }

                        // Add page number buttons
                        for (let i = startPage; i <= endPage; i++) {
                          pageNumbers.push(
                            <button
                              key={i}
                              onClick={() => paginate(i)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${ 
                                currentPage === i
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-600 bg-white hover:bg-gray-100'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        return pageNumbers;
                      })()}
                    </div>
                    
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
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
      {previewData && (
        <PreviewModal
          data={previewData}
          onConfirm={handleConfirmPreview}
          onCancel={() => setPreviewData(null)}
        />
      )}
    </div>
  );
}

export default Timetable;
