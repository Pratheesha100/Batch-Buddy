import React, { useState, useEffect, useRef } from "react";
import Nav from "./Navigation/Navbar";
import Header from "./Navigation/Header";
import Footer from "./Navigation/Footer";
import AddTimetable from "./AddTimetable";
import UpdateTimetable from "./UpdateTimetable";
import TimetableCardSkeleton from "./TimetableCardSkeleton";
import TimetableTableSkeleton from "./TimetableTableSkeleton";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletedTodayCount, setDeletedTodayCount] = useState(0); // State for deleted count

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  // Function to fetch timetables
  const fetchTimetables = async () => {
    setError(null);
    try {
      const tRes = await fetch("http://localhost:5000/api/admin/timetables");
      if (!tRes.ok) throw new Error('Failed to fetch timetables');
      const tData = await tRes.json();
      setTimetables(tData || []);
    } catch (err) {
      console.error("Error fetching timetable data:", err);
      setError(err.message);
      setTimetables([]);
    } finally {
      // setLoading(false) is handled after all initial fetches complete
    }
  };

  // Function to fetch deleted count (placeholder)
  const fetchDeletedCount = async () => {
      try {
          // --- Placeholder --- Replace with actual API call when backend is ready
          // const res = await fetch("http://localhost:5000/api/admin/timetables/deleted-today-count");
          // if (!res.ok) throw new Error('Failed to fetch deleted count');
          // const data = await res.json();
          // setDeletedTodayCount(data.count || 0);
          // --- End Placeholder ---
          console.warn("fetchDeletedCount is using placeholder data. Implement backend endpoint.");
          // Simulate fetching count (remove this line when backend is ready)
          setDeletedTodayCount(0); // Default to 0 for now
      } catch (err) {
          console.error("Error fetching deleted count:", err);
          setDeletedTodayCount(0); // Default to 0 on error
      }
  };

  // Fetch initial data on mount
  useEffect(() => {
    const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        setDeletedTodayCount(0); // Reset count on load
        try {
             const fRes = await fetch("http://localhost:5000/api/admin/getFaculties");
             if (!fRes.ok) throw new Error('Failed to fetch faculties');
             const fData = await fRes.json();
             setFaculties(fData || []);

            // Fetch timetables and deleted count (can run in parallel)
            await Promise.all([
                fetchTimetables(),
                fetchDeletedCount() // Fetch the deleted count
            ]);

        } catch (err) {
            console.error("Error fetching initial data:", err);
            setError(err.message);
            setFaculties([]);
        } finally {
            setLoading(false); // Set loading false after all fetches attempt
        }
    };
    fetchInitialData();
  }, []);

  // Filter timetables
  const filteredTimetables = timetables.filter((t) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (t.module?.moduleCode?.toLowerCase() || '').includes(term) ||
      (t.module?.moduleName?.toLowerCase() || '').includes(term) ||
      (t.group?.groupNum?.toLowerCase() || '').includes(term) ||
      (t.lecturer?.lecturerName?.toLowerCase() || '').includes(term) ||
      (t.location?.locationName?.toLowerCase() || '').includes(term) ||
      (t.day?.toLowerCase() || '').includes(term);

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

  const handleAddTimetable = () => {
    setShowAddTimetableForm(true);
  };

  const handleCloseAddTimetableForm = () => {
    setShowAddTimetableForm(false);
    // Add and update handlers will re-fetch everything needed
  };

  const handleEditTimetable = (timetable) => {
    setSelectedTimetable(timetable);
    setShowUpdateTimetableForm(true);
  };

  const handleCloseUpdateTimetableForm = () => {
    setShowUpdateTimetableForm(false);
    setSelectedTimetable(null);
  };

  const handleUpdateTimetable = async (id, updatedData) => {
      try {
          const res = await fetch(`http://localhost:5000/api/admin/updateTimetable/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedData),
          });

          if (!res.ok) {
              const errorData = await res.json().catch(() => ({ message: 'Update failed' }));
              throw new Error(errorData.message || 'Failed to update timetable');
          }

          // Refresh main list and potentially counts (though update count logic is internal)
          await Promise.all([ fetchTimetables(), fetchDeletedCount() ]);
          setShowUpdateTimetableForm(false);
          setSelectedTimetable(null);

          await Swal.fire({
              icon: 'success',
              title: 'Timetable Updated',
              text: 'The timetable entry was updated successfully.',
              confirmButtonColor: '#2563eb',
              width: 400,
              timer: 1500,
              showConfirmButton: false
          });

      } catch (err) {
          console.error('Error updating timetable:', err);
          await Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: err.message || 'Failed to update timetable. Please try again.',
              confirmButtonColor: '#ef4444',
              width: 400,
          });
      }
  };

  const handleDeleteClick = (timetable) => {
    setSelectedTimetable(timetable);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
      if (!selectedTimetable || !selectedTimetable._id) return;

      try {
          const res = await fetch(`http://localhost:5000/api/admin/deleteTimetable/${selectedTimetable._id}`, {
              method: 'DELETE',
          });

          if (!res.ok) {
               const errorData = await res.json().catch(() => ({ message: 'Delete failed' }));
               throw new Error(errorData.message || 'Failed to delete timetable entry');
          }

          // Refresh list and deleted count after successful delete
          await Promise.all([ fetchTimetables(), fetchDeletedCount() ]);
          setShowDeleteConfirmation(false);
          setSelectedTimetable(null);

          await Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The timetable entry has been deleted.',
              confirmButtonColor: '#2563eb',
              width: 400,
              timer: 1500,
              showConfirmButton: false
          });

      } catch (err) {
          console.error('Error deleting timetable:', err);
          setShowDeleteConfirmation(false);
          setSelectedTimetable(null);
          await Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              text: err.message || 'Could not delete the timetable entry. Please try again.',
              confirmButtonColor: '#ef4444',
              width: 400,
          });
      }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setSelectedTimetable(null);
  };

  // File upload functions
  const handleFileSelection = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('timetableFile', file);
      const response = await fetch('http://localhost:5000/api/admin/uploadTimetable', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
         throw new Error(errorData.message || 'Upload failed');
      }

      const extractedData = await response.json();
      setPreviewData(extractedData.preview || []);
      await Swal.fire({
        icon: 'info',
        title: 'Processing Complete',
        text: `Ready to preview ${extractedData.preview?.length || 0} potential entries.`,
        confirmButtonColor: '#2563eb',
        width: 400,
      });

    } catch (error) {
      console.error("Error processing file:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.message || 'Failed to process file. Please try again.',
        confirmButtonColor: '#ef4444',
        width: 400,
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      if (e.target) e.target.value = null;
    }
  };
  const handleConfirmPreview = async (confirmedData) => {
    console.log("Confirmed data to save:", confirmedData);
    setPreviewData(null);

    if (!confirmedData || confirmedData.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Data', text: 'No data to save.', width: 400 });
      return;
    }

    try {
        setIsUploading(true);
      const response = await fetch('http://localhost:5000/api/admin/addTimetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(confirmedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save timetable data');
      }

      // Refresh list and potentially counts
      await Promise.all([ fetchTimetables(), fetchDeletedCount() ]);

      Swal.fire({
        icon: 'success',
        title: 'Save Successful',
        text: `Successfully saved timetable entries.`,
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
    } finally {
        setIsUploading(false);
    }
  };


   if (error && !loading) {
     return (
         <div className="admin-dashboard-container">
             <Nav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
             <div className={`admin-content ${isCollapsed ? "collapsed" : ""}`}>
                 <Header />
                 <div className="admin-maincontent-container">
                    <div className="text-red-500 p-4">Error loading data: {error}</div>
                 </div>
                <Footer />
            </div>
        </div>
     );
   }

  return (
    <div className="admin-dashboard-container">
      <Nav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`admin-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        <div className="admin-maincontent-container">
          <div className="admin-page-name">
            <h2>Timetable Management</h2>
          </div>
          <div className="admin-main-top-content">
            <div className="admin-cards-container">
              {loading ? (
                <TimetableCardSkeleton count={4} />
              ) : (
                <>
                  <div className="admin-card">
                      <div className="admin-card-text">
                          <div className="admin-card-title">Total Timetables</div>
                          <div className="admin-card-value">{timetables.length}</div>
                      </div>
                      <div className="admin-card-icon" style={{ backgroundColor: cardColors[0].bg }}>
                          <CalendarDays size={29} style={{ color: cardColors[0].icon }} />
                      </div>
                  </div>
                  <div className="admin-card">
                      <div className="admin-card-text">
                          <div className="admin-card-title">Added Today</div>
                          <div className="admin-card-value">
                              {timetables.filter(t => {
                                  try {
                                      const createdDate = new Date(t.createdAt);
                                      const today = new Date();
                                      return !isNaN(createdDate) && createdDate.toDateString() === today.toDateString();
                                  } catch { return false; }
                              }).length || 0}
                          </div>
                      </div>
                      <div className="admin-card-icon" style={{ backgroundColor: cardColors[1].bg }}>
                          <PlusCircle size={28} style={{ color: cardColors[1].icon }} />
                      </div>
                  </div>
                  <div className="admin-card">
                      <div className="admin-card-text">
                          <div className="admin-card-title">Updated Today</div>
                          <div className="admin-card-value">
                               {timetables.filter(t => {
                                  try {
                                      if (!t.updatedAt || t.updatedAt === t.createdAt) return false;
                                      const updatedDate = new Date(t.updatedAt);
                                      const today = new Date();
                                      return !isNaN(updatedDate) && updatedDate.toDateString() === today.toDateString();
                                  } catch { return false; }
                              }).length || 0}
                          </div>
                      </div>
                      <div className="admin-card-icon" style={{ backgroundColor: cardColors[2].bg }}>
                          <Pencil size={27} style={{ color: cardColors[2].icon }} />
                      </div>
                  </div>
                  <div className="admin-card">
                      <div className="admin-card-text">
                          <div className="admin-card-title">Deleted Today</div>
                          <div className="admin-card-value">{deletedTodayCount}</div>
                      </div>
                      <div className="admin-card-icon" style={{ backgroundColor: cardColors[3].bg }}>
                          <Trash2 size={27} style={{ color: cardColors[3].icon }} />
                      </div>
                  </div>
                </>
              )}
            </div>
          </div>
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
                accept=".pdf, application/pdf, .xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                style={{ display: 'none' }}
              />
              {/* <motion.button
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
                    <Upload size={21} /> Upload File
                  </>
                )}
              </motion.button> */}
            </div>
            <div className="admin-search-container">
              <div className="flex items-center gap-2 rounded-lg px-2 py-2 shadow-sm">
              <Search size={20} style={{ color: "#6c757d" }} />
              <input
                type="text"
                placeholder="Search by module, group, lecturer, location, day..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none w-full text-sm"
                style={{ color: "#212529" }}
              />
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-2 shadow-sm">
              <Filter size={18} style={{ color: "#6c757d" }} />
                <select
                  value={facultyFilter}
                  onChange={(e) => setFacultyFilter(e.target.value)}
                  className="bg-transparent outline-none text-gray-500 text-sm"
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

          <div className="admin-main-bottom-content">
            <div className="admin-main-timetable-container">
              <h2>
                Timetable
                {facultyFilter !== "all" && faculties.find(f => f._id === facultyFilter) &&
                  ` - ${faculties.find(f => f._id === facultyFilter).facultyName}`
                }
              </h2>
              <div className="overflow-x-auto" style={{ width: '100%' }}>
                <table className="admin-timetable" >
                  <thead>
                    <tr>
                      <th>Faculty</th>
                      <th>Batch</th>
                      <th>Group (Year)</th>
                      <th>Module</th>
                      <th>Lecturer</th>
                      <th>Location</th>
                      <th>Day</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <TimetableTableSkeleton rows={recordsPerPage} />
                    ) : currentRecords.length > 0 ? (
                      currentRecords.map((timetable) => (
                        <tr key={timetable._id}>
                          <td>{timetable.faculty?.facultyName || "-"}</td>
                          <td>{timetable.batch?.batchType || "-"}</td>
                          <td>{`${timetable.group?.groupNum || "?"} (Y${timetable.year || "?"}S${timetable.semester || "?"})`}</td>
                          <td>
                            <div style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`${timetable.module?.moduleName || "?"} (${timetable.module?.moduleCode || "?"})`}>
                              {timetable.module?.moduleCode || "-"} {timetable.module?.moduleName ? `(${timetable.module.moduleName.substring(0, 10)}...)` : ''}
                            </div>
                          </td>
                          <td>
                            <div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={timetable.lecturer?.lecturerName || "?"}>
                              {timetable.lecturer?.lecturerName || "-"}
                            </div>
                          </td>
                          <td>
                            <div style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`${timetable.location?.locationName || "?"} (${timetable.location?.locationCode || "?"})`}>
                              {timetable.location?.locationCode || "-"}
                            </div>
                          </td>
                          <td>{timetable.day || "-"}</td>
                          <td>{timetable.startTime || "-"}</td>
                          <td>{timetable.endTime || "-"}</td>
                          <td>
                            <span
                              className={`admin-session admin-${timetable.type?.toLowerCase()}`}
                            >
                              {timetable.type || '-'}
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
                        <td colSpan="11" className="text-center p-4">
                          No timetables found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
               {!loading && filteredTimetables.length > recordsPerPage && totalPages > 1 && (
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
                        const maxPagesToShow = 7;
                        let startPage, endPage;
                        if (totalPages <= maxPagesToShow) {
                          startPage = 1; endPage = totalPages;
                        } else {
                          const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
                          const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
                          if (currentPage <= maxPagesBeforeCurrent) {
                            startPage = 1; endPage = maxPagesToShow;
                          } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
                            startPage = totalPages - maxPagesToShow + 1; endPage = totalPages;
                          } else {
                            startPage = currentPage - maxPagesBeforeCurrent; endPage = currentPage + maxPagesAfterCurrent;
                          }
                        }
                        for (let i = startPage; i <= endPage; i++) {
                          pageNumbers.push(
                            <button
                              key={i}
                              onClick={() => paginate(i)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === i ? 'bg-blue-600 text-white' : 'text-gray-600 bg-white hover:bg-gray-100'}`}
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
        <AddTimetable onClose={handleCloseAddTimetableForm} onTimetableAdded={fetchTimetables} />
      )}
      {showUpdateTimetableForm && selectedTimetable && (
        <UpdateTimetable
          timetable={selectedTimetable}
          onClose={handleCloseUpdateTimetableForm}
          onUpdate={handleUpdateTimetable}
        />
      )}
      {showDeleteConfirmation && selectedTimetable && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content-container admin-delete-confirmation">
            <div className="admin-form-name-container">
              <h2>Confirm Delete</h2>
              <p>Are you sure you want to delete this timetable entry?</p>
            </div>
            <div className="admin-confirmation-details">
              <p>
                <strong>Module:</strong> {selectedTimetable.module?.moduleName || 'N/A'} ({selectedTimetable.module?.moduleCode || 'N/A'})
              </p>
              <p>
                <strong>Group:</strong> {selectedTimetable.group?.groupNum || 'N/A'}
              </p>
               <p>
                <strong>Lecturer:</strong> {selectedTimetable.lecturer?.lecturerName || 'N/A'}
              </p>
              <p>
                <strong>Day:</strong> {selectedTimetable.day}
              </p>
               <p>
                <strong>Time:</strong> {selectedTimetable.startTime} - {selectedTimetable.endTime}
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
