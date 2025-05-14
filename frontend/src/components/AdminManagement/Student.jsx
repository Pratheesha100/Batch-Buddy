import React, { useEffect, useState } from "react";
import Nav from "./Navigation/Navbar";
import Header from "./Navigation/Header";
import Footer from "./Navigation/Footer";
import { motion } from "framer-motion";
import { Users, PlusCircle, Trash2, Pencil, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import "./timetable.css";

// Updated color scheme to match the theme
const cardColors = [
  { bg: "#e0e7ff", icon: "#4f46e5" }, // Total Students - Indigo
  { bg: "#dcfce7", icon: "#16a34a" }, // Added Today - Green
  { bg: "#FFD6C7", icon: "#d97706" }, // Updated Today - Amber
  { bg: "#FDC7ED", icon: "#dc2626" }, // Deleted Today - Red
];

function Student() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(50);

  // Fetch faculties
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/getFaculties");
        if (!res.ok) throw new Error("Failed to fetch faculties");
        const data = await res.json();
        setFaculties(data);
      } catch (err) {
        console.error("Error fetching faculties:", err);
      }
    };
    fetchFaculties();
  }, []);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:5000/api/admin/students");
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Filter students by search and faculty
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFaculty = selectedFaculty === "all" || student.faculty?._id === selectedFaculty;
    
    return matchesSearch && matchesFaculty;
  });

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredStudents.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredStudents.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Reset to first page when search or faculty filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedFaculty]);

  return (
    <div className="admin-dashboard-container">
      <Nav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`admin-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        <div className="admin-maincontent-container">
          <div className="admin-page-name">
            <h2>Student Management</h2>
          </div>

          {/* Cards */}
          <div className="admin-main-top-content">
            <div className="admin-cards-container">
              {[0, 1, 2, 3].map((idx) => (
                <motion.div
                  key={idx}
                  className="admin-card"
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="admin-card-text">
                    <div className="admin-card-title">
                      {idx === 0 ? 'Total Students' : idx === 1 ? 'Added Today' : idx === 2 ? 'Updated Today' : 'Deleted Today'}
                    </div>
                    <div className="admin-card-value">
                      {idx === 0 ? filteredStudents.length : '-'}
                    </div>
                  </div>
                  <div className="admin-card-icon" style={{ backgroundColor: cardColors[idx].bg }}>
                    {idx === 0 && <Users size={29} style={{ color: cardColors[idx].icon }} />}
                    {idx === 1 && <PlusCircle size={28} style={{ color: cardColors[idx].icon }} />}
                    {idx === 2 && <Pencil size={27} style={{ color: cardColors[idx].icon }} />}
                    {idx === 3 && <Trash2 size={27} style={{ color: cardColors[idx].icon }} />}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Search, Filter and Add */}
          <div className="admin-main-middle-content">
            <div className="admin-main-addtimetable-container">
              <motion.button
                className="admin-btnn admin-add-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                // onClick={handleAddStudent}
              >
                <PlusCircle size={21} /> Add New Student
              </motion.button>
            </div>
            <div className="flex items-center gap-4">
              <div className="admin-search-container">
                <Search size={20} style={{ color: '#6c757d' }} />
                <input
                  type="text"
                  placeholder="Search students"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent outline-none w-full"
                  style={{ color: '#212529' }}
                />
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm ">
                <Filter size={18} style={{ color: '#6c757d' }} />
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="bg-transparent outline-none text-gray-400 text-[14px]"
                >
                  <option value="all">All Faculties</option>
                  {faculties.map(faculty => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.facultyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="admin-main-bottom-content">
            <div className="admin-main-timetable-container">
              <h2>Students {selectedFaculty !== "all" && `- ${faculties.find(f => f._id === selectedFaculty)?.facultyName}`}</h2>
              {loading ? (
                <div className="text-center py-8" style={{ color: '#6c757d' }}>Loading...</div>
              ) : error ? (
                <div className="text-center py-8" style={{ color: '#ef4444' }}>{error}</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="admin-timetable">
                      <thead>
                        <tr>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Contact Number</th>
                          <th>Address</th>
                          <th>Birthday</th>
                          <th>Degree</th>
                          <th>Faculty</th>
                          <th>Batch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center py-6" style={{ color: '#adb5bd' }}>No students found.</td>
                          </tr>
                        ) : (
                          currentRecords.map(student => (
                            <tr key={student._id}>
                              <td>{student.studentId}</td>
                              <td>{student.studentName}</td>
                              <td>{student.email}</td>
                              <td>{student.contactNumber}</td>
                              <td>{student.address}</td>
                              <td>{new Date(student.birthday).toLocaleDateString()}</td>
                              <td>{student.degree?.degreeName || '-'}</td>
                              <td>{student.faculty?.facultyName || '-'}</td>
                              <td>{student.batch?.batchType || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 px-4">
                      <div className="text-sm text-gray-600">
                        Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredStudents.length)} of {filteredStudents.length} entries
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
                            const maxPagesToShow = 7; // Number of page buttons to show
                            let startPage, endPage;

                            if (totalPages <= maxPagesToShow) {
                              startPage = 1;
                              endPage = totalPages;
                            } else {
                              const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
                              const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;

                              if (currentPage <= maxPagesBeforeCurrent) {
                                startPage = 1;
                                endPage = maxPagesToShow;
                              } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
                                startPage = totalPages - maxPagesToShow + 1;
                                endPage = totalPages;
                              } else {
                                startPage = currentPage - maxPagesBeforeCurrent;
                                endPage = currentPage + maxPagesAfterCurrent;
                              }
                            }

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
                </>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Student;
