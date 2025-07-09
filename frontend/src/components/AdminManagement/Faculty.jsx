import React, { useEffect, useState } from "react";
import Nav from "./Navigation/Navbar";
import Header from "./Navigation/Header";
import Footer from "./Navigation/Footer";
import { motion } from "framer-motion";
import { School, PlusCircle, Trash2, Pencil, Search, ChevronLeft, ChevronRight } from "lucide-react";
import "./timetable.css";


// Color hex codes for cards
const cardColors = [
  { bg: "#D0B4F8", icon: "#6A08F4" }, // Total Faculties - Light Blue
  { bg: "#86FBAF", icon: "#398554" }, // Added Today - Light Teal
  { bg: "#FDDB75", icon: "#947004" }, // Updated Today - Light Yellow
  { bg: "#F9A3DF", icon: "#7B0758" }, // Deleted Today - Light Pink
];

function Faculty() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(15); // Adjust as needed

  useEffect(() => {
    const fetchFaculties = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:5000/api/admin/getFaculties");
        if (!res.ok) throw new Error("Failed to fetch faculties");
        const data = await res.json();
        setFaculties(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculties();
  }, []);

  // Filter faculties by search
  const filteredFaculties = faculties.filter(faculty =>
    faculty.facultyName?.toLowerCase().includes(search.toLowerCase()) ||
    faculty.facultyCode?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredFaculties.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredFaculties.length / recordsPerPage);

  // Change page handlers
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Card shadow styles
  const cardShadow = "0px 2px 10px rgba(0,0,0,0.1)";
  const cardShadowHover = "0px 6px 15px rgba(0,0,0,0.2)";

  return (
    <div className="admin-dashboard-container">
      <Nav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`admin-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        <div className="admin-maincontent-container">
          <div className="admin-page-name">
            <h2>Faculty Management</h2>
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
                      {idx === 0 ? 'Total Faculties' : idx === 1 ? 'Added Today' : idx === 2 ? 'Updated Today' : 'Deleted Today'}
                    </div>
                    <div className="admin-card-value">
                      {idx === 0 ? faculties.length : '-'}
                    </div>
                  </div>
                  <div className="admin-card-icon" style={{ backgroundColor: cardColors[idx].bg }}>
                    {idx === 0 && <School size={29} style={{ color: cardColors[idx].icon }} />}
                    {idx === 1 && <PlusCircle size={28} style={{ color: cardColors[idx].icon }} />}
                    {idx === 2 && <Pencil size={27} style={{ color: cardColors[idx].icon }} />}
                    {idx === 3 && <Trash2 size={27} style={{ color: cardColors[idx].icon }} />}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Search and Add */}
          <div className="admin-main-middle-content">
            <div className="admin-main-addtimetable-container">
              <motion.button
                className="admin-btnn admin-add-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                // onClick={handleAddFaculty}
              >
                <PlusCircle size={21} /> Add New Faculty
              </motion.button>
            </div>
            <div className="admin-search-container">
              <Search size={20} style={{ color: '#6c757d' }} />
              <input
                type="text"
                placeholder="Search faculties"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none w-full"
                style={{ color: '#212529' }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="admin-main-bottom-content">
            <div className="admin-main-timetable-container">
              <h2>Faculties</h2>
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
                          <th>Faculty ID</th>
                          <th>Faculty Name</th>
                          <th>Faculty Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="text-center py-6" style={{ color: '#adb5bd' }}>No faculties found.</td>
                          </tr>
                        ) : (
                          currentRecords.map(faculty => (
                            <tr key={faculty.id || faculty._id}>
                              <td>{faculty.id || faculty._id}</td>
                              <td>{faculty.facultyName}</td>
                              <td>{faculty.facultyCode}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 px-4">
                      <div className="text-sm text-gray-600">
                        Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredFaculties.length)} of {filteredFaculties.length} entries
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

export default Faculty;
